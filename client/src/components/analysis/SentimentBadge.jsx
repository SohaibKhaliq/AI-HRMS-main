import PropTypes from "prop-types";

const SentimentBadge = ({
  label = "neutral",
  score = null,
  className = "",
}) => {
  const l = (label || "neutral").toLowerCase();
  let base =
    "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ";
  if (l.includes("pos") || l.includes("positive"))
    base += "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
  else if (l.includes("neg") || l.includes("negative"))
    base += "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
  else if (l.includes("neu") || l.includes("neutral"))
    base +=
      "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
  else base += "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200";

  const title =
    score !== null ? `${label} (${Math.round(score * 100) / 100})` : label;

  return (
    <span
      className={`${base} ${className}`}
      title={title}
      aria-label={`Sentiment: ${label}`}
    >
      {String(label).charAt(0).toUpperCase() + String(label).slice(1)}
      {typeof score === "number" && !Number.isNaN(score) && (
        <span className="ml-2 text-[10px] opacity-80">
          {Math.round(Math.abs(score) * 100)}%
        </span>
      )}
    </span>
  );
};

SentimentBadge.propTypes = {
  label: PropTypes.string,
  score: PropTypes.number,
  className: PropTypes.string,
};

export default SentimentBadge;
