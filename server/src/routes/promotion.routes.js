import express from "express";
import { verifyAdminToken } from "../middlewares/index.js";
import { uploadDocument } from "../config/index.js";
import {
  createPromotion,
  getAllPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
} from "../controllers/promotion.controller.js";

const router = express.Router();

router.post("/", verifyAdminToken, uploadDocument.single("document"), createPromotion);
router.get("/", verifyAdminToken, getAllPromotions);
router.get("/:id", verifyAdminToken, getPromotionById);
router.patch("/:id", verifyAdminToken, uploadDocument.single("document"), updatePromotion);
router.delete("/:id", verifyAdminToken, deletePromotion);

export default router;
