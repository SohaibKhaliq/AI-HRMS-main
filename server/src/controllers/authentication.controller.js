import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import * as bcrypt from "bcrypt";
import { catchErrors, generateQrCode } from "../utils/index.js";
import Session from "../models/session.model.js";
import Employee from "../models/employee.model.js";
import OTP from "../models/otp.model.js";
import { passwordRecovery, resetPasswordSuccess, sendLoginOTP } from "../templates/index.js";

const login = catchErrors(async (req, res) => {
  const { employeeId, password, authority, remember } = req.body;

  if (!employeeId || !password || !authority)
    throw new Error("Please provide all fields");

  const employee = await Employee.findOne({ employeeId })
    .populate("department", "name")
    .populate("role", "name")
    .populate("shift", "name startTime endTime graceTime");

  if (!employee)
    throw new Error(
      "Invalid credentials, try again with the correct credentials"
    );

  if (authority.toLowerCase() === "admin" && !employee.admin)
    throw new Error("Unauthorize access");

  const comparePassword = await bcrypt.compare(password, employee.password);

  if (!comparePassword)
    throw new Error(
      "Invalid credentials, try again with the correct credentials"
    );

  const token = jwt.sign(
    { employeeId: employee._id, authority },
    process.env.JWT_SECRET,
    { expiresIn: remember ? "10d" : "1d" }
  );

  await Session.create({
    userId: employee._id,
    authority,
    token,
  });

  await employee.save();

  return res.status(200).json({
    success: true,
    message: "Logged in successfuly 🔑",
    token,
    remember,
    user: {
      _id: employee._id,
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      department: employee.department,
      position: employee.role,
      shift: employee.shift,
      profilePicture: employee.profilePicture,
      authority: authority.toLowerCase(),
    },
  });
});

// Start MFA login - send OTP to user email
const startLogin = catchErrors(async (req, res) => {
  const { employeeId, password, authority } = req.body;

  if (!employeeId || !password || !authority)
    throw new Error("Please provide all fields");

  const employee = await Employee.findOne({ employeeId }).select("name email password admin");

  if (!employee) throw new Error("Invalid credentials, try again with the correct credentials");

  if (authority.toLowerCase() === "admin" && !employee.admin)
    throw new Error("Unauthorize access");

  const comparePassword = await bcrypt.compare(password, employee.password);
  if (!comparePassword)
    throw new Error("Invalid credentials, try again with the correct credentials");

  // Remove previous OTPs
  await OTP.deleteMany({ employeeId: employee._id });

  // Create code and save as hashed
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
  const codeHash = await bcrypt.hash(code, 10);

  const otp = await OTP.create({
    employeeId: employee._id,
    codeHash,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  });

  // Send code via email
  await sendLoginOTP({ email: employee.email, name: employee.name, code });

  return res.status(200).json({
    success: true,
    message: "OTP sent to your registered email. Please enter the OTP to continue.",
    employeeId: employee._id,
    authority,
  });
});

// Verify OTP and finalize login
const verifyOtp = catchErrors(async (req, res) => {
  const { employeeId, code, authority, remember } = req.body;

  if (!employeeId || !code) throw new Error("EmployeeId and OTP are required");

  const employee = await Employee.findById(employeeId)
    .populate("department", "name")
    .populate("role", "name")
    .populate("shift", "name startTime endTime graceTime");

  if (!employee) throw new Error("Employee not found");

  if (authority && authority.toLowerCase() === "admin" && !employee.admin)
    throw new Error("Unauthorize access");

  const otp = await OTP.findOne({ employeeId }).sort({ createdAt: -1 });
  if (!otp) throw new Error("No OTP request found. Please request a new code.");

  if (otp.expiresAt < new Date()) {
    await OTP.deleteMany({ employeeId });
    throw new Error("OTP expired. Please request a new code.");
  }

  const valid = await bcrypt.compare(code, otp.codeHash);
  if (!valid) {
    otp.attempts = (otp.attempts || 0) + 1;
    await otp.save();
    if (otp.attempts >= 5) {
      await OTP.deleteMany({ employeeId });
      throw new Error("Too many invalid attempts. Please request a new OTP.");
    }

    throw new Error("Invalid OTP. Please check and try again.");
  }

  // OTP valid - remove otp entry
  await OTP.deleteMany({ employeeId });

  const token = jwt.sign(
    { employeeId: employee._id, authority: authority || "employee" },
    process.env.JWT_SECRET,
    { expiresIn: remember ? "10d" : "1d" }
  );

  await Session.create({ userId: employee._id, authority: authority || "employee", token });

  await employee.save();

  return res.status(200).json({
    success: true,
    message: "Logged in successfully",
    token,
    remember,
    user: {
      _id: employee._id,
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      department: employee.department,
      position: employee.role,
      shift: employee.shift,
      profilePicture: employee.profilePicture,
      authority: (authority || "employee").toLowerCase(),
    },
  });
});

// Resend OTP
const resendOtp = catchErrors(async (req, res) => {
  const { employeeId } = req.body;
  if (!employeeId) throw new Error("Employee Id is required");

  const employee = await Employee.findById(employeeId).select("name email");
  if (!employee) throw new Error("Employee not found");

  // Remove previous OTPs
  await OTP.deleteMany({ employeeId });

  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
  const codeHash = await bcrypt.hash(code, 10);

  await OTP.create({ employeeId, codeHash, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
  await sendLoginOTP({ email: employee.email, name: employee.name, code });

  return res.status(200).json({ success: true, message: "OTP resent successfully" });
});

const updatePassword = catchErrors(async (req, res) => {
  const { credentials } = req.body;
  const id = req.user;

  if (!credentials) throw new Error("All fields are required");

  const { newPassword, oldPassword, confirmPassword } = credentials;

  if (newPassword !== confirmPassword) throw new Error("Passwords don't match");

  const employee = await Employee.findById(id);

  const isOldPasswordValid = await bcrypt.compare(
    oldPassword,
    employee.password
  );
  if (!isOldPasswordValid) throw new Error("Invalid credentials");

  const isNewPasswordSameAsOld = await bcrypt.compare(
    newPassword,
    employee.password
  );
  if (isNewPasswordSameAsOld)
    throw new Error("New password cannot be the same as the old password");

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  employee.password = hashedPassword;
  await employee.save();

  await resetPasswordSuccess({ email: employee.email, name: employee.name });

  return res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

const logout = catchErrors(async (req, res) => {
  const user = req.user;

  await Session.findOneAndDelete({
    userId: user.id,
    authority: user.authority,
    token: user.token,
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

const logoutAll = async (req, res) => {
  const user = req.user;

  await Session.deleteMany({
    userId: user.id,
    authority: user.authority,
  });

  res.status(200).json({
    success: true,
    message: "Logged out from all devices successfully",
  });
};

const forgetPassword = catchErrors(async (req, res) => {
  const { email } = req.body;

  if (!email) throw new Error("Email is required");

  const employee = await Employee.findOne({ email }).select("name email");

  if (!employee) throw new Error("Invalid email address");

  const token = jwt.sign({ employeeId: employee._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  const resetURL = `${process.env.CLIENT_URL}/reset/password?verifyToken=${token}&employee=${employee._id}`;

  await passwordRecovery({
    email: employee.email,
    name: employee.name,
    resetURL,
  });

  employee.forgetPasswordToken = token;

  await employee.save();

  return res.status(200).json({
    success: true,
    message: "Password reset email sent successfully",
  });
});

const resetPassword = catchErrors(async (req, res) => {
  const { newPassword, confirmPassword, employeeId, forgetPasswordToken } =
    req.body;

  const employee = await Employee.findById(employeeId);

  if (!employee) throw new Error("Employee not found");

  if (employee.forgetPasswordToken !== forgetPasswordToken)
    throw new Error("Invalid verify password tokrn");

  if (newPassword !== confirmPassword) throw new Error("Passwords don't match");

  if (await bcrypt.compare(newPassword, employee.password))
    throw new Error(
      "The new password cannot be the same as your old password."
    );

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  employee.password = hashedPassword;
  employee.forgetPasswordToken = undefined;

  await employee.save();

  await resetPasswordSuccess({ email: employee.email, name: employee.name });

  return res.status(200).json({
    success: true,
    message: "Password set successfully",
  });
});

const checkResetPasswordValidity = catchErrors(async (req, res) => {
  const { employeeId, forgetPasswordToken } = req.query;

  if (!mongoose.Types.ObjectId.isValid(employeeId))
    throw new Error("Invalid reset password link");

  const employee = await Employee.findById(employeeId);

  if (!employee) throw new Error("Invalid reset password link");

  if (employee.forgetPasswordToken !== forgetPasswordToken)
    throw new Error("Invalid or expired reset password link");

  return res.status(200).json({
    success: true,
    message: "Valid reset password link",
  });
});

export {
  startLogin,
  verifyOtp,
  resendOtp,
  login,
  logout,
  logoutAll,
  resetPassword,
  updatePassword,
  forgetPassword,
  checkResetPasswordValidity,
};
