import express from "express";
import {
  createJob,
  getAllJobs,
  getJobById,
  createApplicant,
  updateJobStatus,
  getJobApplications,
  inviteForInterview,
  updateApplicationStatus,
} from "../controllers/recruitment.controller.js";
import { categories, types, locations } from "../controllers/jobmeta.controller.js";
import { verifyAdminToken } from "../middlewares/index.js";
import { uploadResume } from "../config/index.js";

const router = express.Router();

router.get("/", getAllJobs);
router.get("/:id", getJobById);
router.post("/", verifyAdminToken, createJob);
router.patch("/:id/status", verifyAdminToken, updateJobStatus);
router.get("/:id/applicants", verifyAdminToken, getJobApplications);
router.post("/:id/apply", uploadResume.single("resume"), createApplicant);
router.patch(
  "/:jobId/applicants/:applicantId/status",
  verifyAdminToken,
  updateApplicationStatus
);
router.post(
  "/:jobId/applicants/:applicantId/invite",
  verifyAdminToken,
  inviteForInterview
);

// Job meta endpoints (admin)
router.get("/categories", verifyAdminToken, categories.list);
router.post("/categories", verifyAdminToken, categories.create);
router.patch("/categories/:id", verifyAdminToken, categories.update);
router.delete("/categories/:id", verifyAdminToken, categories.remove);

router.get("/types", verifyAdminToken, types.list);
router.post("/types", verifyAdminToken, types.create);
router.patch("/types/:id", verifyAdminToken, types.update);
router.delete("/types/:id", verifyAdminToken, types.remove);

router.get("/locations", verifyAdminToken, locations.list);
router.post("/locations", verifyAdminToken, locations.create);
router.patch("/locations/:id", verifyAdminToken, locations.update);
router.delete("/locations/:id", verifyAdminToken, locations.remove);

export default router;
