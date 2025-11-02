import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllEmployees } from "../../../services/employee.service";
import { MdClose } from "react-icons/md";

const ResignationModal = ({ isOpen, onClose, resignation = null, onSubmit, action, employees: propEmployees }) => {
  const dispatch = useDispatch();
  const { employees: storeEmployees } = useSelector((state) => state.employee || {});
  const employees = propEmployees || storeEmployees || [];
  const [documentFile, setDocumentFile] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);
  
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
    }
  }, [resignation, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentFile(file);
      setDocumentPreview(file.name);
      // Create a URL for preview
      const fileUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, documentUrl: fileUrl }));
    }
  };

  const handleRemoveDocument = () => {
    setDocumentFile(null);
    setDocumentPreview(null);
    setFormData((prev) => ({ ...prev, documentUrl: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
            {action === "create" ? "Add New Resignation" : action === "update" ? "Edit Resignation" : "View Resignation"}
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
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
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
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                }`}
                required
              />
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
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                }`}
                required
              />
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
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                }`}
                required
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                }`}
                placeholder="e.g., Career change, Relocation"
                required
              />
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
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                }`}
                required
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Document Upload */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Resignation Letter or Document
              </label>
              <div className={`border-2 border-dashed rounded-lg p-4 text-center ${
                isViewMode ? "bg-gray-100" : "bg-gray-50 hover:bg-gray-100 cursor-pointer"
              }`}>
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

export default ResignationModal;
