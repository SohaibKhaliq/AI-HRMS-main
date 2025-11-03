import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      default: "",
    },
    meetingLink: {
      type: String,
      default: "",
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    participants: [
      {
        employee: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Employee",
        },
        status: {
          type: String,
          enum: ["pending", "accepted", "declined", "tentative"],
          default: "pending",
        },
        attendance: {
          type: String,
          enum: ["present", "absent", "not_marked"],
          default: "not_marked",
        },
      },
    ],
    agenda: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrencePattern: {
      type: String,
      enum: ["daily", "weekly", "monthly", "none"],
      default: "none",
    },
    recurrenceEndDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled",
    },
    reminder: {
      enabled: {
        type: Boolean,
        default: true,
      },
      minutesBefore: {
        type: Number,
        default: 30,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
meetingSchema.index({ startTime: 1, status: 1 });
meetingSchema.index({ "participants.employee": 1 });

const Meeting = mongoose.model("Meeting", meetingSchema);

export default Meeting;
