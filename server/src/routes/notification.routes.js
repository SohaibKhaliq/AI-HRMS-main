import express from "express";
import { verifyAdminToken, verifyEmployeeToken } from "../middlewares/index.js";
import {
  getMyNotifications,
  markNotificationAsRead,
  getUnreadNotificationCount,
  createAdminNotification,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/my", verifyEmployeeToken, getMyNotifications);
router.get("/unread-count", verifyEmployeeToken, getUnreadNotificationCount);
router.patch("/:id/read", verifyEmployeeToken, markNotificationAsRead);
router.post("/", verifyAdminToken, createAdminNotification);

export default router;
