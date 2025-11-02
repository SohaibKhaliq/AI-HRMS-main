import express from "express";
import { verifyAdminToken } from "../middlewares/index.js";
import {
  createResignation,
  getAllResignations,
  getResignationById,
  updateResignation,
  deleteResignation,
} from "../controllers/resignation.controller.js";

const router = express.Router();

router.post("/", verifyAdminToken, createResignation);
router.get("/", verifyAdminToken, getAllResignations);
router.get("/:id", verifyAdminToken, getResignationById);
router.patch("/:id", verifyAdminToken, updateResignation);
router.delete("/:id", verifyAdminToken, deleteResignation);

export default router;
