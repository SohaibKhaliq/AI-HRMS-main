import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";

const ShiftModal = ({ isOpen, onClose, shift = null, onSubmit, action }) => {
  const [formData, setFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
    breakDuration: 60,
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    description: "",
    graceTime: 15,
    isActive: true,
  });

  const [validationErrors, setValidationErrors] = useState({});

  const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    if (shift && isOpen) {
      setFormData({
        name: shift.name || "",
        startTime: shift.startTime || "",
        endTime: shift.endTime || "",
        breakDuration: shift.breakDuration || 60,
        workingDays: shift.workingDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        description: shift.description || "",
        graceTime: shift.graceTime || 15,
        isActive: shift.isActive !== undefined ? shift.isActive : true,
      });
      setValidationErrors({});
    } else {
      setFormData({
        name: "",
        startTime: "",
        endTime: "",
        breakDuration: 60,
        workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        description: "",
        graceTime: 15,
        isActive: true,
      });
      setValidationErrors({});
    }
  }, [shift, isOpen]);

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

  const handleDayToggle = (day) => {
    setFormData((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Shift name is required";
    if (!formData.startTime) errors.startTime = "Start time is required";
    if (!formData.endTime) errors.endTime = "End time is required";
    if (formData.workingDays.length === 0) errors.workingDays = "Select at least one working day";
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (onSubmit) onSubmit(formData);
  };

  const isViewMode = action === "view";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {action === "create" ? "Add New Shift" : action === "update" ? "Edit Shift" : "View Shift"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <MdClose size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Shift Name <span className="text-red-500">*</span>
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
                placeholder="e.g., Morning Shift"
              />
              {validationErrors.name && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
              )}
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 border ${
                  validationErrors.startTime ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-700"
                } dark:text-white`}
              />
              {validationErrors.startTime && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.startTime}</p>
              )}
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 border ${
                  validationErrors.endTime ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-700"
                } dark:text-white`}
              />
              {validationErrors.endTime && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.endTime}</p>
              )}
            </div>

            {/* Break Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Break Duration (minutes)
              </label>
              <input
                type="number"
                name="breakDuration"
                value={formData.breakDuration}
                onChange={handleChange}
                disabled={isViewMode}
                min="0"
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-700"
                } dark:text-white`}
              />
            </div>

            {/* Grace Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Grace Time (minutes)
              </label>
              <input
                type="number"
                name="graceTime"
                value={formData.graceTime}
                onChange={handleChange}
                disabled={isViewMode}
                min="0"
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-700"
                } dark:text-white`}
              />
            </div>

            {/* Working Days */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Working Days <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {allDays.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => !isViewMode && handleDayToggle(day)}
                    disabled={isViewMode}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      formData.workingDays.includes(day)
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    } ${isViewMode ? "cursor-not-allowed" : "hover:opacity-80 cursor-pointer"}`}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
              {validationErrors.workingDays && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.workingDays}</p>
              )}
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={isViewMode}
                rows="3"
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-700"
                } dark:text-white`}
                placeholder="Optional description"
              />
            </div>

            {/* Active Status */}
            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  disabled={isViewMode}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
              </label>
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
                {action === "update" ? "Update" : "Create"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShiftModal;
