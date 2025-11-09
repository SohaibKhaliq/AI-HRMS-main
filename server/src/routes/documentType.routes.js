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
// Public: allow employees and guests to fetch document types (use ?status=active to filter)
router.get("/", getAllDocumentTypes);
router.get("/:id", verifyAdminToken, getDocumentTypeById);
router.patch("/:id", verifyAdminToken, updateDocumentType);
router.delete("/:id", verifyAdminToken, deleteDocumentType);

export default router;
