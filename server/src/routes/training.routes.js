import express from "express";
import {
  createTraining,
  getTraining,
  getAllTrainings,
} from "../controllers/training.controller.js";
import { verifyAdminToken } from "../middlewares/index.js";

const router = express.Router();

router.post("/", verifyAdminToken, createTraining);
router.get("/", verifyAdminToken, getAllTrainings);
router.get("/:id", verifyAdminToken, getTraining);

export default router;
