import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import { useSelector } from "react-redux";

const MeetingModal = ({ isOpen, onClose, meeting = null, onSubmit, action }) => {
  const { employees } = useSelector(state => state.employee || { employees: [] });
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    location: "",
    meetingLink: "",
    participants: [],
    agenda: "",
    type: "general",
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (meeting && isOpen) {
      setFormData({
        title: meeting.title || "",
        description: meeting.description || "",
        startTime: meeting.startTime ? new Date(meeting.startTime).toISOString().slice(0, 16) : "",
        endTime: meeting.endTime ? new Date(meeting.endTime).toISOString().slice(0, 16) : "",
        location: meeting.location || "",
        meetingLink: meeting.meetingLink || "",
        participants: meeting.participants?.map(p => typeof p === 'string' ? p : p._id) || [],
        agenda: meeting.agenda || "",
        type: meeting.type || "general",
      });
      setValidationErrors({});
    } else {
      setFormData({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        location: "",
        meetingLink: "",
        participants: [],
        agenda: "",
        type: "general",
      });
      setValidationErrors({});
    }
  }, [meeting, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleParticipantToggle = (empId) => {
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.includes(empId)
        ? prev.participants.filter((id) => id !== empId)
        : [...prev.participants, empId],
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.startTime) errors.startTime = "Start time is required";
    if (!formData.endTime) errors.endTime = "End time is required";
    if (formData.participants.length === 0) errors.participants = "Select at least one participant";
    
    if (formData.startTime && formData.endTime) {
      if (new Date(formData.endTime) <= new Date(formData.startTime)) {
        errors.endTime = "End time must be after start time";
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // Convert datetime-local to ISO string
    const submitData = {
      ...formData,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
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
            {action === "create" ? "Schedule New Meeting" : action === "update" ? "Edit Meeting" : "Meeting Details"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <MdClose size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Meeting Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 border ${
                  validationErrors.title ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-700"
                } dark:text-white`}
                placeholder="e.g., Sprint Planning Meeting"
              />
              {validationErrors.title && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.title}</p>
              )}
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
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
                type="datetime-local"
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

            {/* Meeting Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Meeting Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-700"
                } dark:text-white`}
              >
                <option value="general">General</option>
                <option value="standup">Stand-up</option>
                <option value="review">Review</option>
                <option value="planning">Planning</option>
                <option value="one-on-one">One-on-One</option>
                <option value="all-hands">All Hands</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-700"
                } dark:text-white`}
                placeholder="e.g., Conference Room A"
              />
            </div>

            {/* Meeting Link */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Meeting Link (Zoom/Teams/etc.)
              </label>
              <input
                type="url"
                name="meetingLink"
                value={formData.meetingLink}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-700"
                } dark:text-white`}
                placeholder="https://zoom.us/j/..."
              />
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
                rows="3"
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-700"
                } dark:text-white`}
                placeholder="Brief description of the meeting..."
              />
            </div>

            {/* Agenda */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Agenda
              </label>
              <textarea
                name="agenda"
                value={formData.agenda}
                onChange={handleChange}
                disabled={isViewMode}
                rows="3"
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isViewMode ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-700"
                } dark:text-white`}
                placeholder="Meeting agenda items..."
              />
            </div>

            {/* Participants */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Participants <span className="text-red-500">*</span>
              </label>
              <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2">
                {employees && employees.length > 0 ? (
                  employees.map((emp) => (
                    <label
                      key={emp._id}
                      className={`flex items-center gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        isViewMode ? "cursor-not-allowed" : "cursor-pointer"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.participants.includes(emp._id)}
                        onChange={() => !isViewMode && handleParticipantToggle(emp._id)}
                        disabled={isViewMode}
                        className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {emp.name} {emp.employeeId && `(${emp.employeeId})`}
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No employees available</p>
                )}
              </div>
              {validationErrors.participants && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.participants}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.participants.length} participant(s) selected
              </p>
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
                {action === "update" ? "Update Meeting" : "Schedule Meeting"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeetingModal;
