import mongoose from "mongoose";

const employeeDocumentSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DocumentCategory",
      // category is optional for employee uploads
      required: false,
      default: null,
    },
    documentType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DocumentType",
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number, // in bytes
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    issueDate: {
      type: Date,
      default: null,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    isExpired: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    version: {
      type: Number,
      default: 1,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
employeeDocumentSchema.index({ employee: 1, category: 1 });
employeeDocumentSchema.index({ expiryDate: 1 });

// Check if document is expired before saving
employeeDocumentSchema.pre("save", function (next) {
  if (this.expiryDate) {
    const now = new Date();
    this.isExpired = this.expiryDate < now;
  }
  next();
});

const EmployeeDocument = mongoose.model(
  "EmployeeDocument",
  employeeDocumentSchema
);

export default EmployeeDocument;
