import express from "express";
import { verifyAdminToken, verifyEmployeeToken } from "../middlewares/index.js";
import {
  createLeaveType,
  getAllLeaveTypes,
  getLeaveTypeById,
  updateLeaveType,
  deleteLeaveType,
} from "../controllers/leaveType.controller.js";

const router = express.Router();

router.post("/", verifyAdminToken, createLeaveType);
router.get("/", verifyEmployeeToken, getAllLeaveTypes); // Employees need to see leave types too
router.get("/:id", verifyEmployeeToken, getLeaveTypeById);
router.patch("/:id", verifyAdminToken, updateLeaveType);
router.delete("/:id", verifyAdminToken, deleteLeaveType);

export default router;
