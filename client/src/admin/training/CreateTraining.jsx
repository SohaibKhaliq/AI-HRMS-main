import { useEffect, useState } from "react";
import axios from "../../axios/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function CreateTraining() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [participantInput, setParticipantInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [participants, setParticipants] = useState([]); // {id,label}
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const q = participantInput?.trim();
    if (!q || q.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(
          `/employees?name=${encodeURIComponent(q)}&limit=8`
        );
        const items = res.data?.employees || res.data || [];
        if (!cancelled)
          setSuggestions(
            items.map((it) => ({ id: it._id, label: it.name || it.employeeId }))
          );
      } catch {
        if (!cancelled) setSuggestions([]);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [participantInput]);

  const addParticipant = (raw) => {
    if (!raw) return;
    const match = suggestions.find(
      (s) => (s.label || "").toLowerCase() === raw.toLowerCase() || s.id === raw
    );
    if (match) {
      setParticipants((prev) =>
        prev.some((p) => p.id === match.id)
          ? prev
          : [...prev, { id: match.id, label: match.label }]
      );
      setParticipantInput("");
      return;
    }
    // allow adding raw id or label
    setParticipants((prev) =>
      prev.some((p) => p.id === raw || p.label === raw)
        ? prev
        : [...prev, { id: raw, label: raw }]
    );
    setParticipantInput("");
  };

  const removeParticipant = (id) =>
    setParticipants((prev) => prev.filter((p) => p.id !== id));

  const submit = async () => {
    if (!title?.trim()) return alert("Title is required");
    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        participants: participants.map((p) => p.id || p),
        scheduledAt: scheduledAt
          ? new Date(scheduledAt).toISOString()
          : undefined,
      };
      const res = await axios.post("/trainings", payload);
      const id =
        res.data?.training?._id || res.data?.trainingId || res.data?.training;
      alert("Training created");
      if (id) navigate(`/trainings/${id}`);
      else navigate("/trainings");
    } catch (err) {
      console.error(err);
      alert(
        "Failed to create training: " +
          (err?.response?.data?.message || err?.message || "")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Create Training</h2>
        <div>
          <button
            className="px-3 py-1 mr-2 rounded bg-gray-200"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4 max-w-2xl">
        <div className="mb-3">
          <label className="block text-xs text-gray-500">Title</label>
          <input
            className="w-full border rounded px-2 py-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="block text-xs text-gray-500">Description</label>
          <textarea
            className="w-full border rounded px-2 py-1"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="block text-xs text-gray-500">Scheduled date</label>
          <input
            type="date"
            className="w-48 border rounded px-2 py-1"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="block text-xs text-gray-500">Participants</label>
          <div className="flex gap-2 items-center">
            <input
              className="flex-1 border rounded px-2 py-1"
              placeholder="search employees by name or paste id"
              value={participantInput}
              onChange={(e) => setParticipantInput(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addParticipant(participantInput.trim());
                }
              }}
            />
            <button
              type="button"
              className="px-3 py-1 rounded bg-primary text-white text-sm"
              onClick={() => addParticipant(participantInput.trim())}
            >
              Add
            </button>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="bg-white border rounded mt-1 max-h-40 overflow-auto z-50">
              {suggestions.map((s) => (
                <div
                  key={s.id}
                  className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm"
                  onMouseDown={() => {
                    addParticipant(s.id);
                    setShowSuggestions(false);
                  }}
                >
                  {s.label}{" "}
                  <span className="text-xs text-gray-400">{s.id}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-2 flex flex-wrap gap-2">
            {participants.map((p) => (
              <div
                key={p.id}
                className="px-2 py-1 bg-gray-100 rounded flex items-center gap-2 text-xs"
              >
                <span>{p.label || p.id}</span>
                <button
                  type="button"
                  className="text-red-600"
                  onClick={() => removeParticipant(p.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-3">
          <button
            className="px-3 py-1 text-sm rounded border"
            onClick={() => navigate("/trainings")}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 text-sm rounded bg-primary text-white"
            onClick={submit}
            disabled={loading}
          >
            {loading ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
