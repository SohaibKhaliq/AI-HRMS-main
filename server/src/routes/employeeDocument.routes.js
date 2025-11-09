import express from "express";
import { verifyAdminToken, verifyEmployeeToken } from "../middlewares/index.js";
import { uploadDocument as uploadMiddleware } from "../config/index.js";
import {
  uploadDocument,
  getEmployeeDocuments,
  getMyDocuments,
  getDocumentById,
  updateDocument,
  getAllDocuments,
  verifyDocument,
  deleteDocument,
  getExpiringDocuments,
} from "../controllers/employeeDocument.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyEmployeeToken,
  uploadMiddleware.single("document"),
  uploadDocument
);
router.get("/my", verifyEmployeeToken, getMyDocuments);
router.get("/employee/:employeeId", verifyAdminToken, getEmployeeDocuments);
router.get("/expiring", verifyAdminToken, getExpiringDocuments);
router.get("/", verifyAdminToken, getAllDocuments);
router.get("/:id", verifyEmployeeToken, getDocumentById);
router.patch(
  "/:id",
  verifyAdminToken,
  uploadMiddleware.single("document"),
  updateDocument
);
router.patch("/:id/verify", verifyAdminToken, verifyDocument);
router.delete("/:id", verifyEmployeeToken, deleteDocument);

export default router;
