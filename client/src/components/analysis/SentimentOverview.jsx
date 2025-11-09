import PropTypes from "prop-types";
import { useEffect, useState, useRef } from "react";
import axios from "../../axios/axiosInstance";
import { useSocket } from "../../context/SocketContext";

const POLL_INTERVAL_MS = 30 * 1000; // 30 seconds

const SentimentOverview = ({ insights = {} }) => {
  const [local, setLocal] = useState(insights || {});
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);
  const { socket } = useSocket();
  const [workerProgress, setWorkerProgress] = useState(null);
  const [jobToasts, setJobToasts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalJob, setModalJob] = useState(null);
  // open a modal and load job details from server
  const openJobModal = async (id) => {
    try {
      setModalOpen(true);
      setModalLoading(true);
      const res = await axios.get(`/analysis/jobs/${id}`);
      if (res?.data?.job) setModalJob(res.data.job);
    } catch (err) {
      console.debug(
        "Failed to load job details:",
        err && err.message ? err.message : err
      );
      setModalJob({ error: err && err.message ? err.message : String(err) });
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalJob(null);
  };
  const pollingStarted = useRef(false);

  const fetchInsights = async (force = false) => {
    setLoading(true);
    try {
      const url = force ? "/insights?nocache=1" : "/insights";
      const res = await axios.get(url);
      if (mounted.current && res?.data?.insights) {
        setLocal(res.data.insights);
      }
    } catch (err) {
      // non-fatal — keep previous state
      // log at debug level to help troubleshooting without failing UI
      console.debug(
        "Failed to fetch insights:",
        err && err.message ? err.message : err
      );
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    mounted.current = true;
    // sync initial prop
    if (insights && Object.keys(insights).length > 0) setLocal(insights);

    // Start polling only once
    if (!pollingStarted.current) {
      pollingStarted.current = true;
      fetchInsights();
      const id = setInterval(fetchInsights, POLL_INTERVAL_MS);
      return () => {
        mounted.current = false;
        clearInterval(id);
      };
    }
    // no cleanup here when polling already started
    return () => {
      mounted.current = false;
    };
  }, [insights]);

  // keep syncing if parent updates insights
  useEffect(() => {
    if (insights && Object.keys(insights).length > 0) setLocal(insights);
  }, [insights]);

  // Socket listener for live worker progress
  useEffect(() => {
    if (!socket) return;

    const onProgress = (evt) => {
      try {
        console.debug("analysis:progress received:", evt);

        // Batch-summary event: replace worker progress and refresh insights
        if (evt?.event === "analysis:batch") {
          setWorkerProgress(evt.summary || null);
          fetchInsights();
          return;
        }

        // Per-job event: incrementally update local progress counters without hitting the API
        if (evt?.event === "analysis:job") {
          const ok = !!(evt.result && evt.result.ok);
          setWorkerProgress((prev) => {
            const next = prev
              ? { ...prev }
              : { processed: 0, ok: 0, failed: 0, pending: 0 };
            next.processed = (next.processed || 0) + 1;
            if (ok) next.ok = (next.ok || 0) + 1;
            else next.failed = (next.failed || 0) + 1;
            // if worker provides pending count, trust it
            if (typeof evt.result?.pending === "number")
              next.pending = evt.result.pending;
            return next;
          });

          // push a transient toast showing job type and status
          try {
            const toast = {
              id: evt.job?.id || String(Date.now()),
              type: evt.job?.type || "job",
              ok: !!evt.result?.ok,
              took: evt.result?.took,
              error: evt.result?.error,
              ts: evt.ts || new Date().toISOString(),
            };
            setJobToasts((prev) => [toast, ...(prev || [])].slice(0, 6));
            // auto-dismiss after 6s
            setTimeout(() => {
              setJobToasts((prev) =>
                (prev || []).filter((t) => t.id !== toast.id)
              );
            }, 6000);
          } catch {
            // ignore
          }

          return;
        }

        // Unknown event shape: fallback to using summary if present
        setWorkerProgress(evt?.summary || null);
      } catch (err) {
        console.debug(
          "analysis:progress handler error:",
          err && err.message ? err.message : err
        );
      }
    };

    socket.on("analysis:progress", onProgress);

    return () => {
      socket.off("analysis:progress", onProgress);
    };
  }, [socket]);

  const sentiment = local?.sentiment || {};
  const counts = sentiment.counts || {};
  const avg = typeof sentiment.avgScore === "number" ? sentiment.avgScore : 0;
  const total = sentiment.totalAnalyzed || 0;
  const topTopics = sentiment.topTopics || [];

  // sentimentLabel may be stored with different casing ("positive" | "Positive" | "POSITIVE")
  // be defensive and accept any common casing so the UI doesn't show zeros.
  const positive =
    counts.Positive ||
    counts.positive ||
    counts.POSITIVE ||
    counts.PosiTive ||
    0;
  const neutral = counts.Neutral || counts.neutral || counts.NEUTRAL || 0;
  const negative = counts.Negative || counts.negative || counts.NEGATIVE || 0;
  const sum = Math.max(1, positive + neutral + negative);

  // Emoji to express overall sentiment (small, friendly visual cue)
  let sentimentEmoji = "😐";
  if (avg > 0.2) sentimentEmoji = "😊";
  else if (avg < -0.2) sentimentEmoji = "😞";

  return (
    <div className="relative w-full md:w-[32%] mt-2 rounded-lg dark:text-gray-200 text-gray-700 bg-gray-100 dark:bg-secondary border border-gray-300 dark:border-primary p-4 shadow">
      {jobToasts.length > 0 && (
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-50">
          {jobToasts.map((t) => (
            <div
              key={t.id}
              onClick={() => openJobModal(t.id)}
              className={`cursor-pointer flex items-center gap-2 px-3 py-1 rounded shadow-sm text-xs ${
                t.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              }`}
            >
              <span className="font-medium">{t.type}</span>
              <span>{t.ok ? "✔️" : "❌"}</span>
              {t.took ? (
                <span className="ml-1 text-gray-600">{t.took}ms</span>
              ) : null}
            </div>
          ))}
        </div>
      )}
      <div className="flex items-start justify-between">
        <h3 className="text-[0.93rem] font-semibold mb-1 pl-1">
          Sentiment Overview
        </h3>
        <div className="flex items-center gap-2">
          <button
            className="text-xs px-2 py-1 rounded bg-primary text-white hover:opacity-90"
            onClick={() => fetchInsights(true)}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        {/* Modal for job details */}
        {modalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black opacity-40"
              onClick={closeModal}
            />
            <div className="relative z-70 w-[90%] max-w-lg bg-white dark:bg-gray-800 rounded shadow-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">Job Details</h4>
                <button className="text-sm px-2" onClick={closeModal}>
                  Close
                </button>
              </div>
              {modalLoading ? (
                <div className="py-8 text-center">Loading...</div>
              ) : modalJob ? (
                <div className="text-sm">
                  <div>
                    <strong>ID:</strong> {modalJob._id || modalJob.id}
                  </div>
                  <div>
                    <strong>Type:</strong> {modalJob.type}
                  </div>
                  <div>
                    <strong>Status:</strong> {modalJob.status}
                  </div>
                  <div>
                    <strong>Attempts:</strong> {modalJob.attempts}
                  </div>
                  <div className="mt-2">
                    <strong>Payload:</strong>
                  </div>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded max-h-48 overflow-auto">
                    {JSON.stringify(modalJob.payload || {}, null, 2)}
                  </pre>
                  {modalJob.refDoc && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500">
                        Referenced document
                      </div>
                      <pre className="text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded max-h-48 overflow-auto">
                        {JSON.stringify(modalJob.refDoc, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-4">No job data available.</div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 mt-3">
        {workerProgress && (
          <div className="text-xs text-gray-600 mb-2 flex items-center gap-2">
            <strong>Worker:</strong>
            {workerProgress.pending > 0 ? (
              <svg
                className="animate-spin h-4 w-4 text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            ) : null}
            processed {workerProgress.processed || 0}, ok{" "}
            {workerProgress.ok || 0}, failed {workerProgress.failed || 0} —
            pending {workerProgress.pending || 0}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500">Average Score</div>
            <div className="text-2xl font-bold">
              {avg.toFixed(2)}{" "}
              <span className="ml-2" aria-label="sentiment-emoji">
                {sentimentEmoji}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Analyzed</div>
            <div className="text-lg font-medium">{total}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <div className="text-xs text-green-700">Positive</div>
            <div className="h-3 bg-green-100 rounded-full mt-1">
              <div
                style={{ width: `${Math.round((positive / sum) * 100)}%` }}
                className="h-3 bg-green-500 rounded-full"
              />
            </div>
            <div className="text-xs text-gray-600 mt-1">{positive}</div>
          </div>

          <div>
            <div className="text-xs text-yellow-700">Neutral</div>
            <div className="h-3 bg-yellow-100 rounded-full mt-1">
              <div
                style={{ width: `${Math.round((neutral / sum) * 100)}%` }}
                className="h-3 bg-yellow-400 rounded-full"
              />
            </div>
            <div className="text-xs text-gray-600 mt-1">{neutral}</div>
          </div>

          <div>
            <div className="text-xs text-red-700">Negative</div>
            <div className="h-3 bg-red-100 rounded-full mt-1">
              <div
                style={{ width: `${Math.round((negative / sum) * 100)}%` }}
                className="h-3 bg-red-500 rounded-full"
              />
            </div>
            <div className="text-xs text-gray-600 mt-1">{negative}</div>
          </div>
        </div>

        {topTopics.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 mb-2">Top Topics</div>
            <div className="flex flex-wrap gap-2">
              {topTopics.map((t, i) => (
                <span
                  key={`${t.topic}-${i}`}
                  className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full"
                >
                  {t.topic} ({t.count})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

SentimentOverview.propTypes = {
  insights: PropTypes.object,
};

export default SentimentOverview;
