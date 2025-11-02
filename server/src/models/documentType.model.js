import mongoose from "mongoose";

const documentTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    required: { type: Boolean, default: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

const DocumentType = mongoose.model("DocumentType", documentTypeSchema);

export default DocumentType;
