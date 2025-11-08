import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    review: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    suggestion: {
      type: String,
      required: true,
    },
    sentimentScore: {
      type: Number,
    },
    sentimentLabel: {
      type: String,
    },
    topics: {
      type: [String],
      default: [],
    },
    analysisMeta: {
      type: Object,
    },
    lastAnalyzedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
