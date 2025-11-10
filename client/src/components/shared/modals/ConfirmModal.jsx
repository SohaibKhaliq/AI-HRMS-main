import PropTypes from "prop-types";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";

const ConfirmModal = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Delete",
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex items-start gap-3">
          <div className="text-red-500 mt-1">
            <FaExclamationTriangle />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{title || "Confirm"}</h3>
            <p className="text-sm text-gray-600 mt-2">
              {message || "Are you sure?"}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 ml-2"
          >
            <FaTimes />
          </button>
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-100 rounded">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

ConfirmModal.propTypes = {
  open: PropTypes.bool,
  title: PropTypes.string,
  message: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  confirmLabel: PropTypes.string,
};

export default ConfirmModal;
