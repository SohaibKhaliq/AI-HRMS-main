import mongoose from "mongoose";

const { Schema } = mongoose;

const AnalysisJobSchema = new Schema(
  {
    type: { type: String, enum: ["feedback", "complaint"], required: true },
    refId: { type: Schema.Types.ObjectId, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "done", "failed"],
      default: "pending",
    },
    attempts: { type: Number, default: 0 },
    lastError: { type: String, default: null },
    payload: { type: Schema.Types.Mixed, default: {} },
    scheduledAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const AnalysisJob = mongoose.model("AnalysisJob", AnalysisJobSchema);

export default AnalysisJob;
