import jwt from "jsonwebtoken";
import { catchErrors } from "../utils/index.js";
import Session from "../models/session.model.js";
import Employee from "../models/employee.model.js";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 4,
  keyGenerator: (req) => {
    const employeeId = req.body.employeeId || "guest";
    return ipKeyGenerator(req) + ":" + employeeId;
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: async (req, res, next, options) => {
    const key = options.keyGenerator(req, res);
    const data = await options.store.get(key);

    let retryAfterSec = Math.ceil(options.windowMs / 1000);
    if (data && data.resetTime) {
      retryAfterSec = Math.ceil((data.resetTime.getTime() - Date.now()) / 1000);
    }

    const minutes = Math.floor(retryAfterSec / 60);
    const seconds = retryAfterSec % 60;

    res.status(options.statusCode).json({
      message: `Too many login attempts. Try again after ${minutes}m ${seconds}s.`,
    });
  },
});

const verifyEmployeeToken = catchErrors(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    const err = new Error("Unauthorized access");
    err.status = 401;
    throw err;
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (!decoded.employeeId) {
    const err = new Error("Unauthorized access");
    err.status = 401;
    throw err;
  }

  const session = await Session.findOne({
    userId: decoded.employeeId,
    authority: decoded.authority,
    token,
  });

  if (!session) {
    const err = new Error("Session expired, please login again");
    err.status = 401;
    throw err;
  }

  req.user = {
    id: decoded.employeeId,
    authority: decoded.authority,
    token,
  };

  // Backwards compatibility: some controllers expect req.employee._id
  // Provide a minimal employee object with _id to avoid undefined errors.
  req.employee = { _id: decoded.employeeId };

  next();
});

const verifyAdminToken = catchErrors(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    const err = new Error("Unauthorized access");
    err.status = 401;
    throw err;
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const session = await Session.findOne({
    userId: decoded.employeeId,
    authority: decoded.authority,
    token,
  });

  if (!session) {
    const err = new Error("Session expired, please login again");
    err.status = 401;
    throw err;
  }

  const user = await Employee.findById(decoded.employeeId);

  if (!user || !user.admin) {
    const err = new Error("Unauthorized access");
    err.status = 403;
    throw err;
  }

  req.user = {
    id: decoded.employeeId,
    authority: decoded.authority,
    token,
  };

  // Provide full employee document on req.employee for downstream handlers
  req.employee = user;

  next();
});

const verifyCornJob = catchErrors(async (req, res, next) => {
  const token = req.headers.secret ? String(req.headers.secret).trim() : null;

  if (!token || token !== process.env.CRON_SECRET) {
    const err = new Error("Unauthorized access");
    err.status = 401;
    throw err;
  }

  next();
});

export { verifyEmployeeToken, verifyAdminToken, loginLimiter, verifyCornJob };
