import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet";
// Removed unused MdAdd import
import { FiSearch, FiEye, FiEdit, FiTrash2 } from "react-icons/fi";
import {
  getComplaints,
  respondToComplaintRequest,
  deleteComplaint,
} from "../../services/complaint.service";
import { getAllEmployees } from "../../services/employee.service";
import ComplaintModal from "../../components/shared/modals/ComplaintModal";
import Loader from "../../components/shared/loaders/Loader";
import FetchError from "../../components/shared/error/FetchError";

const Complaint = () => {
  const dispatch = useDispatch();
  const complaintState = useSelector((state) => state.complaint) || {};
  const {
    complaints = [],
    loading = false,
    error = null,
    pagination = {
      currentPage: 1,
      totalPages: 1,
      totalComplaints: 0,
      limit: 10,
    },
  } = complaintState;
  const { employees = [] } = useSelector((state) => state.employee);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("create");
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const complaintTypes = [
    "Leave",
    "Workplace",
    "Payroll",
    "Harassment",
    "Scheduling",
    "Misconduct",
    "Discrimination",
    "Safety",
    "Other",
  ];

  const statusOptions = [
    "Pending",
    "In Progress",
    "Resolved",
    "Closed",
    "Escalated",
  ];

  // Fetch complaints
  useEffect(() => {
    dispatch(
      getComplaints({
        page: currentPage,
        limit: pageSize,
        status: statusFilter || undefined,
      })
    );
  }, [dispatch, currentPage, pageSize, statusFilter]);

  // Fetch employees if not already loaded
  useEffect(() => {
    if (employees.length === 0) {
      dispatch(getAllEmployees({ currentPage: 1, filters: {} }));
    }
  }, [dispatch, employees.length]);

  // Filter complaints based on search query
  const filteredComplaints = complaints.filter((complaint) => {
    const complainant = complaint.employee?.name || "";
    const against = complaint.againstEmployee?.name || "";
    const subject = complaint.complainSubject || "";
    const searchLower = searchQuery.toLowerCase();

    const matchesSearch =
      complainant.toLowerCase().includes(searchLower) ||
      against.toLowerCase().includes(searchLower) ||
      subject.toLowerCase().includes(searchLower);

    const matchesType = !typeFilter || complaint.complainType === typeFilter;

    return matchesSearch && matchesType;
  });

  const handleOpenModal = (action = "create", complaint = null) => {
    setModalAction(action);
    setSelectedComplaint(complaint);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedComplaint(null);
  };

  const handleStatusChange = (complaintId, newStatus, currentStatus) => {
    if (newStatus === currentStatus) return; // No change

    dispatch(
      respondToComplaintRequest({
        complaintID: complaintId,
        status: newStatus,
        remarks: `Status changed from ${currentStatus} to ${newStatus}`,
      })
    )
      .unwrap()
      .then(() => {
        // Refetch complaints to update UI
        dispatch(
          getComplaints({
            page: currentPage,
            limit: pageSize,
            status: statusFilter || undefined,
          })
        );
      })
      .catch((error) => {
        console.error("Error updating complaint status:", error);
      });
  };

  const handleDelete = (complaintId) => {
    if (window.confirm("Are you sure you want to delete this complaint?")) {
      dispatch(deleteComplaint(complaintId))
        .unwrap()
        .then(() => {
          // Refetch complaints after delete
          dispatch(
            getComplaints({
              page: currentPage,
              limit: pageSize,
              status: statusFilter || undefined,
            })
          );
        })
        .catch((error) => {
          console.error("Error deleting complaint:", error);
        });
    }
  };

  const handleModalSubmit = (formData) => {
    console.log("Submit complaint:", formData);
    // Modal submit is handled by ComplaintModal component
    handleCloseModal();
    // Refetch to show latest data
    dispatch(
      getComplaints({
        page: currentPage,
        limit: pageSize,
        status: statusFilter || undefined,
      })
    );
  };

  // Pagination calculations
  const totalPages = pagination?.totalPages || 1;
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(
    currentPage * pageSize,
    pagination?.totalComplaints || 0
  );

  // current user authentication state not needed in this component

  if (error) return <FetchError error={error} />;

  return (
    <>
      <Helmet>
        <title>Complaints - Metro HR</title>
      </Helmet>

      {loading && <Loader />}

      <div className="bg-white dark:bg-secondary rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Complaints
          </h1>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Search Bar */}
          <div className="md:col-span-2">
            <div className="relative">
              <FiSearch
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by complainant, against, subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Types</option>
              {complaintTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-50 dark:bg-gray-700 border-b-2 border-blue-200 dark:border-gray-600">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  #
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Complainant
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Against
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Subject
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Documents
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.length > 0 ? (
                filteredComplaints.map((complaint, index) => (
                  <tr
                    key={complaint._id}
                    className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                      {startIndex + index}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                      <div className="font-medium">
                        {complaint.employee?.name || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {complaint.employee?.employeeId}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                      {complaint.againstEmployee?.name || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        {complaint.complainType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                      <div className="max-w-xs truncate">
                        {complaint.complainSubject}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <select
                        value={complaint.status}
                        onChange={(e) =>
                          handleStatusChange(
                            complaint._id,
                            e.target.value,
                            complaint.status
                          )
                        }
                        className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${
                          complaint.status === "Pending"
                            ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                            : complaint.status === "In Progress"
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                            : complaint.status === "Resolved"
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            : complaint.status === "Closed"
                            ? "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                            : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                        }`}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {complaint.documentUrl ? (
                        <a
                          href={complaint.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 underline"
                        >
                          View Document
                        </a>
                      ) : (
                        <span className="text-gray-400">No Document</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal("view", complaint)}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-600 rounded transition"
                          title="View"
                        >
                          <FiEye size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenModal("edit", complaint)}
                          className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-gray-600 rounded transition"
                          title="Edit"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(complaint._id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-gray-600 rounded transition"
                          title="Delete"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="10"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No complaints found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredComplaints.length > 0 ? startIndex : 0} to{" "}
            {endIndex} of {pagination?.totalComplaints || 0} complaints
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Per Page:
            </label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium">
              {currentPage}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Complaint Modal */}
      <ComplaintModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        complaint={selectedComplaint}
        action={modalAction}
        employees={employees}
        onSubmit={handleModalSubmit}
      />
    </>
  );
};

export default Complaint;
