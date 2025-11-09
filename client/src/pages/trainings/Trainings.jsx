import { useEffect, useState } from "react";
import axios from "../../axios/axiosInstance";
import { Link } from "react-router-dom";

export default function Trainings() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchTrainings = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/trainings/my");
        if (mounted) setTrainings(res.data.trainings || []);
      } catch (err) {
        setError(
          err?.response?.data?.message || err.message || "Failed to load"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchTrainings();
    return () => (mounted = false);
  }, []);

  if (loading) return <div className="p-4">Loading trainings...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">My Trainings</h2>
      {trainings.length === 0 ? (
        <div>No trainings found.</div>
      ) : (
        <ul className="space-y-3">
          {trainings.map((t) => (
            <li
              key={t._id}
              className="p-3 bg-white rounded shadow-sm flex justify-between items-center"
            >
              <div>
                <div className="font-medium text-lg">{t.title}</div>
                <div className="text-sm text-gray-500">
                  {t.description || "No description"}
                </div>
                <div className="text-sm text-gray-400">
                  Scheduled:{" "}
                  {t.scheduledAt
                    ? new Date(t.scheduledAt).toLocaleString()
                    : "TBD"}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm px-2 py-1 bg-gray-100 rounded">
                  {t.status || "Draft"}
                </div>
                <Link
                  to={`/trainings/${t._id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
