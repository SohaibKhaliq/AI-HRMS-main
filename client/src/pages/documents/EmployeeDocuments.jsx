import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaFile,
  FaDownload,
  FaFileAlt,
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaFileArchive,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaCalendar,
  FaSearch,
  FaFilter,
  FaTrash,
} from "react-icons/fa";
import {
  getMyDocuments,
  uploadEmployeeDocument,
  deleteEmployeeDocument,
} from "../../services/employeeDocument.service";
import { getDocumentTypes } from "../../services/documentType.service";
import toast from "react-hot-toast";

const EmployeeDocuments = () => {
  const dispatch = useDispatch();
  const { myDocuments = [], loading } = useSelector(
    (state) => state.employeeDocument
  );
  const { documentTypes = [] } = useSelector(
    (state) => state.documentType || {}
  );
  // Only show document types that are active in the DB
  const activeDocumentTypes = (documentTypes || []).filter((t) => {
    if (!t) return false;
    const s = t.status || t.status === "" ? String(t.status).toLowerCase() : "";
    return s === "active" || t?.active === true || t?.isActive === true;
  });
  const { user } = useSelector((state) => state.authentication || {});

  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });

  const fetchDocuments = useCallback(() => {
    const params = {};
    if (filters.status) params.status = filters.status;

    dispatch(getMyDocuments(params));
  }, [dispatch, filters.status]);

  useEffect(() => {
    fetchDocuments();
    // request only active document types for employees
    dispatch(getDocumentTypes("active"));
  }, [dispatch, fetchDocuments]);

  useEffect(() => {
    if (filters.status) {
      fetchDocuments();
    }
  }, [filters.status, fetchDocuments]);

  const getFileIcon = (fileType) => {
    if (!fileType) return <FaFile className="text-gray-400" size={24} />;

    if (fileType.includes("pdf"))
      return <FaFilePdf className="text-red-500" size={24} />;
    if (fileType.includes("word") || fileType.includes("document"))
      return <FaFileWord className="text-blue-500" size={24} />;
    if (fileType.includes("image"))
      return <FaFileImage className="text-green-500" size={24} />;
    if (fileType.includes("zip") || fileType.includes("rar"))
      return <FaFileArchive className="text-orange-500" size={24} />;

    return <FaFileAlt className="text-gray-400" size={24} />;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: {
        icon: FaClock,
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        label: "Pending",
      },
      verified: {
        icon: FaCheckCircle,
        color:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        label: "Verified",
      },
      rejected: {
        icon: FaTimesCircle,
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        label: "Rejected",
      },
    };

    const config = statusMap[status] || statusMap.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${kb.toFixed(2)} KB`;
  };

  const handleDownload = (document) => {
    if (document.fileUrl) {
      window.open(document.fileUrl, "_blank");
    } else {
      toast.error("Document file not available");
    }
  };

  const filteredDocuments = (myDocuments || []).filter((doc) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        doc.title?.toLowerCase().includes(searchLower) ||
        doc.description?.toLowerCase().includes(searchLower) ||
        doc.fileName?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const clearFilters = () => {
    setFilters({
      status: "",
      search: "",
    });
  };

  // Upload modal state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    documentType: "",
    title: "",
    description: "",
  });
  const [file, setFile] = useState(null);

  // Auto-select first active type when modal opens or when types change
  useEffect(() => {
    if (!uploadOpen) return;
    if (!uploadForm.documentType && activeDocumentTypes.length > 0) {
      setUploadForm((s) => ({
        ...s,
        documentType: activeDocumentTypes[0]._id,
      }));
    }
  }, [uploadOpen, activeDocumentTypes, uploadForm.documentType]);

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    setFile(f || null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.documentType)
      return toast.error("Please select a document type");
    if (!uploadForm.title) return toast.error("Please enter a title");
    if (!file) return toast.error("Please choose a file to upload");

    const formData = new FormData();
    formData.append("employee", user?._id || user?.id || "");
    formData.append("documentType", uploadForm.documentType);
    formData.append("title", uploadForm.title);
    formData.append("description", uploadForm.description || "");
    // no tags for employee upload
    formData.append("document", file);

    try {
      await dispatch(uploadEmployeeDocument(formData)).unwrap();
      toast.success("Document uploaded");
      setUploadOpen(false);
      setFile(null);
      setUploadForm({
        documentType: "",
        title: "",
        description: "",
      });
      // refresh documents
      dispatch(getMyDocuments({}));
    } catch (err) {
      toast.error(err?.message || "Failed to upload document");
    }
  };

  // Client-side check to avoid duplicate submission UX: if user already has a
  // pending/verified document of the selected type, disable upload and show a message.
  const selectedDocType = uploadForm.documentType;
  const hasSubmittedSameType = (myDocuments || []).some((d) => {
    const dtId = d.documentType?._id || d.documentType;
    return (
      dtId &&
      String(dtId) === String(selectedDocType) &&
      ["pending", "verified"].includes((d.status || "pending").toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Documents</h1>
              <p className="text-blue-100">
                View and download your assigned documents
              </p>
            </div>
            <div>
              <button
                onClick={() => setUploadOpen(true)}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100"
              >
                Upload Document
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Upload Document</h3>
            <form onSubmit={handleUpload} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
                <select
                  value={uploadForm.documentType}
                  onChange={(e) =>
                    setUploadForm((s) => ({
                      ...s,
                      documentType: e.target.value,
                    }))
                  }
                  className="px-3 py-2 border rounded"
                  required
                >
                  <option value="">Select Document Type</option>
                  {activeDocumentTypes.map((t) => (
                    <option
                      key={t._id}
                      value={t._id}
                      title={t.description || ""}
                    >
                      {t.name}
                      {t.description ? ` — ${t.description}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                placeholder="Title"
                value={uploadForm.title}
                onChange={(e) =>
                  setUploadForm((s) => ({ ...s, title: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded"
                required
              />

              <textarea
                placeholder="Description"
                value={uploadForm.description}
                onChange={(e) =>
                  setUploadForm((s) => ({ ...s, description: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded"
                rows={3}
              />

              {/* dates are handled server-side; removed from UI */}

              <div>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadOpen(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <div className="flex flex-col items-end">
                  {hasSubmittedSameType && (
                    <div className="text-sm text-red-600 mb-2">
                      You have already submitted this document type and it is
                      pending or verified.
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={hasSubmittedSameType}
                    className={`px-4 py-2 text-white rounded ${
                      hasSubmittedSameType
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    Upload
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
          >
            <FaFilter />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Document Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse"
            >
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <FaFileAlt className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Documents Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {filters.search || filters.status
              ? "No documents match your search criteria"
              : "You don't have any documents yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => (
            <div
              key={document._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg">
                      {getFileIcon(document.fileType)}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg truncate max-w-[200px]">
                        {document.title}
                      </h3>
                      {document.category?.name && (
                        <p className="text-blue-100 text-sm">
                          {document.category.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                {/* Description */}
                {document.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                    {document.description}
                  </p>
                )}

                {/* File Info */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>{document.fileName}</span>
                  <span>{formatFileSize(document.fileSize)}</span>
                </div>

                {/* Dates */}
                <div className="space-y-2">
                  {document.issueDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <FaCalendar className="text-blue-500" />
                      <span>Issued: {formatDate(document.issueDate)}</span>
                    </div>
                  )}
                  {document.expiryDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <FaCalendar className="text-orange-500" />
                      <span>Expires: {formatDate(document.expiryDate)}</span>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  {getStatusBadge(document.status)}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(document)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FaDownload />
                      Download
                    </button>

                    <button
                      onClick={async () => {
                        if (
                          !confirm(
                            "Are you sure you want to delete this document?"
                          )
                        )
                          return;
                        try {
                          await dispatch(
                            deleteEmployeeDocument(document._id)
                          ).unwrap();
                          toast.success("Document deleted");
                          dispatch(getMyDocuments({}));
                        } catch (err) {
                          toast.error(
                            err?.message || "Failed to delete document"
                          );
                        }
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      title="Delete"
                    >
                      <FaTrash />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>

                {/* Remarks */}
                {document.remarks && (
                  <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300">
                    <strong>Remarks:</strong> {document.remarks}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeDocuments;
