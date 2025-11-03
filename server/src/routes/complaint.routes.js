import express from "express";
import {
  getComplaints,
  createComplaint,
  respondComplaint,
  assignComplaintForResolution,
  updateComplaint,
  deleteComplaintById,
} from "../controllers/complaint.controller.js";
import { verifyAdminToken, verifyEmployeeToken } from "../middlewares/index.js";
import { uploadDocument } from "../config/index.js";

const router = express.Router();

// Employee routes - employees can view all complaints (filtered in frontend) and create their own
router.get("/", verifyEmployeeToken, getComplaints);
router.post("/", verifyEmployeeToken, uploadDocument.single("document"), createComplaint);
router.delete("/:id", verifyEmployeeToken, deleteComplaintById); // Employees can delete their own complaints

// Admin-only routes
router.patch("/:id", verifyAdminToken, uploadDocument.single("document"), updateComplaint);
router.patch("/:id/status", verifyAdminToken, respondComplaint);
router.patch("/:id/assign", verifyAdminToken, assignComplaintForResolution);

export default router;
