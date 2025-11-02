import mongoose from "mongoose";

const jobLocationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

const JobLocation = mongoose.model("JobLocation", jobLocationSchema);
export default JobLocation;
