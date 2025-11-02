import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { MdClose } from "react-icons/md";
import { holidaySchema } from "../../../validations";
import { createHoliday, updateHoliday } from "../../../services/holiday.service";
import { setFetchFlag } from "../../../reducers/holiday.reducer";

const HolidayModal = ({ isOpen, onClose, holiday = null, action }) => {
  const dispatch = useDispatch();
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const holidayCategories = ["National", "Religious", "Company Specific"];
  const holidayTypes = ["Full Day", "Half Day", "Floating"];
  const branches = ["Main Office", "Branch 1", "Branch 2", "Branch 3"]; // Add actual branches from your system

  const [formData, setFormData] = useState({
    holidayName: "",
    date: "",
    category: "",
    branches: [],
    type: "",
    description: "",
    isPaid: true,
  });

  useEffect(() => {
    if (holiday && isOpen) {
      const holidayDate = new Date(holiday.date);
      const formattedDate = holidayDate.toISOString().split("T")[0];
      
      setFormData({
        holidayName: holiday.holidayName || "",
        date: formattedDate || "",
        category: holiday.category || "",
        branches: holiday.branches || ["Main Office"],
        type: holiday.type || "",
        description: holiday.description || "",
        isPaid: holiday.isPaid !== undefined ? holiday.isPaid : true,
      });
      setValidationErrors({});
    } else {
      setFormData({
        holidayName: "",
        date: "",
        category: "",
        branches: ["Main Office"],
        type: "",
        description: "",
        isPaid: true,
      });
      setValidationErrors({});
    }
  }, [holiday, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBranchChange = (branch) => {
    setFormData((prev) => {
      const branches = prev.branches.includes(branch)
        ? prev.branches.filter((b) => b !== branch)
        : [...prev.branches, branch];
      return { ...prev, branches };
    });
    if (validationErrors.branches) {
      setValidationErrors((prev) => ({ ...prev, branches: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});

    try {
      // Validate using Zod schema
      const validatedData = holidaySchema.parse(formData);

      setLoading(true);

      if (action === "create") {
        await dispatch(createHoliday(validatedData));
      } else if (action === "edit" && holiday?._id) {
        await dispatch(
          updateHoliday({
            id: holiday._id,
            holiday: validatedData,
          })
        );
      }

      dispatch(setFetchFlag(true));
      onClose();
    } catch (error) {
      if (error.errors) {
        const errorMap = {};
        error.errors.forEach((err) => {
          const path = err.path[0];
          errorMap[path] = err.message;
        });
        setValidationErrors(errorMap);
      } else {
        console.error("Validation error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
            {action === "view"
              ? "View Holiday"
              : action === "edit"
              ? "Edit Holiday"
              : "Add Holiday"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Holiday Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Holiday Name *
            </label>
            <input
              type="text"
              name="holidayName"
              value={formData.holidayName}
              onChange={handleChange}
              disabled={action === "view"}
              placeholder="e.g., New Year's Day"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {validationErrors.holidayName && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.holidayName}
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              disabled={action === "view"}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {validationErrors.date && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.date}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={action === "view"}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              {holidayCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {validationErrors.category && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.category}
              </p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              disabled={action === "view"}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Type</option>
              {holidayTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {validationErrors.type && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.type}</p>
            )}
          </div>

          {/* Branches */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Branches *
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {branches.map((branch) => (
                <label
                  key={branch}
                  className="flex items-center cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.branches.includes(branch)}
                    onChange={() => handleBranchChange(branch)}
                    disabled={action === "view"}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {branch}
                  </span>
                </label>
              ))}
            </div>
            {validationErrors.branches && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.branches}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={action === "view"}
              placeholder="Enter holiday description"
              rows="3"
              maxLength="500"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.description.length}/500 characters
            </div>
            {validationErrors.description && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.description}
              </p>
            )}
          </div>

          {/* Paid Holiday */}
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isPaid"
                checked={formData.isPaid}
                onChange={handleChange}
                disabled={action === "view"}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Paid Holiday
              </span>
            </label>
          </div>

          {/* Buttons */}
          {action !== "view" && (
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? "Saving..." : action === "edit" ? "Update" : "Create"}
              </button>
            </div>
          )}

          {action === "view" && (
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="w-full px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
              >
                Close
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default HolidayModal;
