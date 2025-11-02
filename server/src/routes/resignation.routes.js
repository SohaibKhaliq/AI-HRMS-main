import express from "express";
import { verifyAdminToken } from "../middlewares/index.js";
import { uploadDocument } from "../config/index.js";
import {
  createResignation,
  getAllResignations,
  getResignationById,
  updateResignation,
  deleteResignation,
} from "../controllers/resignation.controller.js";

const router = express.Router();

router.post("/", verifyAdminToken, uploadDocument.single("document"), createResignation);
router.get("/", verifyAdminToken, getAllResignations);
router.get("/:id", verifyAdminToken, getResignationById);
router.patch("/:id", verifyAdminToken, uploadDocument.single("document"), updateResignation);
router.delete("/:id", verifyAdminToken, deleteResignation);

export default router;
