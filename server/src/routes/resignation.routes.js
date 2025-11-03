import express from "express";
import { verifyAdminToken, verifyEmployeeToken } from "../middlewares/index.js";
import { uploadDocument } from "../config/index.js";
import {
  createResignation,
  getAllResignations,
  getResignationById,
  updateResignation,
  deleteResignation,
} from "../controllers/resignation.controller.js";

const router = express.Router();

// Employees can view all resignations (frontend filters to show only their own) and create their own
router.get("/", verifyEmployeeToken, getAllResignations);
router.post("/", verifyEmployeeToken, uploadDocument.single("document"), createResignation);

// Admin-only routes
router.get("/:id", verifyAdminToken, getResignationById);
router.patch("/:id", verifyAdminToken, uploadDocument.single("document"), updateResignation);
router.delete("/:id", verifyAdminToken, deleteResignation);

export default router;
