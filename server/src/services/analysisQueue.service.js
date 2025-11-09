import AnalysisJob from "../models/analysisJob.model.js";

const enqueueAnalysisJob = async (type, refId, payload = {}) => {
  const job = await AnalysisJob.create({ type, refId, payload });
  return job;
};

// Atomically fetch a pending job and mark it processing
const fetchAndLockNextJob = async () => {
  const now = new Date();
  const job = await AnalysisJob.findOneAndUpdate(
    { status: "pending", scheduledAt: { $lte: now } },
    { $set: { status: "processing" }, $inc: { attempts: 1 } },
    { sort: { scheduledAt: 1 }, returnDocument: "after" }
  );
  return job;
};

// Fetch and lock up to `limit` pending jobs (best-effort). This attempts to
// select candidates and then atomically mark them processing. Returns the
// locked jobs. Using a two-step approach to limit window where other
// workers may steal jobs; updateMany ensures only still-pending jobs are
// transitioned.
const fetchAndLockJobs = async (limit = 5) => {
  const now = new Date();
  const candidates = await AnalysisJob.find({
    status: "pending",
    scheduledAt: { $lte: now },
  })
    .sort({ scheduledAt: 1 })
    .limit(limit)
    .lean();

  if (!candidates || candidates.length === 0) return [];

  const ids = candidates.map((c) => c._id);

  // Atomically mark only those still pending as processing and increment attempts
  await AnalysisJob.updateMany(
    { _id: { $in: ids }, status: "pending" },
    { $set: { status: "processing" }, $inc: { attempts: 1 } }
  );

  // Fetch the jobs that were successfully locked
  const locked = await AnalysisJob.find({
    _id: { $in: ids },
    status: "processing",
  });
  return locked;
};

const markJobDone = async (jobId, result = null) => {
  const update = { status: "done" };
  if (result !== null) update.result = result;
  return AnalysisJob.findByIdAndUpdate(jobId, update, { new: true });
};

const markJobFailed = async (jobId, error) => {
  return AnalysisJob.findByIdAndUpdate(jobId, {
    status: "failed",
    lastError: error && error.message ? error.message : String(error),
  });
};

export { enqueueAnalysisJob, fetchAndLockNextJob, markJobDone, markJobFailed };
export { fetchAndLockJobs };
