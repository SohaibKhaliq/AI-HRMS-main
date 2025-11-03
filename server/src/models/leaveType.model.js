import mongoose from "mongoose";

const leaveTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    maxDaysPerYear: {
      type: Number,
      required: true,
      min: 0,
    },
    carryForward: {
      type: Boolean,
      default: false,
    },
    carryForwardLimit: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPaid: {
      type: Boolean,
      default: true,
    },
    requiresApproval: {
      type: Boolean,
      default: true,
    },
    requiresDocument: {
      type: Boolean,
      default: false,
    },
    minDaysNotice: {
      type: Number,
      default: 0,
      min: 0,
    },
    allowHalfDay: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    color: {
      type: String,
      default: "#3B82F6", // For calendar display
    },
  },
  {
    timestamps: true,
  }
);

const LeaveType = mongoose.model("LeaveType", leaveTypeSchema);

export default LeaveType;
