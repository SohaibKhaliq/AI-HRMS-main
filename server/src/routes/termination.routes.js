import express from "express";
import {
  createTermination,
  getAllTerminations,
  getTerminationById,
  updateTermination,
  deleteTermination,
} from "../controllers/termination.controller.js";
import { verifyAdminToken } from "../middlewares/index.js";
import { uploadDocument } from "../config/index.js";

const router = express.Router();

router.post(
  "/",
  verifyAdminToken,
  uploadDocument.single("document"),
  createTermination
);
router.get("/", getAllTerminations);
router.get("/:id", getTerminationById);
router.patch(
  "/:id",
  verifyAdminToken,
  uploadDocument.single("document"),
  updateTermination
);
router.delete("/:id", verifyAdminToken, deleteTermination);

export default router;
