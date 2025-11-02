import mongoose from "mongoose";

const terminationSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    type: {
      type: String,
      enum: ["retirement", "resignation", "termination", "redundancy", "voluntary", "involuntary"],
      required: true,
    },
    terminationDate: {
      type: Date,
      required: true,
    },
    noticeDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["In progress", "Completed", "Cancelled"],
      default: "In progress",
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

const Termination = mongoose.model("Termination", terminationSchema);

export default Termination;
