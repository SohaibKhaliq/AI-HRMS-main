import mongoose from "mongoose";

const documentCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    requiresExpiry: {
      type: Boolean,
      default: false,
    },
    isMandatory: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    allowedFormats: {
      type: [String],
      default: [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"],
    },
    maxSizeMB: {
      type: Number,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);

const DocumentCategory = mongoose.model("DocumentCategory", documentCategorySchema);

export default DocumentCategory;
