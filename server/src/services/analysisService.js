import { pipeline } from "@xenova/transformers";
import keywordExtractor from "keyword-extractor";
import RAKE from "rake-js";
import Bottleneck from "bottleneck";
import crypto from "crypto";

// Small LRU cache implemented with Map to avoid re-analyzing identical texts
const CACHE_SIZE = 1000;
const cache = new Map(); // key: textHash, value: { sentiment, topics }

// Simple in-process rate limiter for external model calls
const limiter = new Bottleneck({ minTime: 100 }); // 10 req/sec by default

let sentimentPipeline = null;

async function loadSentimentPipeline() {
  if (sentimentPipeline) return sentimentPipeline;
  // This will download model files on first run. Using the default small sentiment model is fine for PoC.
  // For efficiency, consider specifying a smaller model id here if needed.
  sentimentPipeline = await pipeline("sentiment-analysis");
  return sentimentPipeline;
}

export async function warmup() {
  // Preload model into memory at server startup to avoid first-request latency
  try {
    await loadSentimentPipeline();
    // keep one no-op call to ensure WASM is initialized (optional)
    // Note: do not warm up with huge text bodies; keep it short.
    await limiter.schedule(() => sentimentPipeline("good"));
    console.log("analysisService: sentiment pipeline warmed up");
  } catch (err) {
    console.warn("analysisService warmup failed:", err.message || err);
  }
}

/**
 * Pre-download model artifacts and provide simple progress messages via callback.
 * progressCb(message: string)
 */
export async function preDownloadModel(progressCb = (m) => console.log(m)) {
  progressCb("checking cached pipeline...");
  if (sentimentPipeline) {
    progressCb("pipeline already loaded");
    return;
  }

  try {
    progressCb("starting model download and initialization");

    // Provide a simple elapsed-time progress indicator while large files download.
    const startTs = Date.now();
    let lastReportedSec = -1;
    const ticker = setInterval(() => {
      const sec = Math.floor((Date.now() - startTs) / 1000);
      if (sec !== lastReportedSec) {
        lastReportedSec = sec;
        progressCb(`downloading... ${sec}s elapsed`);
      }
    }, 500);

    try {
      // The pipeline call will download model files into the transformers cache, if missing.
      // We call pipeline() which triggers the underlying model fetch and initialization.
      // Attempt download with retries to tolerate transient network issues
      const maxAttempts = 3;
      let lastErr = null;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          sentimentPipeline = await pipeline("sentiment-analysis");
          lastErr = null;
          break;
        } catch (e) {
          lastErr = e;
          const waitMs = 1000 * Math.pow(2, attempt - 1);
          progressCb(
            `model download attempt ${attempt} failed: ${
              e && e.message ? e.message : e
            }. retrying in ${waitMs / 1000}s...`
          );
          await new Promise((r) => setTimeout(r, waitMs));
        }
      }
      if (!sentimentPipeline && lastErr) {
        throw lastErr;
      }
      progressCb("model files fetched and pipeline created");

      // Run a tiny inference to finish WASM initialization
      await limiter.schedule(() => sentimentPipeline("this is a warmup"));
      progressCb("model warmup inference completed");
    } finally {
      clearInterval(ticker);
    }
  } catch (err) {
    progressCb(
      "model pre-download failed: " +
        (err && err.message ? err.message : String(err))
    );
    throw err;
  }
}

/**
 * Analyze sentiment using an open-source JS transformer runtime.
 * Returns a normalized score in [-1, 1] and a label.
 */
export async function analyzeSentiment(text) {
  if (!text || typeof text !== "string" || text.trim() === "") {
    return { score: 0, label: "neutral", raw: null };
  }

  // Check cache first
  const hash = crypto.createHash("sha256").update(text).digest("hex");
  if (cache.has(hash)) {
    const cached = cache.get(hash);
    // touch for LRU
    cache.delete(hash);
    cache.set(hash, cached);
    return cached.sentiment;
  }

  const p = await loadSentimentPipeline();

  // Run through the limiter to avoid hot loops
  const res = await limiter.schedule(() => p(text));

  // Pipeline typically returns an array of {label, score}
  const out = Array.isArray(res) ? res[0] : res;
  const labelRaw = (out && out.label) || "NEUTRAL";
  const scoreRaw = out && typeof out.score === "number" ? out.score : 0;

  const label = String(labelRaw).toLowerCase();
  let score = 0;
  if (label.includes("pos")) score = +scoreRaw; // 0..1
  else if (label.includes("neg")) score = -scoreRaw; // -1..0
  else score = 0;

  // Store in cache
  try {
    const cachedValue = { sentiment: { score, label, raw: out }, topics: null };
    cache.set(hash, cachedValue);
    // simple LRU eviction
    if (cache.size > CACHE_SIZE) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
  } catch (err) {
    // ignore cache errors
  }

  return { score, label, raw: out };
}

/**
 * Extract candidate topics/keywords from text using a JS extractor.
 * Returns top N keywords with simple frequency scoring.
 */
export function extractTopics(text, maxTopics = 5) {
  if (!text || typeof text !== "string" || text.trim() === "") return [];
  // Prefer RAKE (phrase-based) for topic extraction, fall back to simple keyword extractor
  try {
    const phrases = RAKE.generate(text);
    // RAKE returns an array of {phrase, score}
    const items = (phrases || []).map((p) => ({
      tag: p.phrase,
      score: p.score,
    }));
    items.sort((a, b) => b.score - a.score);
    return items.slice(0, maxTopics);
  } catch (err) {
    const words = keywordExtractor.extract(text, {
      language: "english",
      remove_digits: true,
      return_changed_case: true,
      remove_duplicates: false,
    });

    const freq = {};
    for (const w of words) {
      if (!w || w.length < 2) continue;
      freq[w] = (freq[w] || 0) + 1;
    }

    const items = Object.keys(freq).map((k) => ({ tag: k, score: freq[k] }));
    items.sort((a, b) => b.score - a.score);
    return items.slice(0, maxTopics);
  }
}

export default {
  analyzeSentiment,
  extractTopics,
  warmup,
};
