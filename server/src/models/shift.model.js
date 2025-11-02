import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: String, // Format: "HH:mm" (e.g., "09:00")
      required: true,
    },
    endTime: {
      type: String, // Format: "HH:mm" (e.g., "17:00")
      required: true,
    },
    breakDuration: {
      type: Number, // In minutes
      default: 60,
    },
    workingDays: {
      type: [String], // ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
      default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: "",
    },
    graceTime: {
      type: Number, // Grace time in minutes for late arrival
      default: 15,
    },
  },
  {
    timestamps: true,
  }
);

const Shift = mongoose.model("Shift", shiftSchema);

export default Shift;
