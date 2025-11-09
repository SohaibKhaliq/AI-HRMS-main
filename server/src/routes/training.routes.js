import express from "express";
import {
  createTraining,
  getTraining,
  getAllTrainings,
  getMyTrainings,
  getTrainingForEmployee,
} from "../controllers/training.controller.js";
import { verifyAdminToken, verifyEmployeeToken } from "../middlewares/index.js";

const router = express.Router();

router.post("/", verifyAdminToken, createTraining);
router.get("/", verifyAdminToken, getAllTrainings);
router.get("/my", verifyEmployeeToken, getMyTrainings);
router.get("/:id/my", verifyEmployeeToken, getTrainingForEmployee);
router.get("/:id", verifyAdminToken, getTraining);

export default router;
