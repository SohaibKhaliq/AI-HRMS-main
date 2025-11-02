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

router.get("/", verifyAdminToken, getComplaints);
router.post("/", verifyAdminToken, uploadDocument.single("document"), createComplaint);
router.patch("/:id", verifyAdminToken, uploadDocument.single("document"), updateComplaint);
router.delete("/:id", verifyAdminToken, deleteComplaintById);
router.patch("/:id/status", verifyAdminToken, respondComplaint);
router.patch("/:id/assign", verifyAdminToken, assignComplaintForResolution);

export default router;
