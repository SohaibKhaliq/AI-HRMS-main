import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

const DocumentCategoryModal = ({ isOpen, onClose, category, onSubmit, action }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (category && action !== "create") {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        isActive: category.isActive !== undefined ? category.isActive : true,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        isActive: true,
      });
    }
    setErrors({});
  }, [category, action, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (action === "view") {
      onClose();
      return;
    }

    if (!validate()) return;

    onSubmit(formData);
  };

  if (!isOpen) return null;

  const isViewMode = action === "view";
  const title =
    action === "create"
      ? "Add Document Category"
      : action === "update"
      ? "Edit Document Category"
      : "View Document Category";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isViewMode}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 
                ${isViewMode ? "bg-gray-100 dark:bg-gray-700" : "bg-white dark:bg-gray-900"} 
                ${errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"}
                text-gray-900 dark:text-white`}
              placeholder="e.g., Employment Contracts"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isViewMode}
              rows="4"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 
                ${isViewMode ? "bg-gray-100 dark:bg-gray-700" : "bg-white dark:bg-gray-900"} 
                border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
              placeholder="Optional description of this document category"
            ></textarea>
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              disabled={isViewMode}
              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 
                dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="isActive"
              className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Active
            </label>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 
                border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {isViewMode ? "Close" : "Cancel"}
            </button>
            {!isViewMode && (
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent 
                  rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {action === "create" ? "Create" : "Update"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentCategoryModal;
