import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
  {
    holidayName: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["National", "Religious", "Company Specific"],
    },
    branches: {
      type: [String],
      default: ["Main Office"],
    },
    type: {
      type: String,
      required: true,
      enum: ["Full Day", "Half Day", "Floating"],
    },
    description: {
      type: String,
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Holiday = mongoose.model("Holiday", holidaySchema);

export default Holiday;
