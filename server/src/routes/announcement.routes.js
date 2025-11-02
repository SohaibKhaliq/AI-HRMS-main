import express from "express";
import {
  getAnnouncements,
  createAnnouncement,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncementById,
} from "../controllers/announcement.controller.js";
import { verifyAdminToken } from "../middlewares/index.js";
import { uploadDocument } from "../config/index.js";

const router = express.Router();

router.get("/", getAnnouncements);
router.get("/:id", getAnnouncementById);
router.post("/", verifyAdminToken, uploadDocument.single("attachment"), createAnnouncement);
router.patch("/:id", verifyAdminToken, uploadDocument.single("attachment"), updateAnnouncement);
router.delete("/:id", verifyAdminToken, deleteAnnouncementById);

export default router;