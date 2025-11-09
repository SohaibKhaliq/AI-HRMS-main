#!/usr/bin/env node
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../server/src/config/index.js";
import Feedback from "../server/src/models/feedback.model.js";
import Complaint from "../server/src/models/complaint.model.js";
import { enqueueAnalysisJob } from "../server/src/services/analysisQueue.service.js";

const main = async () => {
  await connectDB();
  console.log("Connected to DB — starting analysis backfill...");

  // Enqueue feedbacks missing sentiment
  const feedbacks = await Feedback.find({
    $or: [{ sentimentLabel: { $exists: false } }, { sentimentLabel: null }],
  })
    .select("_id")
    .lean();
  console.log(`Enqueueing ${feedbacks.length} feedback jobs`);
  for (const f of feedbacks) {
    await enqueueAnalysisJob("feedback", f._id);
  }

  const complaints = await Complaint.find({
    $or: [{ sentimentLabel: { $exists: false } }, { sentimentLabel: null }],
  })
    .select("_id")
    .lean();
  console.log(`Enqueueing ${complaints.length} complaint jobs`);
  for (const c of complaints) {
    await enqueueAnalysisJob("complaint", c._id);
  }

  console.log(
    "Backfill complete — start the worker to process jobs: npm run analysis:worker"
  );
  process.exit(0);
};

main().catch((err) => {
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
