import { formatDate } from "../../../utils";
import PropTypes from "prop-types";

const Row = ({ label, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 py-1">
    <div className="sm:w-40 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {label}
    </div>
    <div className="flex-1 text-sm text-gray-900 dark:text-gray-100 break-words">
      {children}
    </div>
  </div>
);

const Badge = ({ text, color = "blue" }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-${color}-100 text-${color}-800 dark:bg-${color}-900 dark:text-${color}-100`}
  >
    {text}
  </span>
);

const FeedbackViewModal = ({ feedback, onClose }) => {
  if (!feedback) return null;
  const { employee, review, suggestion, description, rating, createdAt } =
    feedback;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-[94%] p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Feedback Details</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="space-y-2">
          <Row label="Employee">
            {employee?.name || "--"}{" "}
            {employee?.employeeId ? `(#${employee.employeeId})` : ""}
          </Row>
          <Row label="Department">{employee?.department?.name || "--"}</Row>
          <Row label="Position">{employee?.role?.name || "--"}</Row>
          <Row label="Rating">
            {rating} <i className="fa-solid fa-star text-yellow-400 ml-1" />
          </Row>
          <Row label="AI Review">
            <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100">
              {review || "--"}
            </span>
          </Row>
          <Row label="Suggestion">{suggestion || "--"}</Row>
          <Row label="Description">
            <div className="whitespace-pre-wrap">{description || "--"}</div>
          </Row>
          <Row label="Created">{formatDate(createdAt)}</Row>
        </div>
      </div>
    </div>
  );
};

export default FeedbackViewModal;

Row.propTypes = {
  label: PropTypes.string,
  children: PropTypes.node,
};

Badge.propTypes = {
  text: PropTypes.string,
  color: PropTypes.string,
};

FeedbackViewModal.propTypes = {
  feedback: PropTypes.object,
  onClose: PropTypes.func,
};
