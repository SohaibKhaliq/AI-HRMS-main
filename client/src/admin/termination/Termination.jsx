import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/shared/loaders/Loader";
import FetchError from "../../components/shared/error/FetchError";
import TerminationModal from "../../components/shared/modals/TerminationModal";
import {
  getTerminations,
  deleteTermination,
  updateTermination,
  createTermination,
} from "../../services/termination.service";
import { getAllEmployees } from "../../services/employee.service";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaDownload,
  FaCheck,
} from "react-icons/fa";

const Termination = () => {
  const dispatch = useDispatch();
  const { terminations, loading, error } = useSelector(
    (state) =>
      state.termination || { terminations: [], loading: false, error: null }
  );
  const { employees } = useSelector(
    (state) => state.employee || { employees: [] }
  );

  const [action, setAction] = useState("");
  const [modalOpen, setModalOpen] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    dispatch(getTerminations());
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
    let result = terminations || [];

    // Apply search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.employee?.firstName?.toLowerCase().includes(q) ||
          t.employee?.lastName?.toLowerCase().includes(q) ||
          t.employee?.employeeId?.toLowerCase().includes(q) ||
          t.reason?.toLowerCase().includes(q)
      );
    }

    // Apply type filter
    if (typeFilter) {
      result = result.filter((t) => t.type === typeFilter);
    }

    // Apply status filter
    if (statusFilter) {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Apply date range filter
    if (dateFrom) {
      result = result.filter(
        (t) => new Date(t.terminationDate) >= new Date(dateFrom)
      );
    }
    if (dateTo) {
      result = result.filter(
        (t) => new Date(t.terminationDate) <= new Date(dateTo)
      );
    }

    return result;
  }, [terminations, searchQuery, typeFilter, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const openCreate = () => {
    setAction("create");
    setModalOpen({});
  };
  const openEdit = (t) => {
    setAction("update");
    setModalOpen(t);
  };
  const openView = (t) => {
    setAction("view");
    setModalOpen(t);
  };
  const handleDelete = (id) => {
    if (!confirm("Are you sure you want to delete this termination?")) return;
    dispatch(deleteTermination(id));
  };

  const handleStatusChange = async (termination, newStatus) => {
    await dispatch(
      updateTermination({
        id: termination._id,
        data: { ...termination, status: newStatus },
      })
    );
  };

  const handleModalClose = () => {
    setModalOpen(null);
    setAction("");
  };

  const handleModalSubmit = async (formData) => {
    if (action === "create") {
      await dispatch(createTermination(formData));
      setSuccessMessage("Termination added successfully!");
      setShowSuccessPopup(true);
    } else if (action === "update" && modalOpen?._id) {
      await dispatch(
        updateTermination({
          id: modalOpen._id,
          data: formData,
        })
      );
      setSuccessMessage("Termination updated successfully!");
      setShowSuccessPopup(true);
    }
    handleModalClose();
  };

  const clearFilters = () => {
    setTypeFilter("");
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      "In progress": "bg-blue-100 text-blue-800",
      Completed: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
    };
    return statusStyles[status] || "bg-gray-100 text-gray-800";
  };

  const getTypeBadge = (type) => {
    const typeStyles = {
      retirement: "bg-purple-100 text-purple-800",
      resignation: "bg-orange-100 text-orange-800",
      termination: "bg-red-100 text-red-800",
      redundancy: "bg-yellow-100 text-yellow-800",
      voluntary: "bg-green-100 text-green-800",
      involuntary: "bg-pink-100 text-pink-800",
    };
    return typeStyles[type] || "bg-gray-100 text-gray-800";
  };

  if (error) return <FetchError error={error} />;

  return (
    <>
      <Helmet>
        <title>Terminations - Metro HR</title>
      </Helmet>
      <section className="bg-gray-100 dark:bg-secondary p-4 rounded-lg min-h-screen shadow">
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

        {loading && <Loader />}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Termination Management</h2>
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
                  <div className="font-semibold">Termination</div>
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
                Type Filter
              </label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Types</option>
                <option value="retirement">Retirement</option>
                <option value="resignation">Resignation</option>
                <option value="termination">Termination</option>
                <option value="redundancy">Redundancy</option>
                <option value="voluntary">Voluntary</option>
                <option value="involuntary">Involuntary</option>
              </select>
            </div>
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
                <option value="In progress">In progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
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
          {(typeFilter ||
            statusFilter ||
            dateFrom ||
            dateTo ||
            searchQuery) && (
            <div className="mt-2 text-sm text-blue-600">
              Filters applied: {typeFilter && `Type="${typeFilter}"`}{" "}
              {statusFilter && `Status="${statusFilter}"`}{" "}
              {dateFrom && `From="${dateFrom}"`} {dateTo && `To="${dateTo}"`}
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
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Termination Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notice Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pageData?.map((termination, index) => {
                const empName =
                  termination.employee?.name ||
                  `${termination.employee?.firstName} ${termination.employee?.lastName}`;
                return (
                  <tr
                    key={termination._id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="font-medium">{empName}</div>
                      <div className="text-xs text-gray-500">
                        {termination.employee?.employeeId}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeBadge(
                          termination.type
                        )}`}
                      >
                        {termination.type?.charAt(0).toUpperCase() +
                          termination.type?.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(
                        termination.terminationDate
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(termination.noticeDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {termination.reason}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <select
                        value={termination.status}
                        onChange={(e) =>
                          handleStatusChange(termination, e.target.value)
                        }
                        className={`px-2 py-1 rounded text-xs font-medium border-0 ${getStatusBadge(
                          termination.status
                        )} cursor-pointer`}
                      >
                        <option value="In progress">In progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {termination.documentUrl ? (
                        <a
                          href={termination.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                        >
                          <FaDownload /> View
                        </a>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm flex items-center gap-2">
                      <button
                        onClick={() => openView(termination)}
                        className="text-blue-600 hover:text-blue-800 text-lg"
                        title="View"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => openEdit(termination)}
                        className="text-green-600 hover:text-green-800 text-lg"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(termination._id)}
                        className="text-red-600 hover:text-red-800 text-lg"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {pageData?.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              No terminations found
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 px-4">
          <span className="text-sm text-gray-600">
            Showing{" "}
            {Math.min((currentPage - 1) * pageSize + 1, filtered.length)} to{" "}
            {Math.min(currentPage * pageSize, filtered.length)} of{" "}
            {filtered.length} terminations
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
              if (pageNum <= totalPages) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 text-sm rounded-lg border ${
                      currentPage === pageNum
                        ? "bg-green-600 text-white border-green-600"
                        : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              return null;
            })}
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Modal */}
      <TerminationModal
        isOpen={modalOpen !== null}
        onClose={handleModalClose}
        termination={modalOpen}
        onSubmit={handleModalSubmit}
        action={action}
        employees={employees}
      />
    </>
  );
};

export default Termination;
