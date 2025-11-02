import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllEmployees } from "../../../services/employee.service";
import { MdClose } from "react-icons/md";
import { terminationSchema } from "../../../validations";

const TerminationModal = ({ isOpen, onClose, termination = null, onSubmit, action, employees: propEmployees }) => {
  const dispatch = useDispatch();
  const { employees: storeEmployees } = useSelector((state) => state.employee || {});
  const employees = propEmployees || storeEmployees || [];
  const [documentFile, setDocumentFile] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    employee: "",
    type: "",
    terminationDate: "",
    noticeDate: "",
    reason: "",
    status: "In progress",
    documentUrl: "",
    remarks: "",
  });

  useEffect(() => {
    if (!storeEmployees || storeEmployees.length === 0) {
      dispatch(getAllEmployees({ currentPage: 1, filters: {} }));
    }
  }, [dispatch, storeEmployees]);

  useEffect(() => {
    if (termination && isOpen) {
      const empId = termination.employee?._id || termination.employee;
      setFormData({
        employee: empId || "",
        type: termination.type || "",
        terminationDate: termination.terminationDate
          ? termination.terminationDate.split("T")[0]
          : "",
        noticeDate: termination.noticeDate
          ? termination.noticeDate.split("T")[0]
          : "",
        reason: termination.reason || "",
        status: termination.status || "In progress",
        documentUrl: termination.documentUrl || "",
        remarks: termination.remarks || "",
      });
      setDocumentPreview(termination.documentUrl);
      setDocumentFile(null);
      setValidationErrors({});
    } else {
      setFormData({
        employee: "",
        type: "",
        terminationDate: "",
        noticeDate: "",
        reason: "",
        status: "In progress",
        documentUrl: "",
        remarks: "",
      });
      setDocumentFile(null);
      setDocumentPreview(null);
      setValidationErrors({});
    }
  }, [termination, isOpen]);

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
      terminationSchema.parse(formData);
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
      submitData.append("type", formData.type);
      submitData.append("terminationDate", formData.terminationDate);
      submitData.append("noticeDate", formData.noticeDate);
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
            {action === "create" ? "Add New Termination" : action === "update" ? "Edit Termination" : "View Termination"}
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
                  validationErrors.employee ? "border-red-500" : "border-gray-300"
                } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                }`}
                required
              >
                <option value="">Select Employee</option>
                {employees?.map((emp) => {
                  const empName = emp.name || `${emp.firstName} ${emp.lastName}`;
                  return (
                    <option key={emp._id} value={emp._id}>
                      {empName} ({emp.employeeId})
                    </option>
                  );
                })}
              </select>
              {validationErrors.employee && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.employee}</p>
              )}
            </div>

            {/* Termination Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 border ${
                  validationErrors.type ? "border-red-500" : "border-gray-300"
                } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                }`}
                required
              >
                <option value="">Select Type</option>
                <option value="Retirement">Retirement</option>
                <option value="Resignation">Resignation</option>
                <option value="Termination">Termination</option>
                <option value="Redundancy">Redundancy</option>
                <option value="Voluntary">Voluntary</option>
                <option value="Involuntary">Involuntary</option>
              </select>
              {validationErrors.type && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.type}</p>
              )}
            </div>

            {/* Termination Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Termination Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="terminationDate"
                value={formData.terminationDate}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 border ${
                  validationErrors.terminationDate ? "border-red-500" : "border-gray-300"
                } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                }`}
                required
              />
              {validationErrors.terminationDate && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.terminationDate}</p>
              )}
            </div>

            {/* Notice Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notice Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="noticeDate"
                value={formData.noticeDate}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 border ${
                  validationErrors.noticeDate ? "border-red-500" : "border-gray-300"
                } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                }`}
                required
              />
              {validationErrors.noticeDate && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.noticeDate}</p>
              )}
            </div>

            {/* Reason */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                disabled={isViewMode}
                rows="2"
                className={`w-full px-3 py-2 border ${
                  validationErrors.reason ? "border-red-500" : "border-gray-300"
                } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                }`}
                placeholder="Reason for termination (min 10 characters)"
                required
              />
              <div className="flex justify-between items-start">
                {validationErrors.reason && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.reason}</p>
                )}
                <p className={`text-xs mt-1 ${formData.reason.length > 450 ? "text-red-500" : "text-gray-500"}`}>
                  {formData.reason.length}/500
                </p>
              </div>
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
                <option value="In progress">In progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              {validationErrors.status && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.status}</p>
              )}
            </div>

            {/* Document Upload */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Termination Document
              </label>
              <div className={`border-2 border-dashed rounded-lg p-4 ${
                validationErrors.document ? "border-red-500 bg-red-50" : "border-gray-300 bg-gray-50"
              } ${isViewMode ? "" : "hover:bg-gray-100 cursor-pointer"}`}>
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
                  <label className={`block ${isViewMode ? "" : "cursor-pointer"}`}>
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <i className="fa-solid fa-cloud-arrow-up text-2xl text-gray-400"></i>
                      <span className="text-sm">
                        {isViewMode ? "No document uploaded" : "Click to upload or drag and drop"}
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
                <p className="text-red-500 text-xs mt-1">{validationErrors.document}</p>
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
                placeholder="Additional remarks or notes (optional)"
              />
              <div className="flex justify-between items-start">
                {validationErrors.remarks && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.remarks}</p>
                )}
                <p className={`text-xs mt-1 ${formData.remarks.length > 450 ? "text-red-500" : "text-gray-500"}`}>
                  {formData.remarks.length}/500
                </p>
              </div>
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

export default TerminationModal;
