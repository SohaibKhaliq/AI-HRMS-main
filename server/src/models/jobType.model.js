import mongoose from "mongoose";

const jobTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

const JobType = mongoose.model("JobType", jobTypeSchema);
export default JobType;
