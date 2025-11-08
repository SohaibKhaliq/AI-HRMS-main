import express from "express";
import {
  analyzeSentiment,
  extractTopics,
} from "../services/analysisService.js";

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
