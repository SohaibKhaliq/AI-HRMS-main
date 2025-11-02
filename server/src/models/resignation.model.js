import mongoose from "mongoose";

const resignationSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    resignationDate: {
      type: Date,
      required: true,
    },
    lastWorkingDay: {
      type: Date,
      required: true,
    },
    noticePeriod: {
      type: Number,
      default: 0,
    },
    reason: {
      type: String,
      default: "",
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

const Resignation = mongoose.model("Resignation", resignationSchema);

export default Resignation;
