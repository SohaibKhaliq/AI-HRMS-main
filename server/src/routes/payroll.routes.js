import express from "express";
import {
  markAsPaid,
  createPayroll,
  updatePayroll,
  getAllPayrolls,
  getPayrollByEmployee,
  getEmployeePayrollHistory,
  generatePayrollForNextYear,
} from "../controllers/payroll.controller.js";
import { verifyAdminToken, verifyEmployeeToken, verifyCornJob } from "../middlewares/index.js";

const router = express.Router();

router.get("/", verifyEmployeeToken, getAllPayrolls); // Allow employees to view their own payroll
router.post("/", verifyAdminToken, createPayroll);
router.patch("/:payrollId", verifyAdminToken, updatePayroll);
router.patch("/:payrollId/pay", verifyAdminToken, markAsPaid);
router.get("/employee", verifyAdminToken, getPayrollByEmployee);
router.post("/generate", verifyCornJob, generatePayrollForNextYear);
router.get("/history/:employee", verifyAdminToken, getEmployeePayrollHistory);

export default router;
