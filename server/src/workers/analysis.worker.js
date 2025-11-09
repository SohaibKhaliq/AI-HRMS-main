#!/usr/bin/env node
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../config/index.js";
import {
  fetchAndLockNextJob,
  fetchAndLockJobs,
  markJobDone,
  markJobFailed,
} from "../services/analysisQueue.service.js";
import {
  analyzeSentiment,
  extractTopics,
  warmup as analysisWarmup,
} from "../services/analysisService.js";
import { computeSubstituteCandidates } from "../services/substituteAnalysis.service.js";
import Feedback from "../models/feedback.model.js";
import Complaint from "../models/complaint.model.js";
import AnalysisJob from "../models/analysisJob.model.js";
import { myCache } from "../utils/index.js";

// Tunables
const BATCH_SIZE = 8; // number of jobs to fetch per loop
const CONCURRENCY = 3; // number of jobs to process in parallel
const SLEEP_MS = 500; // short sleep when queue empty

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const processSingle = async (job) => {
  const start = Date.now();
  try {
    if (!job) return { ok: false, error: "no-job" };
    const { type, refId } = job;

    if (type === "feedback") {
      const fb = await Feedback.findById(refId);
      if (!fb) throw new Error("Feedback not found");
      const text = fb.description || "";
      const sentiment = await analyzeSentiment(text);
      const topicResults = extractTopics(text, 5);
      fb.sentimentScore = sentiment.score;
      fb.sentimentLabel = sentiment.label;
      fb.topics = topicResults.map((t) => t.tag);
      fb.analysisMeta = { provider: "local-transformers" };
      fb.lastAnalyzedAt = new Date();
      await fb.save();
      // create a short safe snippet for UI to display
      var snippet = String(text || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 160);
    } else if (type === "complaint") {
      const cp = await Complaint.findById(refId);
      if (!cp) throw new Error("Complaint not found");
      const text = cp.complaintDetails || "";
      const sentiment = await analyzeSentiment(text);
      const topicResults = extractTopics(text, 5);
      cp.sentimentScore = sentiment.score;
      cp.sentimentLabel = sentiment.label;
      cp.topics = topicResults.map((t) => t.tag);
      cp.analysisMeta = { provider: "local-transformers" };
      cp.lastAnalyzedAt = new Date();
      await cp.save();
      // create a short safe snippet for UI to display
      var snippet = String(text || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 160);
    } else if (type === "substitute") {
      // Run substitute/succession analysis job
      // payload should contain necessary options (topK, scope, weights)
      const result = await computeSubstituteCandidates(job.payload || {});
      // persist result into the job document
      await AnalysisJob.findByIdAndUpdate(job._id, {
        result,
        analysisMeta: { provider: "internal" },
      });
      var snippet = `Substitute analysis computed: ${result.candidates.length} candidates`;
    }

    // Invalidate insights cache after each successful update
    try {
      myCache.del("insights");
    } catch (e) {
      /* no-op */
    }

    await markJobDone(job._id);
    const took = Date.now() - start;
    // Emit per-job structured event for parent process to forward (finer-grained progress)
    try {
      const evt = {
        event: "analysis:job",
        ts: new Date().toISOString(),
        job: {
          id: String(job._id),
          type: job.type,
          refId: String(job.refId),
          snippet,
        },
        result: { ok: true, took },
      };
      console.log("WORKER_EVENT:" + JSON.stringify(evt));
    } catch (e) {
      /* ignore logging errors */
    }

    return { ok: true, took };
  } catch (err) {
    try {
      await markJobFailed(job._id, err);
    } catch (e) {
      console.error(
        "Failed to mark job failed:",
        e && e.message ? e.message : e
      );
    }

    // Emit per-job failure event
    try {
      const evt = {
        event: "analysis:job",
        ts: new Date().toISOString(),
        job: {
          id: String(job._id),
          type: job.type,
          refId: String(job.refId),
          snippet: snippet || "",
        },
        result: {
          ok: false,
          error: err && err.message ? err.message : String(err),
        },
      };
      console.log("WORKER_EVENT:" + JSON.stringify(evt));
    } catch (e) {
      /* ignore logging errors */
    }

    return { ok: false, error: err && err.message ? err.message : String(err) };
  }
};

const main = async () => {
  await connectDB();
  console.log("Analysis worker connected to DB, starting loop...");

  // Warmup the analysis model once at startup (helps reduce first-job latency)
  try {
    console.log("Warming up analysis model...");
    await analysisWarmup();
    console.log("Model warmup complete");
  } catch (err) {
    console.warn(
      "Model warmup failed:",
      err && err.message ? err.message : err
    );
  }

  while (true) {
    try {
      // report pending queue length for progress visibility
      const pendingCount = await AnalysisJob.countDocuments({
        status: "pending",
      });
      if (!pendingCount) {
        // fast sleep when nothing to do
        await sleep(SLEEP_MS);
        continue;
      }

      // fetch a batch and lock them
      const jobs = await fetchAndLockJobs(BATCH_SIZE);
      if (!jobs || jobs.length === 0) {
        await sleep(SLEEP_MS);
        continue;
      }

      console.log(
        `Processing batch of ${jobs.length} jobs (pending=${pendingCount})`
      );

      // process in limited concurrency
      let index = 0;
      let processed = 0;
      const results = [];

      while (index < jobs.length) {
        const slice = jobs.slice(index, index + CONCURRENCY);
        const batchRes = await Promise.all(
          slice.map(async (j) => {
            const r = await processSingle(j);
            return { jobId: j._id, ...r };
          })
        );
        results.push(...batchRes);
        processed += batchRes.length;
        index += CONCURRENCY;
      }

      const ok = results.filter((r) => r.ok).length;
      const failed = results.length - ok;
      const batchSummary = { processed, ok, failed, pending: pendingCount };
      console.log(
        `Batch complete — processed=${processed}, ok=${ok}, failed=${failed}`
      );
      // Emit structured progress event for parent process to parse and forward
      try {
        const evt = {
          event: "analysis:batch",
          ts: new Date().toISOString(),
          summary: batchSummary,
        };
        console.log("WORKER_EVENT:" + JSON.stringify(evt));
      } catch (e) {
        // ignore
      }
    } catch (err) {
      console.error(
        "Worker loop error:",
        err && err.message ? err.message : err
      );
      await sleep(SLEEP_MS);
    }
  }
};

main().catch((err) => {
  console.error("Worker fatal error:", err && err.message ? err.message : err);
  process.exit(1);
});
