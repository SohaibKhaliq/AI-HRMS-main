import express from "express";
import { verifyAdminToken } from "../middlewares/index.js";
import {
  createDocumentCategory,
  getAllDocumentCategories,
  updateDocumentCategory,
  deleteDocumentCategory,
} from "../controllers/documentCategory.controller.js";

const router = express.Router();

router.post("/", verifyAdminToken, createDocumentCategory);
router.get("/", verifyAdminToken, getAllDocumentCategories);
router.patch("/:id", verifyAdminToken, updateDocumentCategory);
router.delete("/:id", verifyAdminToken, deleteDocumentCategory);

export default router;
