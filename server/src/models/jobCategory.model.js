import mongoose from "mongoose";

const jobCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

const JobCategory = mongoose.model("JobCategory", jobCategorySchema);
export default JobCategory;
