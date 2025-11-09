import { useEffect, useState } from "react";
import axios from "../../axios/axiosInstance";
import { useParams, Link } from "react-router-dom";

export default function TrainingDetail() {
  const { id } = useParams();
  const [training, setTraining] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchTraining = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/trainings/${id}/my`);
        if (mounted) setTraining(res.data.training);
      } catch (err) {
        setError(
          err?.response?.data?.message || err.message || "Failed to load"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (id) fetchTraining();
    return () => (mounted = false);
  }, [id]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!training) return <div className="p-4">No training found.</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-2">{training.title}</h2>
      <div className="text-sm text-gray-600 mb-4">{training.description}</div>
      <div className="mb-4">
        <strong>Scheduled:</strong>{" "}
        {training.scheduledAt
          ? new Date(training.scheduledAt).toLocaleString()
          : "TBD"}
      </div>
      <div className="mb-4">
        <strong>Status:</strong> {training.status}
      </div>
      <div className="mb-4">
        <strong>Participants:</strong>
        <ul className="list-disc pl-5">
          {(training.participants || []).map((p) => (
            <li key={p._id || p}>{p.name || p}</li>
          ))}
        </ul>
      </div>
      <Link to="/trainings" className="text-blue-600 hover:underline">
        Back
      </Link>
    </div>
  );
}
