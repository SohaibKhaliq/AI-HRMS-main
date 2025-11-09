import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaFileAlt,
  FaDownload,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";
import {
  getAllEmployeeDocuments,
  verifyDocument,
  rejectDocument,
  deleteEmployeeDocument,
} from "../../services/employeeDocument.service";
import { getAllEmployees } from "../../services/employee.service";
import toast from "react-hot-toast";

const AdminDocuments = () => {
  const dispatch = useDispatch();
  const { allDocuments = [], loading } = useSelector(
    (state) => state.employeeDocument || {}
  );
  const {
    totalPages = 1,
    totalDocuments = 0,
    currentPage: serverPage = 1,
  } = useSelector((state) => state.employeeDocument || {});
  const { employees = [] } = useSelector((state) => state.employee || {});

  const [filters, setFilters] = useState({
    employee: "",
    status: "",
    search: "",
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const fetchDocuments = useCallback(() => {
    const params = { page, limit };
    if (filters.employee) params.employee = filters.employee;
    if (filters.status) params.status = filters.status;
    dispatch(getAllEmployeeDocuments(params));
  }, [dispatch, filters.employee, filters.status, page, limit]);

  useEffect(() => {
    // fetch employees for filter dropdown
    dispatch(getAllEmployees({ currentPage: 1, filters: {} }));
    fetchDocuments();
  }, [dispatch, fetchDocuments]);

  useEffect(() => {
    // when filter values change, reset to first page
    setPage(1);
  }, [filters.employee, filters.status]);

  // Sync local page with server reported current page when responses arrive
  useEffect(() => {
    if (typeof serverPage === "number" && serverPage > 0) setPage(serverPage);
  }, [serverPage]);

  useEffect(() => {
    // refetch when page/limit or filters change
    fetchDocuments();
  }, [fetchDocuments]);

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${kb.toFixed(2)} KB`;
  };

  // date formatting not required here yet

  // Modal state for verify/reject
  const [actionOpen, setActionOpen] = useState(false);
  const [actionType, setActionType] = useState("verify");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [remarks, setRemarks] = useState("");

  const openAction = (doc, type) => {
    setSelectedDoc(doc);
    setActionType(type);
    setRemarks(doc?.remarks || "");
    setActionOpen(true);
  };

  // preview removed per UX request

  const handleAction = async () => {
    if (!selectedDoc) return;
    try {
      if (actionType === "verify") {
        await dispatch(
          verifyDocument({ documentId: selectedDoc._id, remarks })
        ).unwrap();
        toast.success("Document verified");
      } else {
        await dispatch(
          rejectDocument({ documentId: selectedDoc._id, remarks })
        ).unwrap();
        toast.success("Document rejected");
      }
      setActionOpen(false);
      setSelectedDoc(null);
      setRemarks("");
      fetchDocuments();
    } catch (err) {
      toast.error(err?.message || "Failed to update document status");
    }
  };

  const handleDelete = async (doc) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await dispatch(deleteEmployeeDocument(doc._id)).unwrap();
      toast.success("Document deleted");
      fetchDocuments();
    } catch (err) {
      toast.error(err?.message || "Failed to delete document");
    }
  };

  const filtered = (allDocuments || []).filter((doc) => {
    if (filters.search) {
      const s = filters.search.toLowerCase();
      return (
        doc.title?.toLowerCase().includes(s) ||
        doc.fileName?.toLowerCase().includes(s) ||
        doc.employee?.name?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Employee Documents</h1>
              <p className="text-purple-100">
                Verify or reject employee submitted documents
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, file or employee..."
              value={filters.search}
              onChange={(e) =>
                setFilters((s) => ({ ...s, search: e.target.value }))
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <select
            value={filters.employee}
            onChange={(e) =>
              setFilters((s) => ({ ...s, employee: e.target.value }))
            }
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="">All Employees</option>
            {(employees || []).map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`}
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((s) => ({ ...s, status: e.target.value }))
            }
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>

          <button
            onClick={() => setFilters({ employee: "", status: "", search: "" })}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
          >
            <FaFilter className="inline mr-2" /> Clear
          </button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <FaFileAlt className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Documents Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting filters to find documents
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((document) => (
            <div
              key={document._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3">
                    {document.thumbnailUrl ? (
                      <img
                        src={document.thumbnailUrl}
                        alt={document.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-sm">
                        No preview
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        {document.title}
                      </h3>
                      <div className="text-sm text-gray-500">
                        {document.employee?.name ||
                          document.employee?.firstName ||
                          "Unknown"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {document.category?.name}
                </div>
              </div>

              <div className="text-sm text-gray-500 mb-3">
                {document.fileName} • {formatFileSize(document.fileSize)}
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.open(document.fileUrl, "_blank")}
                      className="px-3 py-2 bg-indigo-600 text-white rounded inline-flex items-center whitespace-nowrap"
                    >
                      <FaDownload /> <span className="ml-2">Download</span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {document.status === "verified" && (
                    <span className="text-green-600">Verified</span>
                  )}
                  {document.status === "rejected" && (
                    <span className="text-red-600">Rejected</span>
                  )}
                  {document.status === "pending" && (
                    <span className="text-yellow-600">Pending</span>
                  )}
                  <button
                    onClick={() => openAction(document, "verify")}
                    className="px-3 py-2 bg-green-100 text-green-700 rounded inline-flex items-center whitespace-nowrap"
                  >
                    {" "}
                    <FaCheckCircle />{" "}
                  </button>
                  <button
                    onClick={() => openAction(document, "reject")}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded inline-flex items-center whitespace-nowrap"
                  >
                    {" "}
                    <FaTimesCircle />{" "}
                  </button>
                  <button
                    onClick={() => handleDelete(document)}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded inline-flex items-center whitespace-nowrap"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {document.remarks && (
                <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                  Remarks: {document.remarks}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">Total: {totalDocuments}</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(1)}
            disabled={page <= 1}
            className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            <FaAngleDoubleLeft />
          </button>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            <FaChevronLeft />
          </button>

          <div className="flex items-center gap-2 px-3 py-2">
            <label className="text-sm text-gray-600">Page</label>
            <input
              type="number"
              min={1}
              max={totalPages || 1}
              value={page}
              onChange={(e) =>
                setPage(
                  Math.max(
                    1,
                    Math.min(Number(e.target.value || 1), totalPages || 1)
                  )
                )
              }
              className="w-20 px-2 py-1 border rounded"
            />
            <div className="text-sm text-gray-600">of {totalPages || 1}</div>
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages || 1, p + 1))}
            disabled={page >= (totalPages || 1)}
            className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            <FaChevronRight />
          </button>
          <button
            onClick={() => setPage(totalPages || 1)}
            disabled={page >= (totalPages || 1)}
            className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            <FaAngleDoubleRight />
          </button>

          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="ml-4 px-2 py-1 border rounded"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Preview removed as per UX request */}

      {/* Action Modal */}
      {actionOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">
              {actionType === "verify" ? "Verify Document" : "Reject Document"}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Document: {selectedDoc.title}
            </p>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              rows={4}
              placeholder="Add remarks (optional)"
            ></textarea>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setActionOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                {actionType === "verify" ? "Verify" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDocuments;
