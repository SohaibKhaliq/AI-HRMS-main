import { useState } from "react";
import PropTypes from "prop-types";
import { FaTimes, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const TimeEntryActionModal = ({
  isOpen,
  action,
  entry,
  onClose,
  onApprove,
  onReject,
}) => {
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (action === "reject" && !reason.trim()) {
      newErrors.reason = "Rejection reason is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    if (action === "approve") {
      onApprove(entry, notes);
    } else if (action === "reject") {
      onReject(entry, reason, notes);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div
            className={`px-6 py-4 ${
              action === "approve" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                {action === "approve" ? (
                  <>
                    <FaCheckCircle /> Approve Time Entry
                  </>
                ) : (
                  <>
                    <FaTimesCircle /> Reject Time Entry
                  </>
                )}
              </h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-4 bg-white dark:bg-gray-800">
            {/* Entry Details */}
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Time Entry Details
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Employee:
                  </span>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {entry?.employee?.firstName} {entry?.employee?.lastName}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Project:
                  </span>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {entry?.project || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Clock In:
                  </span>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {entry?.clockIn
                      ? new Date(entry.clockIn).toLocaleString()
                      : "-"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Clock Out:
                  </span>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {entry?.clockOut
                      ? new Date(entry.clockOut).toLocaleString()
                      : "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Rejection Reason (only for reject action) */}
            {action === "reject" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows="3"
                  placeholder="Enter the reason for rejection..."
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                    errors.reason
                      ? "border-red-500 dark:border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {errors.reason && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.reason}
                  </p>
                )}
              </div>
            )}

            {/* Admin Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Admin Notes {action === "reject" ? "(Optional)" : ""}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="3"
                placeholder="Add any additional notes..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            {/* Confirmation Message */}
            <div
              className={`p-3 rounded-lg ${
                action === "approve"
                  ? "bg-green-50 dark:bg-green-900/20"
                  : "bg-red-50 dark:bg-red-900/20"
              }`}
            >
              <p
                className={`text-sm ${
                  action === "approve"
                    ? "text-green-800 dark:text-green-200"
                    : "text-red-800 dark:text-red-200"
                }`}
              >
                {action === "approve"
                  ? "Are you sure you want to approve this time entry?"
                  : "Are you sure you want to reject this time entry? The employee will be notified of the rejection."}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                action === "approve"
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {action === "approve" ? "Confirm Approval" : "Confirm Rejection"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeEntryActionModal;

TimeEntryActionModal.propTypes = {
  isOpen: PropTypes.bool,
  action: PropTypes.string,
  entry: PropTypes.object,
  onClose: PropTypes.func,
  onApprove: PropTypes.func,
  onReject: PropTypes.func,
};

TimeEntryActionModal.defaultProps = {
  isOpen: false,
  action: "approve",
  entry: null,
  onClose: () => {},
  onApprove: () => {},
  onReject: () => {},
};
