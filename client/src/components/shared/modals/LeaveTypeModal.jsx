import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";

const LeaveTypeModal = ({ isOpen, onClose, leaveType = null, onSubmit, action }) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    maxDaysPerYear: 15,
    carryForwardEnabled: false,
    carryForwardLimit: 5,
    isPaid: true,
    requiresApproval: true,
    requiresDocument: false,
    minimumDaysNotice: 1,
    allowHalfDay: true,
    color: "#10b981",
    isActive: true,
  });

  const [validationErrors, setValidationErrors] = useState({});

  const colorOptions = [
    { value: "#10b981", label: "Green", class: "bg-green-500" },
    { value: "#3b82f6", label: "Blue", class: "bg-blue-500" },
    { value: "#f59e0b", label: "Orange", class: "bg-orange-500" },
    { value: "#ef4444", label: "Red", class: "bg-red-500" },
    { value: "#8b5cf6", label: "Purple", class: "bg-purple-500" },
    { value: "#ec4899", label: "Pink", class: "bg-pink-500" },
    { value: "#06b6d4", label: "Cyan", class: "bg-cyan-500" },
    { value: "#f43f5e", label: "Rose", class: "bg-rose-500" },
  ];

  useEffect(() => {
    if (leaveType && isOpen) {
      setFormData({
        name: leaveType.name || "",
        code: leaveType.code || "",
        description: leaveType.description || "",
        maxDaysPerYear: leaveType.maxDaysPerYear || 15,
        carryForwardEnabled: leaveType.carryForwardEnabled !== undefined ? leaveType.carryForwardEnabled : false,
        carryForwardLimit: leaveType.carryForwardLimit || 5,
        isPaid: leaveType.isPaid !== undefined ? leaveType.isPaid : true,
        requiresApproval: leaveType.requiresApproval !== undefined ? leaveType.requiresApproval : true,
        requiresDocument: leaveType.requiresDocument !== undefined ? leaveType.requiresDocument : false,
        minimumDaysNotice: leaveType.minimumDaysNotice || 1,
        allowHalfDay: leaveType.allowHalfDay !== undefined ? leaveType.allowHalfDay : true,
        color: leaveType.color || "#10b981",
        isActive: leaveType.isActive !== undefined ? leaveType.isActive : true,
      });
      setValidationErrors({});
    } else {
      setFormData({
        name: "",
        code: "",
        description: "",
        maxDaysPerYear: 15,
        carryForwardEnabled: false,
        carryForwardLimit: 5,
        isPaid: true,
        requiresApproval: true,
        requiresDocument: false,
        minimumDaysNotice: 1,
        allowHalfDay: true,
        color: "#10b981",
        isActive: true,
      });
      setValidationErrors({});
    }
  }, [leaveType, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Leave type name is required";
    if (!formData.code.trim()) errors.code = "Leave type code is required";
    if (formData.maxDaysPerYear < 0) errors.maxDaysPerYear = "Max days must be positive";
    if (formData.carryForwardEnabled && formData.carryForwardLimit < 0) {
      errors.carryForwardLimit = "Carry forward limit must be positive";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // Convert string numbers to actual numbers
    const submitData = {
      ...formData,
      maxDaysPerYear: Number(formData.maxDaysPerYear),
      carryForwardLimit: Number(formData.carryForwardLimit),
      minimumDaysNotice: Number(formData.minimumDaysNotice),
    };
    
    if (onSubmit) onSubmit(submitData);
  };

  const isViewMode = action === "view";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {action === "create" ? "Create Leave Type" : action === "update" ? "Edit Leave Type" : "Leave Type Details"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <MdClose size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Leave Type Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isViewMode}
                  className={`w-full px-3 py-2 border ${
                    validationErrors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isViewMode ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-700"
                  } dark:text-white`}
                  placeholder="e.g., Sick Leave"
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                )}
              </div>

              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Leave Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  disabled={isViewMode}
                  className={`w-full px-3 py-2 border ${
                    validationErrors.code ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isViewMode ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-700"
                  } dark:text-white uppercase`}
                  placeholder="e.g., SL"
                  maxLength="5"
                />
                {validationErrors.code && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.code}</p>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isViewMode}
                  rows="2"
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isViewMode ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-700"
                  } dark:text-white`}
                  placeholder="Brief description of this leave type..."
                />
              </div>
            </div>
          </div>

          {/* Leave Policy */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Leave Policy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Max Days Per Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Days Per Year
                </label>
                <input
                  type="number"
                  name="maxDaysPerYear"
                  value={formData.maxDaysPerYear}
                  onChange={handleChange}
                  disabled={isViewMode}
                  min="0"
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isViewMode ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-700"
                  } dark:text-white`}
                />
              </div>

              {/* Minimum Days Notice */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Minimum Days Notice
                </label>
                <input
                  type="number"
                  name="minimumDaysNotice"
                  value={formData.minimumDaysNotice}
                  onChange={handleChange}
                  disabled={isViewMode}
                  min="0"
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isViewMode ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-700"
                  } dark:text-white`}
                />
              </div>

              {/* Carry Forward Limit */}
              {formData.carryForwardEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Carry Forward Limit (Days)
                  </label>
                  <input
                    type="number"
                    name="carryForwardLimit"
                    value={formData.carryForwardLimit}
                    onChange={handleChange}
                    disabled={isViewMode}
                    min="0"
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      isViewMode ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-700"
                    } dark:text-white`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Leave Options */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Leave Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPaid"
                  checked={formData.isPaid}
                  onChange={handleChange}
                  disabled={isViewMode}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Paid Leave</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="requiresApproval"
                  checked={formData.requiresApproval}
                  onChange={handleChange}
                  disabled={isViewMode}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Requires Approval</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="requiresDocument"
                  checked={formData.requiresDocument}
                  onChange={handleChange}
                  disabled={isViewMode}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Requires Document</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="allowHalfDay"
                  checked={formData.allowHalfDay}
                  onChange={handleChange}
                  disabled={isViewMode}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow Half Day</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="carryForwardEnabled"
                  checked={formData.carryForwardEnabled}
                  onChange={handleChange}
                  disabled={isViewMode}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Carry Forward</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  disabled={isViewMode}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
              </label>
            </div>
          </div>

          {/* Calendar Color */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Display Settings</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Calendar Color
              </label>
              <div className="flex flex-wrap gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => !isViewMode && setFormData(prev => ({ ...prev, color: color.value }))}
                    disabled={isViewMode}
                    className={`w-12 h-12 rounded-lg ${color.class} ${
                      formData.color === color.value
                        ? "ring-4 ring-offset-2 ring-gray-400 dark:ring-gray-500"
                        : "hover:ring-2 ring-gray-300"
                    } ${isViewMode ? "cursor-not-allowed opacity-50" : "cursor-pointer"} transition`}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition"
            >
              {isViewMode ? "Close" : "Cancel"}
            </button>
            {!isViewMode && (
              <button
                type="submit"
                className="px-6 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium transition"
              >
                {action === "update" ? "Update Leave Type" : "Create Leave Type"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveTypeModal;
