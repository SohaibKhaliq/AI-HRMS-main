import mongoose from "mongoose";

const trainingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],
    status: {
      type: String,
      enum: ["Draft", "Scheduled", "Completed"],
      default: "Draft",
    },
    scheduledAt: { type: Date },
  },
  { timestamps: true }
);

const Training = mongoose.model("Training", trainingSchema);
export default Training;
