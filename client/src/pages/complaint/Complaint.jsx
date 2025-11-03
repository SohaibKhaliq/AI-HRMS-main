import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { complaintTypes } from "../../constants";
import { complaintSchema } from "../../validations";
import { useSelector, useDispatch } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { createComplaint, getComplaints, deleteComplaint } from "../../services/complaint.service";
import ButtonLoader from "../../components/shared/loaders/ButtonLoader";
import { FiSearch, FiEye, FiTrash2, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";

const Complaint = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.authentication);
  const complaintState = useSelector((state) => state.complaint) || {};
  const {
    complaints = [],
    loading = false,
    pagination = {
      currentPage: 1,
      totalPages: 1,
      totalComplaints: 0,
      limit: 10,
    },
  } = complaintState;

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(complaintSchema),
  });

  // Fetch complaints on mount and when filters change
  useEffect(() => {
    dispatch(
      getComplaints({
        page: currentPage,
        limit: pageSize,
        status: statusFilter || undefined,
      })
    );
  }, [dispatch, currentPage, pageSize, statusFilter]);

  // Filter complaints by search and type
  const filteredComplaints = complaints.filter((complaint) => {
    // Only show current user's complaints
    if (complaint.employee?._id !== user?._id) return false;

    const subject = complaint.complainSubject || "";
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = subject.toLowerCase().includes(searchLower);
    const matchesType = !typeFilter || complaint.complainType === typeFilter;

    return matchesSearch && matchesType;
  });

  const onSubmit = (data) => {
    const complaintData = {
      ...data,
      employee: user._id,
    };

    dispatch(createComplaint(complaintData))
      .unwrap()
      .then(() => {
        reset();
        setShowModal(false);
        toast.success("Complaint submitted successfully!");
        // Refetch complaints
        dispatch(
          getComplaints({
            page: currentPage,
            limit: pageSize,
            status: statusFilter || undefined,
          })
        );
      })
      .catch((error) => {
        console.error("Error creating complaint:", error);
        toast.error("Failed to submit complaint");
      });
  };

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setShowViewModal(true);
  };

  const handleDeleteComplaint = (complaintId) => {
    if (window.confirm("Are you sure you want to delete this complaint?")) {
      dispatch(deleteComplaint(complaintId))
        .unwrap()
        .then(() => {
          toast.success("Complaint deleted successfully");
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
          toast.error("Failed to delete complaint");
        });
    }
  };

  const statusOptions = ["Pending", "In Progress", "Resolved", "Closed", "Escalated"];

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
      case "In Progress":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      case "Resolved":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "Closed":
        return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200";
      case "Escalated":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      default:
        return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200";
    }
  };

  // Pagination calculations
  const totalPages = pagination?.totalPages || 1;
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, filteredComplaints.length);

  return (
    <>
      <Helmet>
        <title>My Complaints - Metro HR</title>
      </Helmet>

      <section className="px-1 sm:px-4 bg-gray-200 dark:bg-primary min-h-screen py-4">
        <div className="bg-white dark:bg-secondary rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Complaints
            </h1>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FiPlus size={20} />
              New Complaint
            </button>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Search Bar */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Types</option>
                {complaintTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewComplaint(complaint)}
                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-600 rounded transition"
                            title="View"
                          >
                            <FiEye size={18} />
                          </button>
                          {complaint.status === "Pending" && (
                            <button
                              onClick={() => handleDeleteComplaint(complaint._id)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-gray-600 rounded transition"
                              title="Delete"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                      No complaints found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredComplaints.length > 0 ? startIndex : 0} to{" "}
              {endIndex} of {filteredComplaints.length} complaints
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
              <span className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium">
                {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Create Complaint Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <i className="fas fa-circle-exclamation text-blue-600"></i>
                    Report an Issue
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Complaint Type *
                    </label>
                    <select
                      {...register("complainType")}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors.complainType ? "border-red-500" : "border-gray-300"
                      }`}
                      disabled={loading}
                    >
                      {complaintTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {errors.complainType && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.complainType.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      placeholder="Brief description of the issue"
                      {...register("complainSubject")}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors.complainSubject ? "border-red-500" : "border-gray-300"
                      }`}
                      disabled={loading}
                    />
                    {errors.complainSubject && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.complainSubject.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Details *
                    </label>
                    <textarea
                      placeholder="Provide detailed information about your complaint"
                      rows="5"
                      {...register("complaintDetails")}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors.complaintDetails ? "border-red-500" : "border-gray-300"
                      }`}
                      disabled={loading}
                    ></textarea>
                    {errors.complaintDetails && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.complaintDetails.message}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:bg-blue-400 transition"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <ButtonLoader />
                          Submitting...
                        </span>
                      ) : (
                        "Submit Complaint"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        reset();
                      }}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Complaint Modal */}
        {showViewModal && selectedComplaint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Complaint Details
                  </h2>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedComplaint.complainType}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedComplaint.status)}`}>
                        {selectedComplaint.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Subject</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedComplaint.complainSubject}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Details</p>
                    <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                      {selectedComplaint.complaintDetails}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Submitted On</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {new Date(selectedComplaint.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {selectedComplaint.remarks && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Admin Response
                      </p>
                      <p className="text-gray-900 dark:text-gray-100">
                        {selectedComplaint.remarks}
                      </p>
                    </div>
                  )}

                  {selectedComplaint.assignComplaint && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Assigned To</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedComplaint.assignComplaint.name}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default Complaint;
