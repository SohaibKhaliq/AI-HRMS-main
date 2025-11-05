import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { MdClose } from "react-icons/md";
import { complaintSchema } from "../../../validations";
import ValidatedInput from "../../ui/ValidatedInput";

const ComplaintModal = ({ isOpen, onClose, complaint = null, action, employees = [], onSubmit }) => {
  const [documentFile, setDocumentFile] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    employee: "",
    againstEmployee: "",
    complainType: "",
    complainSubject: "",
    complaintDetails: "",
    status: "Pending",
    documentUrl: "",
    remarks: "",
  });

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

  useEffect(() => {
    if (complaint && isOpen) {
      setFormData({
        employee: complaint.employee?._id || complaint.employee || "",
        againstEmployee: complaint.againstEmployee?._id || complaint.againstEmployee || "",
        complainType: complaint.complainType || "",
        complainSubject: complaint.complainSubject || "",
        complaintDetails: complaint.complaintDetails || "",
        status: complaint.status || "Pending",
        documentUrl: complaint.documentUrl || "",
        remarks: complaint.remarks || "",
      });
      setDocumentPreview(complaint.documentUrl);
      setDocumentFile(null);
      setValidationErrors({});
    } else {
      setFormData({
        employee: "",
        againstEmployee: "",
        complainType: "",
        complainSubject: "",
        complaintDetails: "",
        status: "Pending",
        documentUrl: "",
        remarks: "",
      });
      setDocumentFile(null);
      setDocumentPreview(null);
      setValidationErrors({});
    }
  }, [complaint, isOpen]);

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
      complaintSchema.parse(formData);
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
      const submitData = new FormData();
      submitData.append("employee", formData.employee);
      submitData.append("againstEmployee", formData.againstEmployee);
      submitData.append("complainType", formData.complainType);
      submitData.append("complainSubject", formData.complainSubject);
      submitData.append("complaintDetails", formData.complaintDetails);
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
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-screen overflow-y-auto dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {action === "create" ? "Add New Complaint" : action === "edit" ? "Edit Complaint" : "View Complaint"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Complainant Employee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Complainant <span className="text-red-500">*</span>
              </label>
              <select
                name="employee"
                value={formData.employee}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 border ${
                  validationErrors.employee ? "border-red-500" : "border-gray-300"
                } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-700"
                } dark:border-gray-600 dark:text-white`}
                required
              >
                <option value="">Select Complainant</option>
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

            {/* Against Employee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Against Employee
              </label>
              <select
                name="againstEmployee"
                value={formData.againstEmployee}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-700"
                } dark:border-gray-600 dark:text-white`}
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
            </div>

            {/* Complaint Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Complaint Type <span className="text-red-500">*</span>
              </label>
              <select
                name="complainType"
                value={formData.complainType}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 border ${
                  validationErrors.complainType ? "border-red-500" : "border-gray-300"
                } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-700"
                } dark:border-gray-600 dark:text-white`}
                required
              >
                <option value="">Select Type</option>
                {complaintTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {validationErrors.complainType && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.complainType}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-700"
                } dark:border-gray-600 dark:text-white`}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div className="col-span-2">
              <ValidatedInput
                type="text"
                name="complainSubject"
                value={formData.complainSubject}
                onChange={handleChange}
                validationType="subject"
                validationOptions={{
                  fieldName: "Subject",
                  minLength: 5,
                  maxLength: 150
                }}
                label="Subject"
                disabled={isViewMode}
                required
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-700"
                } dark:border-gray-600 dark:text-white`}
              />
              {validationErrors.complainSubject && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.complainSubject}</p>
              )}
            </div>

            {/* Complaint Details */}
            <div className="col-span-2">
              <ValidatedInput
                type="textarea"
                name="complaintDetails"
                value={formData.complaintDetails}
                onChange={handleChange}
                validationType="description"
                validationOptions={{
                  fieldName: "Complaint details",
                  minLength: 10,
                  maxLength: 1000
                }}
                label="Complaint Details"
                disabled={isViewMode}
                required
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-700"
                } dark:border-gray-600 dark:text-white`}
              />
              <div className="flex justify-between items-start">
                {validationErrors.complaintDetails && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.complaintDetails}</p>
                )}
                <p className={`text-xs mt-1 ${formData.complaintDetails.length > 900 ? "text-red-500" : "text-gray-500"}`}>
                  {formData.complaintDetails.length}/1000
                </p>
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                disabled={isViewMode}
                rows="2"
                placeholder="Additional remarks"
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-700"
                } dark:border-gray-600 dark:text-white`}
              />
            </div>

            {/* Document Upload */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Upload Supporting Document
              </label>
              <div className={`border-2 border-dashed rounded-lg p-4 ${
                validationErrors.document ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-gray-300 bg-gray-50 dark:bg-gray-700/50"
              } ${isViewMode ? "" : "hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"}`}>
                {documentPreview ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <i className="fa-solid fa-file text-green-600 text-xl"></i>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition"
            >
              Cancel
            </button>
            {!isViewMode && (
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition"
              >
                {action === "create" ? "Create Complaint" : "Update Complaint"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

  ComplaintModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    complaint: PropTypes.shape({
      _id: PropTypes.string,
      employee: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({ _id: PropTypes.string })
      ]),
      againstEmployee: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({ _id: PropTypes.string })
      ]),
      complainType: PropTypes.string,
      complainSubject: PropTypes.string,
      complaintDetails: PropTypes.string,
      status: PropTypes.string,
      documentUrl: PropTypes.string,
      remarks: PropTypes.string,
    }),
    action: PropTypes.oneOf(["create", "edit", "view"]).isRequired,
    employees: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
    })),
    onSubmit: PropTypes.func.isRequired,
  };

export default ComplaintModal;
