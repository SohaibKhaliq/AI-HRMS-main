import express from "express";
import { verifyAdminToken, verifyEmployeeToken } from "../middlewares/index.js";
import {
  initializeEmployeeBalance,
  getEmployeeBalance,
  getMyBalance,
  updateBalance,
  adjustBalance,
  carryForwardBalances,
  deleteBalance,
  getAllBalances,
} from "../controllers/leaveBalance.controller.js";

const router = express.Router();

router.post("/initialize", verifyAdminToken, initializeEmployeeBalance);
router.post("/adjust", verifyAdminToken, adjustBalance);
router.post("/carry-forward", verifyAdminToken, carryForwardBalances);
router.get("/my", verifyEmployeeToken, getMyBalance);
router.get("/all", verifyAdminToken, getAllBalances);
router.get("/employee/:employeeId", verifyAdminToken, getEmployeeBalance);
router.patch("/:id", verifyAdminToken, updateBalance);
router.delete("/:id", verifyAdminToken, deleteBalance);

export default router;
