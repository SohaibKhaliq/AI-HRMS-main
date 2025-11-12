import { useEffect, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaUndo, FaClock } from "react-icons/fa";
import {
  getAutoClosedTimeEntries,
  reopenTimeEntry,
} from "../../services/timeEntry.service";
import toast from "react-hot-toast";

const AutoClockouts = () => {
  const dispatch = useDispatch();
  useSelector((state) => state.timeEntry);
  const [entries, setEntries] = useState([]);
  const [busyId, setBusyId] = useState(null);

  const fetch = useCallback(async () => {
    try {
      const res = await dispatch(getAutoClosedTimeEntries()).unwrap();
      setEntries(res.timeEntries || []);
    } catch (e) {
      toast.error(e || "Failed to fetch auto-closed entries");
    }
  }, [dispatch]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleReopen = async (id) => {
    if (!id) return;
    setBusyId(id);
    try {
      await dispatch(reopenTimeEntry({ id })).unwrap();
      toast.success("Time entry reopened");
      // Refresh list
      await fetch();
    } catch (e) {
      toast.error(e || "Failed to reopen entry");
    } finally {
      setBusyId(null);
    }
  };

  const formatDateTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <FaClock className="text-2xl text-green-600" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Auto-Clocked Out Entries
        </h2>
      </div>

      {entries.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400">
          No auto-closed entries found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Employee</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Clock In</th>
                <th className="px-4 py-2 text-left">Clock Out</th>
                <th className="px-4 py-2 text-left">Work Hours</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr
                  key={e._id}
                  className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700"
                >
                  <td className="px-4 py-2">
                    {e.employee?.name || e.employee?.employeeId || "-"}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(e.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">{formatDateTime(e.clockIn)}</td>
                  <td className="px-4 py-2">{formatDateTime(e.clockOut)}</td>
                  <td className="px-4 py-2">{(e.workHours || 0).toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <button
                      disabled={busyId === e._id}
                      onClick={() => handleReopen(e._id)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                    >
                      <FaUndo /> {busyId === e._id ? "Reopening..." : "Reopen"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AutoClockouts;
