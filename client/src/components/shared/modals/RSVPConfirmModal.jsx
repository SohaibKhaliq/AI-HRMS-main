import {
  FaTimes,
  FaCheck,
  FaBan,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
} from "react-icons/fa";
import PropTypes from "prop-types";

const RSVPConfirmModal = ({ isOpen, onClose, meeting, action, onConfirm }) => {
  if (!isOpen || !meeting) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isAccept = action === "accepted";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div
          className={`flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 ${
            isAccept
              ? "bg-green-50 dark:bg-green-900"
              : "bg-red-50 dark:bg-red-900"
          }`}
        >
          <h3
            className={`text-lg font-semibold ${
              isAccept
                ? "text-green-800 dark:text-green-300"
                : "text-red-800 dark:text-red-300"
            }`}
          >
            {isAccept ? "Accept Meeting?" : "Decline Meeting?"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {isAccept
                ? "Are you sure you want to accept this meeting invitation?"
                : "Are you sure you want to decline this meeting invitation?"}
            </p>

            {/* Meeting Details */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-gray-800 dark:text-white text-lg">
                {meeting.title}
              </h4>

              <div className="flex items-start gap-2 text-sm">
                <FaCalendarAlt className="text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    {formatDate(meeting.startTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <FaClock className="text-gray-500 mt-0.5" />
                <p className="text-gray-700 dark:text-gray-300">
                  {formatTime(meeting.startTime)} -{" "}
                  {formatTime(meeting.endTime)}
                </p>
              </div>

              {meeting.location && (
                <div className="flex items-start gap-2 text-sm">
                  <FaMapMarkerAlt className="text-gray-500 mt-0.5" />
                  <p className="text-gray-700 dark:text-gray-300">
                    {meeting.location}
                  </p>
                </div>
              )}

              {meeting.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                  {meeting.description}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors flex items-center justify-center gap-2 ${
                isAccept
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {isAccept ? <FaCheck /> : <FaBan />}
              {isAccept ? "Confirm Accept" : "Confirm Decline"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
RSVPConfirmModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  meeting: PropTypes.object,
  action: PropTypes.string,
  onConfirm: PropTypes.func,
};

export default RSVPConfirmModal;
