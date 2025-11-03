import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import path from "path";
import express from "express";
import { fileURLToPath } from "url";
import cloudinary from "cloudinary";
import bodyParser from "body-parser";
import { connectDB } from "./config/index.js";
import {
  role,
  leave,
  payroll,
  employee,
  feedback,
  inshight,
  complaint,
  holiday,
  announcement,
  attendance,
  department,
  designation,
  documentType,
  performance,
  recruitment,
  authentication,
  promotion,
  resignation,
  termination,
  shift,
  leaveType,
  notification,
  meeting,
  employeeDocument,
  timeEntry,
  leaveBalance,
  documentCategory,
} from "./routes/index.routes.js";
import { swaggerUi, swaggerSpec } from "./doc/index.js";

// ========================================
// 🌱 DATA SEEDERS (Uncomment to use)
// ========================================
// import {
//   // Comprehensive HCM Seeders - Seeds all new modules at once
//   seedAllHCMData,
//   
//   // Individual HCM Seeders - Use for targeted seeding
//   seedShifts,
//   seedLeaveTypes,
//   seedLeaveBalances,
//   seedLeaves,
//   seedDocumentCategories,
//   seedEmployeeDocuments,
//   seedMeetings,
//   seedTimeEntries,
//   seedAttendance,
//   seedNotifications,
//   seedFeedback,
//   
//   // Legacy Seeders
//   deleteAllPayrollRecords,
//   generatePayrollDataForYear,
//   generatePayrollDataForMonths,
//   deleteTodayAttendanceRecords,
//   generateTerminationData,
//   generateComplaintData,
//   generateHolidayData,
//   generateAnnouncementData,
// } from "./seeders/index.js";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:8000",
  "http://localhost:5173",
  "http://127.0.0.1:8000",
  "http://127.0.0.1:5173"
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
  })
);

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ========================================
// 🌱 RUN SEEDERS (Uncomment what you need)
// ========================================
// 
// Seed ALL HCM modules at once (recommended for fresh setup):
// seedAllHCMData();
//
// OR seed individual modules:
// seedShifts();
// seedLeaveTypes();
// seedLeaveBalances();
// seedLeaves();
// seedDocumentCategories();
// seedEmployeeDocuments();
// seedMeetings();
// seedTimeEntries();
// seedAttendance();
// seedNotifications();
// seedFeedback();
// generateHolidayData();
// generateAnnouncementData();
// generateComplaintData();
// generateTerminationData();
//
// Legacy seeders:
// deleteAllPayrollRecords();
// deleteTodayAttendanceRecords();
// generatePayrollDataForMonths(8);
// generatePayrollDataForYear(2025);

app.use("/api/roles", role);
app.use("/api/leaves", leave);
app.use("/api/payrolls", payroll);
app.use("/api/insights", inshight);
app.use("/api/employees", employee);
app.use("/api/feedbacks", feedback);
app.use("/api/auth", authentication);
app.use("/api/complaints", complaint);
app.use("/api/holidays", holiday);
app.use("/api/announcements", announcement);
app.use("/api/attendance", attendance);
app.use("/api/departments", department);
app.use("/api/designations", designation);
app.use("/api/document-types", documentType);
app.use("/api/promotions", promotion);
app.use("/api/resignations", resignation);
app.use("/api/terminations", termination);
app.use("/api/performance", performance);
app.use("/api/recruitment", recruitment);
app.use("/api/shifts", shift);
app.use("/api/leave-types", leaveType);
app.use("/api/notifications", notification);
app.use("/api/meetings", meeting);
app.use("/api/employee-documents", employeeDocument);
app.use("/api/time-entries", timeEntry);
app.use("/api/leave-balances", leaveBalance);
app.use("/api/document-categories", documentCategory);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "welcome.html"));
});
console.log('JWT_SECRET:', process.env.JWT_SECRET);
const port = process.env.PORT || 3000;
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Express running → On http://localhost:${port} 🚀`);
    });
  })
  .catch((err) => {
    console.error(err.message);
  });

app.use((req, res, next) => {
  const error = new Error("404 Endpoint Not Found");
  error.status = 404;
  next(error.message);
});

app.use((err, req, res, next) => {
  const message = err || "Internal server error";
  res.status(500).json({
    success: false,
    message,
  });
});
