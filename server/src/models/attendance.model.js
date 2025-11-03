import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
      default: null,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    checkIn: {
      time: {
        type: Date,
        default: null,
      },
      method: {
        type: String,
        enum: ["face", "qr", "manual", "legacy"],
        default: "legacy",
      },
      location: {
        latitude: Number,
        longitude: Number,
      },
    },
    checkOut: {
      time: {
        type: Date,
        default: null,
      },
      method: {
        type: String,
        enum: ["face", "qr", "manual", "legacy"],
        default: "legacy",
      },
      location: {
        latitude: Number,
        longitude: Number,
      },
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late", "Half-Day", "On-Leave"],
      required: true,
    },
    workHours: {
      type: Number,
      default: 0,
    },
    isLate: {
      type: Boolean,
      default: false,
    },
    lateByMinutes: {
      type: Number,
      default: 0,
    },
    isEarlyCheckout: {
      type: Boolean,
      default: false,
    },
    earlyByMinutes: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
attendanceSchema.index({ employee: 1, date: -1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
