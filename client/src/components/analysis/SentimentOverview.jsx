import PropTypes from "prop-types";

const SentimentOverview = ({ insights = {} }) => {
  const sentiment = insights?.sentiment || {};
  const counts = sentiment.counts || {};
  const avg = typeof sentiment.avgScore === "number" ? sentiment.avgScore : 0;
  const total = sentiment.totalAnalyzed || 0;
  const topTopics = sentiment.topTopics || [];

  return (
    <div className="w-full md:w-[32%] mt-2 rounded-lg dark:text-gray-200 text-gray-700 bg-gray-100 dark:bg-secondary border border-gray-300 dark:border-primary p-4 shadow">
      <h3 className="text-[0.93rem] font-semibold mb-3 pl-1 border-b dark:border-gray-600 pb-2">
        Sentiment Overview
      </h3>

      <div className="flex flex-col gap-3 mt-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500">Average Score</div>
            <div className="text-2xl font-bold">{avg.toFixed(2)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Analyzed</div>
            <div className="text-lg font-medium">{total}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 bg-green-100 rounded text-center">
            <div className="text-xs text-green-700">Positive</div>
            <div className="font-semibold">{counts.Positive || 0}</div>
          </div>
          <div className="p-2 bg-yellow-100 rounded text-center">
            <div className="text-xs text-yellow-700">Neutral</div>
            <div className="font-semibold">{counts.Neutral || 0}</div>
          </div>
          <div className="p-2 bg-red-100 rounded text-center">
            <div className="text-xs text-red-700">Negative</div>
            <div className="font-semibold">{counts.Negative || 0}</div>
          </div>
        </div>

        {topTopics.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 mb-2">Top Topics</div>
            <div className="flex flex-wrap gap-2">
              {topTopics.map((t, i) => (
                <span
                  key={`${t.topic}-${i}`}
                  className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full"
                >
                  {t.topic} ({t.count})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

SentimentOverview.propTypes = {
  insights: PropTypes.object,
};

export default SentimentOverview;
