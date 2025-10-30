import express from "express";
import { verifyAdminToken } from "../middlewares/index.js";
import {
  createDesignation,
  getAllDesignations,
  getDesignationById,
  updateDesignation,
  deleteDesignation,
} from "../controllers/designation.controller.js";

const router = express.Router();

router.post("/", verifyAdminToken, createDesignation);
router.get("/", verifyAdminToken, getAllDesignations);
router.get("/:id", verifyAdminToken, getDesignationById);
router.patch("/:id", verifyAdminToken, updateDesignation);
router.delete("/:id", verifyAdminToken, deleteDesignation);

export default router;
