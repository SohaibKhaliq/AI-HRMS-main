import express from "express";
import { verifyAdminToken, verifyEmployeeToken } from "../middlewares/index.js";
import {
  createMeeting,
  getAllMeetings,
  getMyMeetings,
  getMeetingById,
  updateMeeting,
  updateParticipantStatus,
  deleteMeeting,
} from "../controllers/meeting.controller.js";

const router = express.Router();

router.post("/", verifyAdminToken, createMeeting);
router.get("/", verifyAdminToken, getAllMeetings);
router.get("/my", verifyEmployeeToken, getMyMeetings);
router.get("/:id", verifyEmployeeToken, getMeetingById);
router.patch("/:id", verifyAdminToken, updateMeeting);
router.patch("/:id/status", verifyEmployeeToken, updateParticipantStatus);
router.delete("/:id", verifyAdminToken, deleteMeeting);

export default router;
