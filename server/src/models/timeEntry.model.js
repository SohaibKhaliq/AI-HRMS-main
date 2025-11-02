import mongoose from "mongoose";

const timeEntrySchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    clockIn: {
      type: Date,
      required: true,
    },
    clockOut: {
      type: Date,
      default: null,
    },
    breaks: [
      {
        startTime: {
          type: Date,
          required: true,
        },
        endTime: {
          type: Date,
          default: null,
        },
      },
    ],
    totalHours: {
      type: Number,
      default: 0,
    },
    breakHours: {
      type: Number,
      default: 0,
    },
    workHours: {
      type: Number,
      default: 0,
    },
    overtimeHours: {
      type: Number,
      default: 0,
    },
    project: {
      type: String,
      default: "",
    },
    task: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
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
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
timeEntrySchema.index({ employee: 1, date: -1 });

// Calculate hours before saving
timeEntrySchema.pre("save", function (next) {
  if (this.clockIn && this.clockOut) {
    const totalMs = this.clockOut - this.clockIn;
    this.totalHours = totalMs / (1000 * 60 * 60);

    // Calculate break hours
    this.breakHours = 0;
    if (this.breaks && this.breaks.length > 0) {
      this.breaks.forEach((brk) => {
        if (brk.endTime) {
          const breakMs = brk.endTime - brk.startTime;
          this.breakHours += breakMs / (1000 * 60 * 60);
        }
      });
    }

    // Work hours = total - breaks
    this.workHours = this.totalHours - this.breakHours;

    // Overtime if work hours > 8
    const standardHours = 8;
    this.overtimeHours = Math.max(0, this.workHours - standardHours);
  }
  next();
});

const TimeEntry = mongoose.model("TimeEntry", timeEntrySchema);

export default TimeEntry;
