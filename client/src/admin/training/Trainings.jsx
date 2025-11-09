import { useEffect, useState } from "react";
import axios from "../../axios/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function Trainings() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTrainings = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/trainings?page=1&limit=50");
      setTrainings(res.data?.trainings || res.data || []);
    } catch (err) {
      console.error("Failed to fetch trainings", err);
      setTrainings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Trainings</h2>
        <button
          className="px-3 py-1 rounded bg-primary text-white"
          onClick={() => navigate("/trainings/create")}
        >
          Create
        </button>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="bg-white rounded shadow p-2">
          {trainings.length === 0 ? (
            <div className="p-4 text-gray-600">No trainings found.</div>
          ) : (
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="text-left">
                  <th className="p-2">Title</th>
                  <th className="p-2">Participants</th>
                  <th className="p-2">Created By</th>
                  <th className="p-2">Scheduled At</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trainings.map((t) => (
                  <tr key={t._id} className="border-t">
                    <td className="p-2">{t.title}</td>
                    <td className="p-2">
                      {Array.isArray(t.participants)
                        ? t.participants.length
                        : (t.participants || []).length}
                    </td>
                    <td className="p-2">
                      {t.createdBy?.name || t.createdBy?.employeeId || "-"}
                    </td>
                    <td className="p-2">
                      {t.scheduledAt
                        ? new Date(t.scheduledAt).toLocaleString()
                        : "-"}
                    </td>
                    <td className="p-2">
                      <button
                        className="px-2 py-1 rounded bg-gray-200"
                        onClick={() => navigate(`/trainings/${t._id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
