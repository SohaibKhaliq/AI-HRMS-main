import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllEmployees } from "../../../services/employee.service";
import { MdClose } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
import { resignationSchema } from "../../../validations";
import PropTypes from "prop-types";
import toast from "react-hot-toast";

const ResignationModal = ({
  isOpen,
  onClose,
  resignation = null,
  onSubmit,
  action,
  employees: propEmployees,
  navigate,
}) => {
  const dispatch = useDispatch();
  const { employees: storeEmployees } = useSelector(
    (state) => state.employee || {}
  );
  const employees = propEmployees || storeEmployees || [];
  const [documentFile, setDocumentFile] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    employee: "",
    resignationDate: "",
    lastWorkingDay: "",
    noticePeriod: "",
    reason: "",
    status: "Pending",
    documentUrl: "",
    remarks: "",
  });

  useEffect(() => {
    if (!storeEmployees || storeEmployees.length === 0) {
      dispatch(getAllEmployees({ currentPage: 1, filters: {} }));
    }
  }, [dispatch, storeEmployees]);

  useEffect(() => {
    if (resignation && isOpen) {
      const empId = resignation.employee?._id || resignation.employee;
      setFormData({
        employee: empId || "",
        resignationDate: resignation.resignationDate
          ? resignation.resignationDate.split("T")[0]
          : "",
        lastWorkingDay: resignation.lastWorkingDay
          ? resignation.lastWorkingDay.split("T")[0]
          : "",
        noticePeriod: resignation.noticePeriod || "",
        reason: resignation.reason || "",
        status: resignation.status || "Pending",
        documentUrl: resignation.documentUrl || "",
        remarks: resignation.remarks || "",
      });
      setDocumentPreview(resignation.documentUrl);
      setDocumentFile(null);
      setValidationErrors({});
    } else {
      setFormData({
        employee: "",
        resignationDate: "",
        lastWorkingDay: "",
        noticePeriod: "",
        reason: "",
        status: "Pending",
        documentUrl: "",
        remarks: "",
      });
      setDocumentFile(null);
      setDocumentPreview(null);
      setValidationErrors({});
    }
  }, [resignation, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
      const fileExtension = "." + file.name.split(".").pop().toLowerCase();
      const fileSizeMB = file.size / (1024 * 1024);

      if (!allowedTypes.includes(fileExtension)) {
        setValidationErrors((prev) => ({
          ...prev,
          document: "* Only PDF, DOC, DOCX, JPG, PNG files are allowed",
        }));
        return;
      }

      if (fileSizeMB > 5) {
        setValidationErrors((prev) => ({
          ...prev,
          document: "* File size must be less than 5MB",
        }));
        return;
      }

      setDocumentFile(file);
      setDocumentPreview(file.name);
      setFormData((prev) => ({ ...prev, documentUrl: file.name }));
      setValidationErrors((prev) => ({ ...prev, document: "" }));
    }
  };

  const handleRemoveDocument = () => {
    setDocumentFile(null);
    setDocumentPreview(null);
    setFormData((prev) => ({ ...prev, documentUrl: "" }));
  };

  const validateForm = () => {
    try {
      resignationSchema.parse(formData);
      setValidationErrors({});
      return true;
    } catch (error) {
      const errors = {};
      error.errors.forEach((err) => {
        const path = err.path[0];
        errors[path] = err.message;
      });
      setValidationErrors(errors);
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (onSubmit) {
      // Create FormData to handle file upload
      const submitData = new FormData();
      submitData.append("employee", formData.employee);
      submitData.append("resignationDate", formData.resignationDate);
      submitData.append("lastWorkingDay", formData.lastWorkingDay);
      submitData.append("noticePeriod", formData.noticePeriod);
      submitData.append("reason", formData.reason);
      submitData.append("status", formData.status);
      submitData.append("remarks", formData.remarks);
      if (documentFile) {
        submitData.append("document", documentFile);
      }
      onSubmit(submitData);
    }
  };

  const isViewMode = action === "view";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            {action === "create"
              ? "Add New Resignation"
              : action === "update"
              ? "Edit Resignation"
              : "View Resignation"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Employee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                name="employee"
                value={formData.employee}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 border ${
                  validationErrors.employee
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                }`}
                required
              >
                <option value="">Select Employee</option>
                {employees?.map((emp) => {
                  const empName =
                    emp.name || `${emp.firstName} ${emp.lastName}`;
                  return (
                    <option key={emp._id} value={emp._id}>
                      {empName}
                    </option>
                  );
                })}
              </select>
              {validationErrors.employee && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.employee}
                </p>
              )}
            </div>

            {/* Resignation Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resignation Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="resignationDate"
                value={formData.resignationDate}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 border ${
                  validationErrors.resignationDate
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                }`}
                required
              />
              {validationErrors.resignationDate && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.resignationDate}
                </p>
              )}
            </div>

            {/* Last Working Day */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Working Day <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="lastWorkingDay"
                value={formData.lastWorkingDay}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 border ${
                  validationErrors.lastWorkingDay
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                }`}
                required
              />
              {validationErrors.lastWorkingDay && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.lastWorkingDay}
                </p>
              )}
            </div>

            {/* Notice Period */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notice Period (Days) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="noticePeriod"
                value={formData.noticePeriod}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 border ${
                  validationErrors.noticePeriod
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                }`}
                required
              />
              {validationErrors.noticePeriod && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.noticePeriod}
                </p>
              )}
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason <span className="text-red-500">*</span>
              </label>
              <select
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 border ${
                  validationErrors.reason ? "border-red-500" : "border-gray-300"
                } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                }`}
                required
              >
                <option value="">Select Reason</option>
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
              {validationErrors.reason && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.reason}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 border ${
                  validationErrors.status ? "border-red-500" : "border-gray-300"
                } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                }`}
                required
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Completed">Completed</option>
              </select>
              {validationErrors.status && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.status}
                </p>
              )}
            </div>

            {/* Document Upload */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Resignation Letter or Document
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-4 ${
                  validationErrors.document
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-gray-50"
                } ${isViewMode ? "" : "hover:bg-gray-100 cursor-pointer"}`}
              >
                {documentPreview ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <i className="fa-solid fa-file text-green-600 text-xl"></i>
                      <span className="text-sm font-medium text-gray-700">
                        {documentPreview}
                      </span>
                    </div>
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={handleRemoveDocument}
                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                      >
                        Remove File
                      </button>
                    )}
                  </div>
                ) : (
                  <label
                    className={`block ${isViewMode ? "" : "cursor-pointer"}`}
                  >
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <i className="fa-solid fa-cloud-arrow-up text-2xl text-gray-400"></i>
                      <span className="text-sm">
                        {isViewMode
                          ? "No document uploaded"
                          : "Click to upload or drag and drop"}
                      </span>
                      <span className="text-xs text-gray-400">
                        PDF, DOC, DOCX, JPG, PNG (max 5MB)
                      </span>
                    </div>
                    {!isViewMode && (
                      <input
                        type="file"
                        onChange={handleDocumentChange}
                        disabled={isViewMode}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                    )}
                  </label>
                )}
              </div>
              {validationErrors.document && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.document}
                </p>
              )}
            </div>

            {/* Remarks */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                disabled={isViewMode}
                rows="3"
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                }`}
                placeholder="Additional remarks or notes"
              />
              {validationErrors.remarks && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.remarks}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
            >
              {isViewMode ? "Close" : "Cancel"}
            </button>
            {isViewMode && navigate && resignation?.employee?._id && (
              <button
                type="button"
                onClick={() => {
                  try {
                    const empId = resignation.employee._id;
                    navigate(`/substitute-analysis?employeeId=${empId}`);
                    onClose();
                  } catch (e) {
                    console.error(e);
                    toast.error("Failed to open substitute analysis");
                  }
                }}
                className="px-6 py-2 text-white bg-amber-500 hover:bg-amber-600 rounded-lg font-medium transition flex items-center gap-2"
              >
                <FaSearch />
                Find Substitute
              </button>
            )}
            {!isViewMode && (
              <button
                type="submit"
                className="px-6 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium transition"
              >
                {action === "update" ? "Update" : "Create"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResignationModal;

ResignationModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  resignation: PropTypes.object,
  onSubmit: PropTypes.func,
  action: PropTypes.string,
  employees: PropTypes.array,
  navigate: PropTypes.func,
};
