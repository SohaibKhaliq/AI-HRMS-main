import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/shared/loaders/Loader";
import FetchError from "../../components/shared/error/FetchError";
import ResignationModal from "../../components/shared/modals/ResignationModal";
import {
  getResignations,
  deleteResignation,
  updateResignation,
  createResignation,
} from "../../services/resignation.service";
import { getAllEmployees } from "../../services/employee.service";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaDownload,
  FaCheck,
} from "react-icons/fa";

const Resignation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { resignations, loading, error } = useSelector(
    (state) =>
      state.resignation || { resignations: [], loading: false, error: null }
  );
  const { employees } = useSelector(
    (state) => state.employee || { employees: [] }
  );

  const [action, setAction] = useState("");
  const [modalOpen, setModalOpen] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [reasonFilter, setReasonFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    dispatch(getResignations());
    if (!employees || employees.length === 0)
      dispatch(getAllEmployees({ currentPage: 1, filters: {} }));
  }, [dispatch, employees]);

  // Auto-close success popup after 2 seconds
  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => {
        setShowSuccessPopup(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup]);

  const filtered = useMemo(() => {
    let result = resignations || [];

    // Apply search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.employee?.firstName?.toLowerCase().includes(q) ||
          r.employee?.lastName?.toLowerCase().includes(q) ||
          r.employee?.employeeId?.toLowerCase().includes(q) ||
          r.reason?.toLowerCase().includes(q)
      );
    }

    // Apply status filter
    if (statusFilter) {
      result = result.filter((r) => r.status === statusFilter);
    }

    // Apply reason filter
    if (reasonFilter) {
      result = result.filter((r) =>
        r.reason?.toLowerCase().includes(reasonFilter.toLowerCase())
      );
    }

    // Apply date range filter
    if (dateFrom) {
      result = result.filter(
        (r) => new Date(r.resignationDate) >= new Date(dateFrom)
      );
    }
    if (dateTo) {
      result = result.filter(
        (r) => new Date(r.resignationDate) <= new Date(dateTo)
      );
    }

    return result;
  }, [resignations, searchQuery, statusFilter, reasonFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const openCreate = () => {
    setAction("create");
    setModalOpen({});
  };
  const openEdit = (r) => {
    setAction("update");
    setModalOpen(r);
  };
  const openView = (r) => {
    setAction("view");
    setModalOpen(r);
  };
  const handleDelete = (id) => {
    if (!confirm("Are you sure you want to delete this resignation?")) return;
    dispatch(deleteResignation(id));
  };

  const handleStatusChange = async (resignation, newStatus) => {
    await dispatch(
      updateResignation({
        id: resignation._id,
        data: { ...resignation, status: newStatus },
      })
    );
  };

  const handleModalClose = () => {
    setModalOpen(null);
    setAction("");
  };

  const handleModalSubmit = async (formData) => {
    if (action === "create") {
      await dispatch(createResignation(formData));
      setSuccessMessage("Resignation added successfully!");
      setShowSuccessPopup(true);
    } else if (action === "update" && modalOpen?._id) {
      await dispatch(
        updateResignation({
          id: modalOpen._id,
          data: formData,
        })
      );
      setSuccessMessage("Resignation updated successfully!");
      setShowSuccessPopup(true);
    }
    handleModalClose();
  };

  const clearFilters = () => {
    setStatusFilter("");
    setReasonFilter("");
    setDateFrom("");
    setDateTo("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  if (error) return <FetchError error={error} />;

  return (
    <>
      <Helmet>
        <title>Resignations - Metro HR</title>
      </Helmet>

      {/* Success Popup Modal */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-sm w-full mx-4 text-center animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <FaCheck className="text-green-600 text-2xl" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-600 mb-6">{successMessage}</p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <section className="bg-gray-100 dark:bg-secondary p-4 rounded-lg min-h-screen shadow">
        {loading && <Loader />}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Resignation Management</h2>
          <div className="flex-1 ml-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full">
              <div className="relative flex-1">
                <input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full p-3 pl-4 rounded-full bg-white border border-gray-200 text-sm placeholder-gray-400"
                />
              </div>
              <button
                onClick={() => setCurrentPage(1)}
                className="bg-green-500 hover:bg-green-600 text-white text-sm px-5 py-2 rounded-full shadow"
              >
                Search
              </button>
              <button className="bg-white border border-gray-200 text-sm px-4 py-2 rounded-full">
                Filters
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white border border-gray-200 rounded p-2 flex items-center gap-2">
                <span className="text-sm text-gray-600 mr-1">Per Page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="text-sm bg-transparent outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <button
                onClick={openCreate}
                className="bg-green-600 hover:bg-green-700 text-white text-sm px-6 py-3 rounded-full inline-flex items-center gap-3"
              >
                <FaPlus className="text-lg" />
                <div className="text-left">
                  <div className="text-xs">Add</div>
                  <div className="font-semibold">Resignation</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Reason Filter
              </label>
              <input
                type="text"
                placeholder="Search reason..."
                value={reasonFilter}
                onChange={(e) => {
                  setReasonFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 opacity-0">
                Action
              </label>
              <button
                onClick={clearFilters}
                className="bg-gray-400 hover:bg-gray-500 text-white text-sm px-3 py-2 rounded-lg"
              >
                Clear Filters
              </button>
            </div>
          </div>
          {(statusFilter ||
            dateFrom ||
            dateTo ||
            searchQuery ||
            reasonFilter) && (
            <div className="mt-2 text-sm text-blue-600">
              Filters applied: {statusFilter && `Status="${statusFilter}"`}{" "}
              {dateFrom && `From="${dateFrom}"`} {dateTo && `To="${dateTo}"`}{" "}
              {reasonFilter && `Reason="${reasonFilter}"`}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resignation Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Working Day
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notice Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pageData.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No resignations found
                  </td>
                </tr>
              ) : (
                pageData.map((r, idx) => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {(() => {
                        // Resolve employee object: it may be populated or just an id/partial object
                        const empFromRow = r.employee;
                        let emp = empFromRow;
                        if (empFromRow && typeof empFromRow === "string") {
                          emp =
                            employees.find((e) => e._id === empFromRow) || null;
                        }
                        // If nested object contains only employeeId, try to map from global employees
                        if (
                          emp &&
                          emp.employeeId &&
                          !emp.firstName &&
                          employees
                        ) {
                          emp =
                            employees.find(
                              (e) => e.employeeId === emp.employeeId
                            ) || emp;
                        }

                        const displayName =
                          emp?.name ||
                          `${emp?.firstName || ""} ${
                            emp?.lastName || ""
                          }`.trim();
                        if (displayName) return displayName;
                        // Fallback: hide numeric employeeId, show placeholder
                        return "-";
                      })()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {r.resignationDate
                        ? new Date(r.resignationDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {r.lastWorkingDay
                        ? new Date(r.lastWorkingDay).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {r.noticePeriod || 0} days
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {r.reason || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r, e.target.value)}
                        className={`px-2 py-1 rounded text-xs font-medium border cursor-pointer ${
                          r.status === "Approved"
                            ? "bg-green-100 text-green-700 border-green-300"
                            : r.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                            : r.status === "Rejected"
                            ? "bg-red-100 text-red-700 border-red-300"
                            : "bg-blue-100 text-blue-700 border-blue-300"
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {r.documentUrl ? (
                        <a
                          href={r.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaDownload className="inline" />
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openView(r)}
                          title="View"
                          className="text-blue-600 p-2 rounded-full hover:bg-blue-50"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => openEdit(r)}
                          title="Edit"
                          className="text-green-600 p-2 rounded-full hover:bg-green-50"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(r._id)}
                          title="Delete"
                          className="text-red-600 p-2 rounded-full hover:bg-red-50"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4 mb-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded text-sm ${
                  currentPage === page
                    ? "bg-green-600 text-white"
                    : "border border-gray-300 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </section>

      {/* Modal */}
      <ResignationModal
        isOpen={!!modalOpen}
        onClose={handleModalClose}
        resignation={modalOpen}
        onSubmit={action === "view" ? null : handleModalSubmit}
        action={action}
        employees={employees}
        navigate={navigate}
      />
    </>
  );
};

export default Resignation;
