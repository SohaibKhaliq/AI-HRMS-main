import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    leaveType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeaveType",
      default: null,
    },
    leaveTypeLegacy: {
      type: String,
      enum: ["Sick", "Casual", "Vacation", "Unpaid"],
      default: null,
    },
    remarks: {
      type: String,
      default: "",
    },
    substitute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    fromDate: {
      type: Date,
      required: true,
    },
    toDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    isHalfDay: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: "",
    },
    documentUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Cancelled"],
      required: true,
      default: "Pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
leaveSchema.index({ employee: 1, status: 1, fromDate: -1 });

const Leave = mongoose.model("Leave", leaveSchema);

export default Leave;
