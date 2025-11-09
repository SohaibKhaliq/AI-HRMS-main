import express from "express";
import {
  analyzeSentiment,
  extractTopics,
} from "../services/analysisService.js";
import AnalysisJob from "../models/analysisJob.model.js";
import Feedback from "../models/feedback.model.js";
import Complaint from "../models/complaint.model.js";

const router = express.Router();

/**
 * POST /api/analysis/sentiment
 * Body: { text: string }
 */
router.post("/sentiment", async (req, res, next) => {
  try {
    const { text } = req.body || {};
    if (!text || typeof text !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "text is required" });
    }

    const result = await analyzeSentiment(text);
    return res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/analysis/topics
 * Body: { text: string, maxTopics?: number }
 */
router.post("/topics", (req, res, next) => {
  try {
    const { text, maxTopics } = req.body || {};
    if (!text || typeof text !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "text is required" });
    }

    const topics = extractTopics(text, Number(maxTopics) || 5);
    return res.json({ success: true, data: topics });
  } catch (err) {
    next(err);
  }
});

export default router;

// Additional admin helper: fetch a single analysis job and include the referenced document
router.get("/jobs/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "job id required" });

    const job = await AnalysisJob.findById(id).lean();
    if (!job)
      return res.status(404).json({ success: false, message: "job not found" });

    // include referenced document for convenience (safe to include a small projection)
    let refDoc = null;
    try {
      if (job.type === "feedback") {
        refDoc = await Feedback.findById(job.refId)
          .select("description sentimentScore sentimentLabel")
          .lean();
      } else if (job.type === "complaint") {
        refDoc = await Complaint.findById(job.refId)
          .select("complaintDetails sentimentScore sentimentLabel")
          .lean();
      }
    } catch (e) {
      // ignore ref doc fetch errors
    }

    return res.json({ success: true, job: { ...job, refDoc } });
  } catch (err) {
    next(err);
  }
});
