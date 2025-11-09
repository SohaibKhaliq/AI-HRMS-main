import express from "express";
import {
  createTraining,
  getTraining,
} from "../controllers/training.controller.js";

const router = express.Router();

router.post("/", createTraining);
router.get("/:id", getTraining);

export default router;
