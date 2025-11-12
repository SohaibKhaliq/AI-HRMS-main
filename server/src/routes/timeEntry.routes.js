import express from "express";
import { verifyAdminToken, verifyEmployeeToken } from "../middlewares/index.js";
import {
  clockIn,
  clockOut,
  startBreak,
  endBreak,
  getMyTimeEntries,
  getAllTimeEntries,
  getTimeEntryById,
  updateTimeEntry,
  approveTimeEntry,
  deleteTimeEntry,
  getActiveClockIn,
  getAutoClosedEntries,
  reopenTimeEntry,
} from "../controllers/timeEntry.controller.js";

const router = express.Router();

router.post("/clock-in", verifyEmployeeToken, clockIn);
router.post("/clock-out", verifyEmployeeToken, clockOut);
router.post("/break/start", verifyEmployeeToken, startBreak);
router.post("/break/end", verifyEmployeeToken, endBreak);
router.get("/active", verifyEmployeeToken, getActiveClockIn);
router.get("/my", verifyEmployeeToken, getMyTimeEntries);
router.get("/", verifyAdminToken, getAllTimeEntries);
router.get("/auto-closed", verifyAdminToken, getAutoClosedEntries);
router.get("/:id", verifyEmployeeToken, getTimeEntryById);
router.patch("/:id", verifyAdminToken, updateTimeEntry);
router.patch("/:id/reopen", verifyAdminToken, reopenTimeEntry);
router.patch("/:id/approve", verifyAdminToken, approveTimeEntry);
router.delete("/:id", verifyAdminToken, deleteTimeEntry);

export default router;
