import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import path from "path";
import express from "express";
import { createServer } from "http";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import cloudinary from "cloudinary";
import bodyParser from "body-parser";
import { connectDB } from "./config/index.js";
import { initializeSocket, getIO } from "./socket/index.js";
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
  analysis,
} from "./routes/index.routes.js";
import { warmup as analysisWarmup } from "./services/analysisService.js";
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
  "http://127.0.0.1:5173",
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
app.use("/api/analysis", analysis);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "welcome.html"));
});
console.log("JWT_SECRET:", process.env.JWT_SECRET);
const port = process.env.PORT || 3000;

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
initializeSocket(server);
console.log("✅ Socket.IO initialized");

connectDB()
  .then(() => {
    // Warm up analysis models in background (do not block server start).
    analysisWarmup().catch((err) => {
      console.warn(
        "analysis warmup error:",
        err && err.message ? err.message : err
      );
    });

    server.listen(port, () => {
      console.log(`Express running → On http://localhost:${port} 🚀`);
      console.log(`Socket.IO running → ws://localhost:${port} 🔌`);
      // Start analysis worker as a child process and keep it running
      try {
        const workerPath = path.join(
          __dirname,
          "workers",
          "analysis.worker.js"
        );
        let workerProc = null;
        let restartDelay = 1000; // 1s
        const maxDelay = 60 * 1000; // 1 minute

        const startWorker = () => {
          console.log("Starting analysis worker:", workerPath);
          workerProc = spawn(process.execPath, [workerPath], {
            cwd: __dirname,
            env: process.env,
            stdio: ["ignore", "pipe", "pipe"],
          });
          // Collect stdout chunks into a buffer so we can robustly parse
          // WORKER_EVENT:<json> messages even if JSON arrives split across chunks.
          let workerStdoutBuffer = "";
          workerProc.stdout.on("data", (chunk) => {
            const text = chunk.toString();
            process.stdout.write(`[worker] ${text}`);

            workerStdoutBuffer += text;
            const marker = "WORKER_EVENT:";

            // Extract all complete WORKER_EVENT JSON payloads from the buffer
            let markerIdx = workerStdoutBuffer.indexOf(marker);
            while (markerIdx !== -1) {
              const after = workerStdoutBuffer.slice(markerIdx + marker.length);
              // Try to find end of JSON by locating a newline after the marker
              const newlineIdx = after.indexOf("\n");
              if (newlineIdx === -1) {
                // No newline yet — wait for more data
                break;
              }
              const jsonText = after.slice(0, newlineIdx).trim();
              // Remove the processed part from buffer
              workerStdoutBuffer = after.slice(newlineIdx + 1);

              if (jsonText) {
                try {
                  const evt = JSON.parse(jsonText);
                  try {
                    const io = getIO();
                    console.log(
                      "[worker->socket] emitting analysis:progress",
                      evt
                    );
                    io.emit("analysis:progress", evt);
                  } catch (emitErr) {
                    // socket not available — ignore
                  }
                } catch (parseErr) {
                  // parse failed — skip this payload
                  console.debug(
                    "Failed to parse worker event JSON:",
                    parseErr && parseErr.message ? parseErr.message : parseErr
                  );
                }
              }

              markerIdx = workerStdoutBuffer.indexOf(marker);
            }
          });
          workerProc.stderr.on("data", (chunk) => {
            process.stderr.write(`[worker][err] ${chunk}`);
          });

          workerProc.on("exit", (code, signal) => {
            console.warn(
              `Analysis worker exited (code=${code}, signal=${signal}). Restarting in ${restartDelay}ms...`
            );
            setTimeout(() => {
              restartDelay = Math.min(maxDelay, restartDelay * 2);
              startWorker();
            }, restartDelay);
          });

          workerProc.on("error", (err) => {
            console.error(
              "Failed to start analysis worker:",
              err && err.message ? err.message : err
            );
          });
        };

        startWorker();
        // Run backfill once at startup and then periodically
        try {
          const backfillPath = path.join(
            __dirname,
            "..",
            "scripts",
            "analysis_backfill.js"
          );
          let backfillRunning = false;
          const BACKFILL_INTERVAL_MS = parseInt(
            process.env.BACKFILL_INTERVAL_MS || String(1000 * 60 * 60 * 6),
            10
          ); // default 6 hours

          const runBackfill = () => {
            if (backfillRunning) {
              console.log("Backfill already running — skipping this interval");
              return;
            }
            backfillRunning = true;
            console.log("Starting analysis backfill:", backfillPath);
            const bf = spawn(process.execPath, [backfillPath], {
              cwd: path.join(__dirname, ".."),
              env: process.env,
              stdio: ["ignore", "pipe", "pipe"],
            });

            bf.stdout.on("data", (chunk) => {
              const t = chunk.toString();
              process.stdout.write(`[backfill] ${t}`);
              // emit simple event for UI if desired
              try {
                const io = getIO();
                io.emit("analysis:backfill", { text: t });
              } catch (e) {
                // ignore
              }
            });
            bf.stderr.on("data", (c) =>
              process.stderr.write(`[backfill][err] ${c}`)
            );
            bf.on("exit", (code) => {
              backfillRunning = false;
              console.log(`Backfill exited with code=${code}`);
            });
          };

          // Run an initial backfill immediately, then schedule periodic runs
          setTimeout(runBackfill, 2000);
          setInterval(runBackfill, BACKFILL_INTERVAL_MS);
        } catch (err) {
          console.warn(
            "Could not schedule backfill:",
            err && err.message ? err.message : err
          );
        }
      } catch (err) {
        console.warn(
          "Could not start analysis worker:",
          err && err.message ? err.message : err
        );
      }
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
