import express from "express";
import { verifyAdminToken, verifyEmployeeToken } from "../middlewares/index.js";
import {
  createDocumentCategory,
  getAllDocumentCategories,
  updateDocumentCategory,
  deleteDocumentCategory,
} from "../controllers/documentCategory.controller.js";

const router = express.Router();

router.post("/", verifyAdminToken, createDocumentCategory);
router.get("/", verifyEmployeeToken, getAllDocumentCategories); // Employees need to see document categories too
router.patch("/:id", verifyAdminToken, updateDocumentCategory);
router.delete("/:id", verifyAdminToken, deleteDocumentCategory);

export default router;
