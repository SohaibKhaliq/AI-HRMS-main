import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/shared/loaders/Loader";
import ButtonLoader from "../../components/shared/loaders/ButtonLoader";
import { createResignation, getResignations } from "../../services/resignation.service";
import { employeeResignationSchema } from "../../validations";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { FaCheck, FaEye, FaPlus } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";

const Resignation = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.authentication);
  const { resignations = [], loading } = useSelector((state) => state.resignation || {});
  
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedResignation, setSelectedResignation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formLoading, setFormLoading] = useState(false);
  const [documentFile, setDocumentFile] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(employeeResignationSchema),
    defaultValues: {
      resignationDate: new Date().toISOString().split("T")[0],
      noticePeriod: "30",
      reason: "",
      remarks: "",
    },
  });

  useEffect(() => {
    console.log("Component mounted - fetching resignations...");
    dispatch(getResignations())
      .unwrap()
      .then((data) => {
        console.log("Resignations fetched successfully:", data);
      })
      .catch((error) => {
        console.error("Error fetching resignations:", error);
      });
  }, [dispatch]);

  // Debug: Log resignations data
  useEffect(() => {
    console.log("=== Resignation Debug ===");
    console.log("Total resignations from DB:", resignations.length);
    console.log("Current user ID:", user?._id);
    console.log("All resignations:", resignations);
    const userResignations = resignations.filter(r => {
      console.log("Comparing:", r.employee?._id, "with", user?._id);
      return r.employee?._id === user?._id;
    });
    console.log("User's resignations:", userResignations.length);
    console.log("User's resignation data:", userResignations);
    console.log("=======================");
  }, [resignations, user]);

  // Filter resignations to show only current user's resignations
  const filteredResignations = resignations.filter((resignation) => {
    // Only show current user's resignations
    if (resignation.employee?._id !== user?._id) return false;

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      resignation.reason?.toLowerCase().includes(searchLower) ||
      resignation.remarks?.toLowerCase().includes(searchLower) ||
      resignation.status?.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === "" || resignation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleViewResignation = (resignation) => {
    setSelectedResignation(resignation);
    setShowViewModal(true);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "rejected":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
      default:
        return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200";
    }
  };

  const statusOptions = ["Pending", "Approved", "Rejected"];
  const totalPages = Math.max(1, Math.ceil(filteredResignations.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, filteredResignations.length);
  const paginatedResignations = filteredResignations.slice(startIndex - 1, endIndex);

  // Check if current user has already submitted a resignation
  const userHasResignation = resignations?.some(
    (res) => res.employee?._id === user?._id
  );

  const handleDocumentChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
      const fileExtension = "." + file.name.split(".").pop().toLowerCase();
      const fileSizeMB = file.size / (1024 * 1024);

      if (!allowedTypes.includes(fileExtension)) {
        toast.error("Only PDF, DOC, DOCX, JPG, PNG files are allowed");
        return;
      }

      if (fileSizeMB > 5) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setDocumentFile(file);
      setDocumentPreview(file.name);
    }
  };

  const handleRemoveDocument = () => {
    setDocumentFile(null);
    setDocumentPreview(null);
  };

  const onSubmit = async (data) => {
    try {
      setFormLoading(true);
      const formData = new FormData();
      formData.append("employee", user._id);
      formData.append(
        "resignationDate",
        new Date(data.resignationDate).toISOString()
      );
      formData.append(
        "lastWorkingDay",
        new Date(
          new Date(data.resignationDate).getTime() +
            data.noticePeriod * 24 * 60 * 60 * 1000
        ).toISOString()
      );
      formData.append("noticePeriod", parseInt(data.noticePeriod));
      formData.append("reason", data.reason);
      formData.append("status", "Pending");
      formData.append("remarks", data.remarks);
      if (documentFile) {
        formData.append("document", documentFile);
      }

      console.log("Submitting resignation with data:", {
        employee: user._id,
        resignationDate: data.resignationDate,
        reason: data.reason,
        noticePeriod: data.noticePeriod
      });
      
      const result = await dispatch(createResignation(formData)).unwrap();
      console.log("Resignation created successfully:", result);
      
      setShowSuccessPopup(true);
      setShowModal(false);
      reset();
      setDocumentFile(null);
      setDocumentPreview(null);
      
      // Small delay to ensure backend cache is cleared
      setTimeout(async () => {
        console.log("Refetching resignations after submission...");
        const fetchResult = await dispatch(getResignations()).unwrap();
        console.log("Refetch result:", fetchResult);
      }, 500);
    } catch (error) {
      console.error("Error submitting resignation:", error);
      toast.error("Failed to submit resignation");
    } finally {
      setFormLoading(false);
    }
  };

  // Auto-close success popup after 2 seconds
  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => {
        setShowSuccessPopup(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup]);

  if (loading) return <Loader />;

  return (
    <>
      <Helmet>
        <title>My Resignations - Metro HR</title>
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
            <p className="text-gray-600 mb-2">Resignation submitted successfully!</p>
            <p className="text-sm text-gray-500 mb-6">Your resignation request has been submitted to HR. You will receive an update on your status.</p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <section className="px-1 sm:px-4 bg-gray-200 dark:bg-primary min-h-screen py-4">
        <div className="bg-white dark:bg-secondary rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Resignations
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                View and manage your resignation requests
              </p>
            </div>
            {!userHasResignation && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <FaPlus size={20} />
                Submit Resignation
              </button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Search Bar */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by reason, remarks, status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Statuses</option>
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
                <tr className="bg-red-50 dark:bg-gray-700 border-b-2 border-red-200 dark:border-gray-600">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Submission Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Last Working Day
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Reason
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Notice Period
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedResignations.length > 0 ? (
                  paginatedResignations.map((resignation, index) => (
                    <tr
                      key={resignation._id}
                      className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                        {startIndex + index}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                        {new Date(resignation.resignationDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                        {new Date(resignation.lastWorkingDay).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                        <div className="max-w-xs truncate">
                          {resignation.reason}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(resignation.status)}`}>
                          {resignation.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                        {resignation.noticePeriod} days
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleViewResignation(resignation)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-gray-600 rounded transition"
                            title="View"
                          >
                            <FaEye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <i className="fa-solid fa-person-walking-arrow-loop-left text-5xl text-gray-300 dark:text-gray-600"></i>
                        <div>
                          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                            No resignations found
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {resignations.length > 0 
                              ? "No resignations match your current filters."
                              : userHasResignation ? "You have submitted a resignation." : "You haven't submitted any resignation yet."}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {paginatedResignations.length > 0 ? startIndex : 0} to{" "}
              {endIndex} of {filteredResignations.length} resignations
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
              <span className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium">
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

        {/* Create Resignation Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <i className="fa-solid fa-person-walking-arrow-loop-left text-red-600"></i>
                    Submit Resignation
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      reset();
                      setDocumentFile(null);
                      setDocumentPreview(null);
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Resignation Date */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Resignation Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...register("resignationDate", {
                      required: "Resignation date is required",
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  {errors.resignationDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.resignationDate.message}
                    </p>
                  )}
                </div>

                {/* Notice Period */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Notice Period (Days) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...register("noticePeriod", {
                      required: "Notice period is required",
                      min: { value: 1, message: "Notice period must be at least 1 day" },
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Standard notice period is 30 days
                  </p>
                  {errors.noticePeriod && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.noticePeriod.message}
                    </p>
                  )}
                </div>

                {/* Reason */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Reason for Resignation{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("reason", {
                      required: "Please select a reason",
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select a reason</option>
                    <option value="Career change">Career change</option>
                    <option value="Better opportunities">
                      Better opportunities
                    </option>
                    <option value="Relocation">Relocation</option>
                    <option value="Further education">Further education</option>
                    <option value="Personal reasons">Personal reasons</option>
                    <option value="Health reasons">Health reasons</option>
                    <option value="Family matters">Family matters</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.reason && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.reason.message}
                    </p>
                  )}
                </div>

                {/* Remarks */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Additional Remarks
                  </label>
                  <textarea
                    {...register("remarks")}
                    rows="3"
                    placeholder="Add any additional information or remarks..."
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Document Upload */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Supporting Document (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <input
                      type="file"
                      onChange={handleDocumentChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="hidden"
                      id="document-upload"
                    />
                    {documentPreview ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-file text-red-500 text-lg"></i>
                          <span className="text-sm font-medium text-gray-700">
                            {documentPreview}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveDocument}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          <i className="fa-solid fa-trash"></i> Remove
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="document-upload"
                        className="cursor-pointer flex flex-col items-center justify-center py-6"
                      >
                        <i className="fa-solid fa-cloud-arrow-up text-gray-400 text-3xl mb-2"></i>
                        <p className="text-sm font-medium text-gray-700">
                          Drop your document here or click to browse
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Supported: PDF, DOC, DOCX, JPG, PNG (Max 5MB)
                        </p>
                      </label>
                    )}
                  </div>
                </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 mt-6">
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium disabled:bg-red-400 transition"
                    >
                      {formLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <ButtonLoader />
                          Submitting...
                        </span>
                      ) : (
                        "Submit Resignation"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        reset();
                        setDocumentFile(null);
                        setDocumentPreview(null);
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

        {/* View Resignation Modal */}
        {showViewModal && selectedResignation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Resignation Details
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
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedResignation.status)}`}>
                        {selectedResignation.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Notice Period</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedResignation.noticePeriod} days
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Resignation Date</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {new Date(selectedResignation.resignationDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last Working Day</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {new Date(selectedResignation.lastWorkingDay).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Reason</p>
                    <p className="text-gray-900 dark:text-gray-100">
                      {selectedResignation.reason}
                    </p>
                  </div>

                  {selectedResignation.remarks && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Additional Remarks</p>
                      <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                        {selectedResignation.remarks}
                      </p>
                    </div>
                  )}

                  {selectedResignation.document && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Supporting Document</p>
                      <a
                        href={selectedResignation.document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-sm font-medium"
                      >
                        <i className="fas fa-file"></i>
                        View Document
                      </a>
                    </div>
                  )}

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <i className="fas fa-info-circle text-yellow-600 mr-2"></i>
                      Notice Period Information
                    </p>
                    <p className="text-gray-900 dark:text-gray-100 text-sm">
                      Your resignation will be effective after {selectedResignation.noticePeriod} days notice period. 
                      Your last working day is {new Date(selectedResignation.lastWorkingDay).toLocaleDateString()}.
                    </p>
                  </div>
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

export default Resignation;
