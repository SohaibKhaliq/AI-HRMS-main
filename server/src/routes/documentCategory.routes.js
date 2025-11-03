import express from "express";
import { verifyAdminToken } from "../middlewares/index.js";
import {
  createDocumentCategory,
  getDocumentCategories,
  updateDocumentCategory,
  deleteDocumentCategory,
} from "../controllers/documentCategory.controller.js";

const router = express.Router();

router.post("/", verifyAdminToken, createDocumentCategory);
router.get("/", verifyAdminToken, getDocumentCategories);
router.patch("/:id", verifyAdminToken, updateDocumentCategory);
router.delete("/:id", verifyAdminToken, deleteDocumentCategory);

export default router;
