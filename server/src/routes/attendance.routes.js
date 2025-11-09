import express from "express";
import {
  markAttendance,
  getAttendanceList,
  markAbsentAtEndOfDay,
  getEmployeeAttendance,
  markAttendanceByQrCode,
  genrateQrCodeForAttendance,
  getMonthlyAttendancePercentage,
  getEmployeeAttendanceByDepartment,
  getEmployeeMonthAttendanceByDepartment,
  registerFaceDescriptor,
  getFaceDescriptor,
  markAttendanceByFace,
  unregisterOwnFace,
  unregisterFaceForEmployee,
} from "../controllers/attendance.controller.js";
import {
  verifyAdminToken,
  verifyCornJob,
  verifyEmployeeToken,
} from "../middlewares/index.js";

const router = express.Router();

router.get("/", verifyAdminToken, getAttendanceList);
router.post("/mark", verifyAdminToken, markAttendance);
router.post("/mark-absent", verifyCornJob, markAbsentAtEndOfDay);
router.get("/employee", verifyEmployeeToken, getEmployeeAttendance);
router.post("/mark/qr", verifyEmployeeToken, markAttendanceByQrCode);
router.get("/month", verifyAdminToken, getMonthlyAttendancePercentage);
router.post("/generate", verifyEmployeeToken, genrateQrCodeForAttendance);
router.get("/department", verifyAdminToken, getEmployeeAttendanceByDepartment);
router.get(
  "/month/department",
  verifyAdminToken,
  getEmployeeMonthAttendanceByDepartment
);

// Face recognition routes
router.post("/face/register", verifyEmployeeToken, registerFaceDescriptor);
router.get("/face/descriptor", verifyEmployeeToken, getFaceDescriptor);
router.post("/mark/face", verifyEmployeeToken, markAttendanceByFace);
router.delete("/face", verifyEmployeeToken, unregisterOwnFace);
router.delete("/face/:employeeId", verifyAdminToken, unregisterFaceForEmployee);

export default router;
