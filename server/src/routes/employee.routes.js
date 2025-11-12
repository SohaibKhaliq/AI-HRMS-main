import express from "express";
import {
  updateProfile,
  updateEmployee,
  deleteEmployee,
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  bulkCreateEmployees,
  changeEmployeePassword,
  getPublicEmployees,
} from "../controllers/employee.controller.js";
import { upload } from "../config/index.js";
import { verifyAdminToken, verifyEmployeeToken } from "../middlewares/index.js";

const router = express.Router();

router.post("/", verifyAdminToken, createEmployee);
// Admin-only: list all employees with full details
router.get("/", verifyAdminToken, getAllEmployees);
// Public (authenticated employee) endpoint returning minimal employee info for UI dropdowns
router.get("/list", verifyEmployeeToken, getPublicEmployees);
router.post("/bulk", verifyAdminToken, bulkCreateEmployees);
router.patch(
  "/profile",
  verifyEmployeeToken,
  upload.single("profilePicture"),
  updateProfile
);
router.get("/:id", verifyEmployeeToken, getEmployeeById);
router.delete("/:id", verifyAdminToken, deleteEmployee);
router.patch("/:id", verifyEmployeeToken, updateEmployee);
router.post("/:id/change-password", verifyAdminToken, changeEmployeePassword);

export default router;
