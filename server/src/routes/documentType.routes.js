import express from "express";
import { verifyAdminToken } from "../middlewares/index.js";
import {
  createDocumentType,
  getAllDocumentTypes,
  getDocumentTypeById,
  updateDocumentType,
  deleteDocumentType,
} from "../controllers/documentType.controller.js";

const router = express.Router();

router.post("/", verifyAdminToken, createDocumentType);
router.get("/", verifyAdminToken, getAllDocumentTypes);
router.get("/:id", verifyAdminToken, getDocumentTypeById);
router.patch("/:id", verifyAdminToken, updateDocumentType);
router.delete("/:id", verifyAdminToken, deleteDocumentType);

export default router;
