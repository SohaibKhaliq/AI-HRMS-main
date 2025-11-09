import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../../axios/axiosInstance";
import { useSocket } from "../../context/SocketContext";

export default function SubstituteAnalysis() {
  const [targetEmployeeId, setTargetEmployeeId] = useState("");
  const [targetEmployeeName, setTargetEmployeeName] = useState("");
  const [department, setDepartment] = useState("");
  const [topK, setTopK] = useState(5);
  const [requiredSkills, setRequiredSkills] = useState("");
  const [jobId, setJobId] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  // Training modal state
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const [modalDate, setModalDate] = useState("");
  // modalParticipants stores objects { id, label }
  const [modalParticipants, setModalParticipants] = useState([]);
  const [participantInput, setParticipantInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const startJob = async (e) => {
    e.preventDefault();
    setLoading(true);
    setJob(null);
    setJobId(null);

    const payload = {
      targetEmployeeId: targetEmployeeId || null,
      topK: Number(topK) || 5,
      scope: {},
    };
    if (department) payload.scope.department = department;
    if (requiredSkills)
      payload.requiredSkills = requiredSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    try {
      const res = await axios.post("/analysis/substitute", payload);
      const id = res.data.jobId;
      setJobId(id);
      fetchJob(id);
    } catch (err) {
      console.error(err);
      alert(
        "Failed to start analysis: " +
          (err?.response?.data?.message || err.message)
      );
      setLoading(false);
    }
  };

  const fetchJob = async (id) => {
    try {
      const res = await axios.get(`/analysis/substitute/${id}`);
      const job = res.data.job;
      setJob(job);
      if (job && (job.status === "done" || job.status === "failed")) {
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to fetch job", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!socket || !jobId) return;
    const handler = (evt) => {
      try {
        const incomingJobId =
          evt?.job?.id || evt?.jobId || (evt?.job?._id && String(evt.job._id));
        if (!incomingJobId) return;
        if (String(incomingJobId) === String(jobId)) fetchJob(jobId);
      } catch {
        // ignore
      }
    };
    socket.on("analysis:progress", handler);
    return () => {
      if (socket) socket.off("analysis:progress", handler);
    };
  }, [socket, jobId]);

  // Prefill fields from query params (employeeId or resignationId)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qpEmp = params.get("employeeId");
    const qpRes = params.get("resignationId");

    const fetchEmployeeForPrefill = async (id) => {
      try {
        const res = await axios.get(`/employees/${id}`);
        const emp = res.data?.employee || res.data;
        if (emp) {
          setTargetEmployeeId(emp._id || emp.employeeId || "");
          setTargetEmployeeName(emp.name || emp.employeeId || "");
          const dep = emp.department?._id || emp.department || "";
          setDepartment(dep);
          setRequiredSkills(
            Array.isArray(emp.skills) ? emp.skills.join(", ") : ""
          );
          setModalParticipants([
            {
              id: emp._id || emp.employeeId || "",
              label: emp.name || emp.employeeId || "",
            },
          ]);
        }
      } catch (e) {
        console.error("Failed to prefill employee data", e);
      }
    };

    if (qpEmp) fetchEmployeeForPrefill(qpEmp);
    else if (qpRes) {
      (async () => {
        try {
          const r = await axios.get(`/resignations/${qpRes}`);
          const resignation = r.data?.resignation || r.data;
          const empId = resignation?.employee?._id || resignation?.employee;
          if (empId) fetchEmployeeForPrefill(empId);
        } catch (e) {
          console.error("Failed to fetch resignation for prefill", e);
        }
      })();
    }
  }, [location.search]);

  // When targetEmployeeId changes fetch its display name
  useEffect(() => {
    let cancelled = false;
    const fetchName = async (id) => {
      if (!id) {
        setTargetEmployeeName("");
        return;
      }
      try {
        const res = await axios.get(`/employees/${id}`);
        const emp = res.data?.employee || res.data;
        if (!cancelled && emp)
          setTargetEmployeeName(emp.name || emp.employeeId || "");
      } catch (err) {
        if (!cancelled) setTargetEmployeeName("");
        alert(
          "Failed to fetch employee name: " +
            (err?.response?.data?.message || err.message)
        );
      }
    };
    fetchName(targetEmployeeId);
    return () => (cancelled = true);
  }, [targetEmployeeId]);

  // suggestions for participant autocomplete
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
          `/employees?name=${encodeURIComponent(q)}&limit=6`
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

  const openTrainingModal = (candidate) => {
    setModalParticipants([
      {
        id: candidate.employeeId,
        label: candidate.name || candidate.employeeId,
      },
    ]);
    setModalTitle(`Training for ${candidate.name}`);
    setModalDescription(
      `Auto-generated training for ${candidate.name} (from substitute analysis).`
    );
    setModalDate("");
    setShowTrainingModal(true);
  };

  const submitTraining = async () => {
    try {
      const payload = {
        title: modalTitle,
        description: modalDescription,
        participants: Array.isArray(modalParticipants)
          ? modalParticipants.map((p) => p.id || p)
          : [],
        scheduledAt: modalDate ? new Date(modalDate).toISOString() : undefined,
      };
      const res = await axios.post("/trainings", payload);
      alert(
        "Training created: " +
          (res.data?.training?._id ||
            res.data?.trainingId ||
            res.data?.training)
      );
      setShowTrainingModal(false);
      setModalParticipants([]);
      setParticipantInput("");
      try {
        const id =
          res.data?.training?._id || res.data?.trainingId || res.data?.training;
        if (id) navigate(`/trainings/${id}`);
      } catch {
        // ignore
      }
    } catch (err) {
      console.error(err);
      alert(
        "Failed to create training: " +
          (err?.response?.data?.message || err.message)
      );
    }
  };

  // CSV helper
  const downloadCSV = (filename, headers, rows) => {
    const escaped = (v) => '"' + String(v ?? "").replace(/"/g, '""') + '"';
    const csv = [
      headers.map(escaped).join(","),
      ...rows.map((r) => r.map(escaped).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportAllCSV = () => {
    const candidates = job?.result?.candidates || [];
    const headers = [
      "Employee ID",
      "Name",
      "Email",
      "Score",
      "Skill Match",
      "Performance Rating",
      "ExperienceYears",
      "Skills",
      "DepartmentId",
      "DesignationId",
    ];
    const rows = candidates.map((c) => [
      c.employeeId,
      c.name,
      c.email,
      c.score,
      c.details?.skillMatch ?? "",
      c.details?.performanceRating ?? "",
      c.details?.yearsExperience ?? "",
      Array.isArray(c.skills) ? c.skills.join("; ") : "",
      c.department ?? "",
      c.designation ?? "",
    ]);
    downloadCSV(
      `substitute_candidates_${jobId || "export"}.csv`,
      headers,
      rows
    );
  };

  return (
    <div className="relative w-full rounded-lg dark:text-gray-200 text-gray-700 bg-gray-100 dark:bg-secondary border border-gray-300 dark:border-primary p-4 shadow">
      <h3 className="text-[0.93rem] font-semibold mb-3">
        Substitute Analysis (Admin)
      </h3>
      <form onSubmit={startJob} className="space-y-3">
        <div>
          <label className="block text-xs text-gray-500">Target Employee</label>
          {targetEmployeeName ? (
            <div className="flex items-center gap-2">
              <div className="px-3 py-2 bg-white border border-gray-300 rounded w-full">
                <div className="text-sm font-medium">{targetEmployeeName}</div>
                <div className="text-xs text-gray-500">{targetEmployeeId}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTargetEmployeeId("");
                  setTargetEmployeeName("");
                }}
                className="px-3 py-2 bg-red-100 text-red-700 rounded text-xs"
              >
                Clear
              </button>
            </div>
          ) : (
            <input
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
              value={targetEmployeeId}
              onChange={(e) => setTargetEmployeeId(e.target.value)}
              placeholder="employee id"
            />
          )}
        </div>

        <div>
          <label className="block text-xs text-gray-500">
            Department ID (optional)
          </label>
          <input
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="department id"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500">Top K</label>
          <input
            type="number"
            className="w-24 border border-gray-300 rounded px-2 py-1 text-sm bg-white"
            value={topK}
            onChange={(e) => setTopK(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500">
            Required skills (comma separated, optional)
          </label>
          <input
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
            value={requiredSkills}
            onChange={(e) => setRequiredSkills(e.target.value)}
            placeholder="e.g. leadership, payroll"
          />
        </div>

        <div>
          <button
            type="submit"
            className="text-xs px-3 py-2 rounded bg-primary text-white hover:opacity-90"
            disabled={loading}
          >
            {loading ? "Starting..." : "Start Analysis"}
          </button>
        </div>
      </form>

      {jobId && (
        <div className="mt-4">
          <div>
            Job ID: <strong>{String(jobId)}</strong>
          </div>
          <div>
            Status: <strong>{job?.status || "queued"}</strong>
          </div>
        </div>
      )}

      {job && job.result && (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Results</h4>
            <div>
              <button
                className="text-xs px-2 py-1 rounded bg-green-600 text-white"
                onClick={exportAllCSV}
              >
                Export All CSV
              </button>
            </div>
          </div>

          <div>
            Total candidates evaluated:{" "}
            {job.result.meta?.totalCandidates ?? "N/A"}
          </div>

          <table className="w-full mt-2 table-fixed text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-600">
                <th className="pb-2">Name</th>
                <th className="pb-2 text-center">Score</th>
                <th className="pb-2">Details</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {(job.result.candidates || []).map((c) => (
                <tr key={String(c.employeeId)}>
                  <td>
                    {c.name}
                    <div className="text-xs text-gray-500">{c.email}</div>
                  </td>
                  <td className="text-center">{c.score}</td>
                  <td>
                    {c.details && (
                      <div className="text-xs text-gray-600">
                        Dept match: {String(c.details.departmentMatch)} | Desig
                        match: {String(c.details.designationMatch)} | Perf:{" "}
                        {c.details.performanceRating} | Exp:{" "}
                        {c.details.yearsExperience} | SkillMatch:{" "}
                        {c.details.skillMatch}
                      </div>
                    )}
                    <div className="mt-2 flex gap-2">
                      <button
                        className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
                        onClick={() => navigate(`/employee/${c.employeeId}`)}
                      >
                        Open profile
                      </button>
                      <button
                        className="text-xs px-2 py-1 rounded bg-amber-500 text-white hover:opacity-90"
                        onClick={() => openTrainingModal(c)}
                      >
                        Create training
                      </button>
                      <button
                        className="text-xs px-2 py-1 rounded bg-green-600 text-white hover:opacity-90"
                        onClick={() => {
                          const headers = [
                            "Employee ID",
                            "Name",
                            "Email",
                            "Score",
                            "Skill Match",
                            "Performance Rating",
                            "ExperienceYears",
                            "Skills",
                            "DepartmentId",
                            "DesignationId",
                          ];
                          const row = [
                            c.employeeId,
                            c.name,
                            c.email,
                            c.score,
                            c.details?.skillMatch ?? "",
                            c.details?.performanceRating ?? "",
                            c.details?.yearsExperience ?? "",
                            Array.isArray(c.skills) ? c.skills.join("; ") : "",
                            c.department ?? "",
                            c.designation ?? "",
                          ];
                          downloadCSV(
                            `candidate_${c.employeeId}.csv`,
                            headers,
                            [row]
                          );
                        }}
                      >
                        Export CSV
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Training modal */}
      {showTrainingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-full max-w-md">
            <h4 className="font-semibold mb-2">Create Training</h4>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-500">Title</label>
                <input
                  className="w-full border rounded px-2 py-1"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500">
                  Description
                </label>
                <textarea
                  className="w-full border rounded px-2 py-1"
                  rows={3}
                  value={modalDescription}
                  onChange={(e) => setModalDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500">
                  Scheduled date
                </label>
                <input
                  type="date"
                  className="w-full border rounded px-2 py-1"
                  value={modalDate}
                  onChange={(e) => setModalDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500">
                  Participants
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    className="flex-1 border rounded px-2 py-1"
                    placeholder="search employees by name or paste id"
                    value={participantInput}
                    onChange={(e) => setParticipantInput(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowSuggestions(false), 150)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const match = suggestions.find(
                          (s) =>
                            (s.label || "").toLowerCase() ===
                            participantInput.trim().toLowerCase()
                        );
                        if (match) {
                          setModalParticipants((prev) =>
                            prev.some((p) => p.id === match.id)
                              ? prev
                              : [...prev, { id: match.id, label: match.label }]
                          );
                          setParticipantInput("");
                          return;
                        }
                        const raw = participantInput.trim();
                        if (raw) {
                          setModalParticipants((prev) =>
                            prev.some((p) => p.id === raw)
                              ? prev
                              : [...prev, { id: raw, label: raw }]
                          );
                          setParticipantInput("");
                        }
                      }
                    }}
                  />

                  <button
                    type="button"
                    className="px-3 py-1 rounded bg-primary text-white text-sm"
                    onClick={() => {
                      const raw = participantInput.trim();
                      if (!raw) return;
                      const match = suggestions.find(
                        (s) =>
                          (s.label || "").toLowerCase() === raw.toLowerCase()
                      );
                      if (match) {
                        setModalParticipants((prev) =>
                          prev.some((p) => p.id === match.id)
                            ? prev
                            : [...prev, { id: match.id, label: match.label }]
                        );
                        setParticipantInput("");
                        return;
                      }
                      setModalParticipants((prev) =>
                        prev.some((p) => p.id === raw)
                          ? prev
                          : [...prev, { id: raw, label: raw }]
                      );
                      setParticipantInput("");
                    }}
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
                          setModalParticipants((prev) =>
                            prev.some((p) => p.id === s.id)
                              ? prev
                              : [...prev, { id: s.id, label: s.label }]
                          );
                          setParticipantInput("");
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
                  {modalParticipants.map((p) => (
                    <div
                      key={p.id}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded flex items-center gap-2 text-xs"
                    >
                      <span>{p.label || p.id}</span>
                      <button
                        type="button"
                        className="text-red-600"
                        onClick={() =>
                          setModalParticipants((prev) =>
                            prev.filter((x) => x.id !== p.id)
                          )
                        }
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
                  onClick={() => setShowTrainingModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-3 py-1 text-sm rounded bg-primary text-white"
                  onClick={submitTraining}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
