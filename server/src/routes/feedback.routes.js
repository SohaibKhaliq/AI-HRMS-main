import express from "express";
import { verifyAdminToken, verifyEmployeeToken } from "../middlewares/index.js";
import {
  getFeedbacks,
  createFeedback,
} from "../controllers/feedback.controller.js";

const router = express.Router();

// Employees can view all feedbacks (frontend filters to show only their own)
router.get("/", verifyEmployeeToken, getFeedbacks);
router.post("/", verifyEmployeeToken, createFeedback);

export default router;
