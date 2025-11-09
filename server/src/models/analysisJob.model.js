import mongoose from "mongoose";

const { Schema } = mongoose;

const AnalysisJobSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["feedback", "complaint", "substitute"],
      required: true,
    },
    refId: { type: Schema.Types.ObjectId, required: false },
    status: {
      type: String,
      enum: ["pending", "processing", "done", "failed"],
      default: "pending",
    },
    attempts: { type: Number, default: 0 },
    lastError: { type: String, default: null },
    payload: { type: Schema.Types.Mixed, default: {} },
    // Optional structured result produced by the worker (kept as JSON)
    result: { type: Schema.Types.Mixed, default: null },
    scheduledAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const AnalysisJob = mongoose.model("AnalysisJob", AnalysisJobSchema);

export default AnalysisJob;
