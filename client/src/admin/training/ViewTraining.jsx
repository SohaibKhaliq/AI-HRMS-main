import { useEffect, useState } from "react";
import axios from "../../axios/axiosInstance";
import { useParams, useNavigate } from "react-router-dom";

export default function ViewTraining() {
  const { id } = useParams();
  const [training, setTraining] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/trainings/${id}`);
        setTraining(res.data?.training || res.data || null);
      } catch (err) {
        console.error("Failed to load training", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetch();
  }, [id]);

  if (loading) return <div className="p-4">Loading…</div>;
  if (!training)
    return <div className="p-4 text-gray-600">Training not found.</div>;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{training.title}</h2>
        <button
          className="px-2 py-1 rounded bg-gray-200"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>

      <div className="bg-white rounded shadow p-4">
        <div className="mb-2">
          <div className="text-xs text-gray-500">Description</div>
          <div className="mt-1">{training.description || "-"}</div>
        </div>

        <div className="mb-2">
          <div className="text-xs text-gray-500">Scheduled At</div>
          <div className="mt-1">
            {training.scheduledAt
              ? new Date(training.scheduledAt).toLocaleString()
              : "-"}
          </div>
        </div>

        <div className="mb-2">
          <div className="text-xs text-gray-500">Created By</div>
          <div className="mt-1">
            {training.createdBy?.name || training.createdBy?.employeeId || "-"}
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-500">Participants</div>
          <div className="mt-2 grid gap-2">
            {(training.participants || []).map((p) => (
              <div
                key={p._id || p}
                className="p-2 border rounded text-sm flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">
                    {p.name || p.employeeId || p}
                  </div>
                  <div className="text-xs text-gray-500">{p._id || p}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
