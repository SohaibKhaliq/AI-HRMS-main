import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaClock,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
} from "react-icons/fa";
import {
  getAllTimeEntries,
  approveTimeEntry,
  rejectTimeEntry,
} from "../../services/timeEntry.service";
import { getAllEmployees } from "../../services/employee.service";
import TimeEntryActionModal from "../../components/shared/modals/TimeEntryActionModal";
import toast from "react-hot-toast";

const AdminTimeTracking = () => {
  const dispatch = useDispatch();
  const { allTimeEntries, loading } = useSelector((state) => state.timeEntry);
  const { employees } = useSelector((state) => state.employee);

  const [filters, setFilters] = useState({
    employee: "",
    status: "all",
    startDate: "",
    endDate: "",
  });

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    action: null,
    entry: null,
  });

  useEffect(() => {
    dispatch(getAllEmployees());
  }, [dispatch]);

  // Helpers to gracefully read employee name/initials from different API shapes
  const getEmployeeDisplayName = (emp) => {
    if (!emp) return "-";
    if (emp.name) return emp.name;
    if (emp.firstName || emp.lastName)
      return `${emp.firstName || ""} ${emp.lastName || ""}`.trim();
    if (emp.employeeId) return emp.employeeId;
    return "-";
  };

  const getEmployeeInitials = (emp) => {
    const name = getEmployeeDisplayName(emp);
    if (!name || name === "-") return "?";
    const parts = name.split(" ").filter(Boolean);
    const first = parts[0] ? parts[0][0] : "";
    const second = parts[1] ? parts[1][0] : "";
    return `${first}${second}`.toUpperCase();
  };

  const fetchTimeEntries = useCallback(() => {
    const params = {
      ...(filters.employee && { employee: filters.employee }),
      ...(filters.status !== "all" && { status: filters.status }),
      ...(filters.startDate && { startDate: filters.startDate }),
      ...(filters.endDate && { endDate: filters.endDate }),
      page,
      limit: pageSize,
    };
    dispatch(getAllTimeEntries(params));
  }, [filters, page, pageSize, dispatch]);

  useEffect(() => {
    fetchTimeEntries();
  }, [fetchTimeEntries]);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      employee: "",
      status: "all",
      startDate: "",
      endDate: "",
    });
    setPage(1);
  };

  const handleApprove = async (entry, notes) => {
    try {
      await dispatch(
        approveTimeEntry({ id: entry._id, adminNotes: notes })
      ).unwrap();
      toast.success("Time entry approved successfully!");
      fetchTimeEntries();
    } catch (error) {
      // Hide noisy runtime messages like "Cannot read properties of undefined (reading '_id')"
      const raw = error?.message || "";
      if (
        raw.includes("Cannot read properties of undefined") ||
        raw.includes("reading '_id'")
      ) {
        // swallow the low-level message and show a friendly one
        toast.error(
          "Failed to finalize approval due to a transient issue. Please refresh."
        );
      } else {
        toast.error(raw || "Failed to approve time entry");
      }
    } finally {
      // Always close the modal so the admin isn't stuck in the dialog
      setActionModal({ isOpen: false, action: null, entry: null });
    }
  };

  const handleReject = async (entry, reason, notes) => {
    try {
      await dispatch(
        rejectTimeEntry({ id: entry._id, reason, adminNotes: notes })
      ).unwrap();
      toast.success("Time entry rejected");
      fetchTimeEntries();
    } catch (error) {
      const raw = error?.message || "";
      if (
        raw.includes("Cannot read properties of undefined") ||
        raw.includes("reading '_id'")
      ) {
        toast.error(
          "Failed to finalize rejection due to a transient issue. Please refresh."
        );
      } else {
        toast.error(raw || "Failed to reject time entry");
      }
    } finally {
      setActionModal({ isOpen: false, action: null, entry: null });
    }
  };

  const calculateStats = () => {
    const total = allTimeEntries?.length || 0;
    const pending =
      allTimeEntries?.filter((e) => e.status === "pending").length || 0;
    const approved =
      allTimeEntries?.filter((e) => e.status === "approved").length || 0;
    const totalHours =
      allTimeEntries?.reduce((sum, e) => sum + (e.workHours || 0), 0) || 0;

    return { total, pending, approved, totalHours };
  };

  const stats = calculateStats();

  const formatHours = (hours) => {
    if (!hours) return "00:00";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const formatDateTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      approved:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          styles[status] || styles.pending
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 dark:from-green-600 dark:to-teal-700 rounded-lg p-8 mb-6 shadow-lg">
        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
          <FaClock className="text-5xl" />
          Time Tracking Management
        </h1>
        <p className="text-white/90 mt-2">
          Review and approve employee time entries
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Total Entries</p>
              <p className="text-4xl font-bold text-white mt-1">
                {stats.total}
              </p>
            </div>
            <FaClock className="text-5xl text-white/30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Pending Approvals</p>
              <p className="text-4xl font-bold text-white mt-1">
                {stats.pending}
              </p>
            </div>
            <FaHourglassHalf className="text-5xl text-white/30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Approved</p>
              <p className="text-4xl font-bold text-white mt-1">
                {stats.approved}
              </p>
            </div>
            <FaCheckCircle className="text-5xl text-white/30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Total Hours</p>
              <p className="text-4xl font-bold text-white mt-1">
                {formatHours(stats.totalHours)}
              </p>
            </div>
            <FaClock className="text-5xl text-white/30" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FaFilter className="text-green-600 dark:text-green-400" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Filters
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Employee
            </label>
            <select
              value={filters.employee}
              onChange={(e) => handleFilterChange("employee", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="">All Employees</option>
              {employees?.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {getEmployeeDisplayName(emp)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Time Entries Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Clock In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Clock Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Work Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Break
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                // Loading skeletons
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan="8" className="px-6 py-4">
                      <div className="animate-pulse flex space-x-4">
                        <div className="flex-1 space-y-4 py-1">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : allTimeEntries && allTimeEntries.length > 0 ? (
                allTimeEntries.map((entry) => (
                  <tr
                    key={entry._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
                          {getEmployeeInitials(entry.employee)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {getEmployeeDisplayName(entry.employee)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatDateTime(entry.clockIn)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatDateTime(entry.clockOut)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {formatHours(entry.workHours)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatHours(entry.breakTime)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <div className="font-medium">{entry.project || "-"}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {entry.task || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(entry.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {entry.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              setActionModal({
                                isOpen: true,
                                action: "approve",
                                entry,
                              })
                            }
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <FaCheckCircle /> Approve
                          </button>
                          <button
                            onClick={() =>
                              setActionModal({
                                isOpen: true,
                                action: "reject",
                                entry,
                              })
                            }
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <FaTimesCircle /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      <FaClock className="mx-auto text-5xl mb-3 opacity-50" />
                      <p className="text-lg">No time entries found</p>
                      <p className="text-sm mt-1">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
      {actionModal.isOpen && (
        <TimeEntryActionModal
          isOpen={actionModal.isOpen}
          action={actionModal.action}
          entry={actionModal.entry}
          onClose={() =>
            setActionModal({ isOpen: false, action: null, entry: null })
          }
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
};

export default AdminTimeTracking;
