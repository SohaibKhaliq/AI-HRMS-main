import express from "express";
import { verifyAdminToken } from "../middlewares/index.js";
import {
  createShift,
  getAllShifts,
  getShiftById,
  updateShift,
  deleteShift,
} from "../controllers/shift.controller.js";

const router = express.Router();

router.post("/", verifyAdminToken, createShift);
router.get("/", verifyAdminToken, getAllShifts);
router.get("/:id", verifyAdminToken, getShiftById);
router.patch("/:id", verifyAdminToken, updateShift);
router.delete("/:id", verifyAdminToken, deleteShift);

export default router;
