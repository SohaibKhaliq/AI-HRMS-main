import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    previousDesignation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation",
      required: true,
    },
    newDesignation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation",
      required: true,
    },
    promotionDate: {
      type: Date,
      required: true,
    },
    effectiveDate: {
      type: Date,
      required: true,
    },
    salaryAdjustment: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Completed"],
      default: "Pending",
    },
    documentUrl: {
      type: String,
      default: null,
    },
    remarks: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Promotion = mongoose.model("Promotion", promotionSchema);

export default Promotion;
