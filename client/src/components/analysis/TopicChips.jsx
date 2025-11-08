import PropTypes from "prop-types";

const TopicChips = ({ topics = [], onClick = () => {} }) => {
  if (!Array.isArray(topics) || topics.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {topics.map((t, i) => (
        <button
          key={`${t}-${i}`}
          type="button"
          onClick={() => onClick && onClick(t)}
          className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          {t}
        </button>
      ))}
    </div>
  );
};

TopicChips.propTypes = {
  topics: PropTypes.arrayOf(PropTypes.string),
  onClick: PropTypes.func,
};

export default TopicChips;
