import { Helmet } from "react-helmet";
import { FaStar } from "react-icons/fa";
import { formatDate } from "../../utils";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/shared/loaders/Loader";
import { getFeedbacks } from "../../services/feedback.service";
import { feedbackButtons, feedbackHead } from "../../constants";
import FetchError from "../../components/shared/error/FetchError";
import Pagination from "../../components/shared/others/Pagination";
import FilterButton from "../../components/shared/buttons/FilterButton";
import NoDataMessage from "../../components/shared/error/NoDataMessage";
import { FiSearch, FiEye } from "react-icons/fi";
import FeedbackViewModal from "../../components/shared/modals/FeedbackViewModal";
import SentimentBadge from "../../components/analysis/SentimentBadge";
import TopicChips from "../../components/analysis/TopicChips";

function Feedback() {
  const dispatch = useDispatch();

  const { feedbacks, loading, pagination, error } = useSelector(
    (state) => state.feedback
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [sentimentFilter, setSentimentFilter] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [viewItem, setViewItem] = useState(null);

  const handleReviewFilter = (filter) => {
    // Map quick filter buttons to the sentiment filter sent to server
    setSentimentFilter(filter);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Fetch feedbacks whenever filters or pagination change. We send all
  // relevant filter params to the server so pagination remains consistent.
  useEffect(() => {
    const params = { page: currentPage, limit: 12 };

    if (sentimentFilter) params.review = sentimentFilter.toLowerCase();
    if (searchQuery) params.q = searchQuery.trim();
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    if (topicFilter) params.topic = topicFilter;

    dispatch(getFeedbacks(params));
  }, [
    dispatch,
    currentPage,
    sentimentFilter,
    searchQuery,
    dateFrom,
    dateTo,
    topicFilter,
  ]);

  // Use server-provided, already-filtered feedbacks for display to keep
  // pagination and filters consistent.
  const filteredFeedbacks = feedbacks || [];

  const handleExportCSV = () => {
    const rows = filteredFeedbacks.length ? filteredFeedbacks : feedbacks;
    let csv =
      "Emp ID,Name,Department,Position,AI Review,Suggestion,Description,Date,Rating\n";
    for (const f of rows) {
      const line = [
        f.employee?.employeeId || "--",
        f.employee?.name || "--",
        f.employee?.department?.name || "--",
        f.employee?.role?.name || "--",
        f.review || "--",
        (f.suggestion || "").replaceAll('"', "'"),
        (f.description || "").replaceAll('"', "'"),
        formatDate(f.createdAt || f.updatedAt || new Date()),
        f.rating ?? "",
      ]
        .map((v) => `"${String(v).replaceAll("\n", " ")}"`)
        .join(",");
      csv += line + "\n";
    }
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedbacks_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) return <FetchError error={error} />;

  return (
    <>
      <Helmet>
        <title>
          {sentimentFilter ? `${sentimentFilter} Feedbacks` : "Feedbacks"} -
          Metro HR
        </title>
      </Helmet>

      {loading && <Loader />}

      <section className="bg-gray-100 dark:bg-secondary p-3 sm:p-4 rounded-lg sm:min-h-screen shadow">
        <div className="mb-4 sm:px-4 flex flex-wrap items-center gap-2 sm:gap-3">
          {feedbackButtons.map((filter, i) => (
            <FilterButton
              key={i}
              setState={handleReviewFilter}
              state={sentimentFilter}
              filter={filter}
            />
          ))}
          <div className="ml-auto flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, dept, text..."
                className="w-full pl-10 pr-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm"
              />
            </div>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm"
              title="From date"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm"
              title="To date"
            />
            <select
              value={sentimentFilter}
              onChange={(e) => {
                setSentimentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm"
              title="Filter by sentiment"
            >
              <option value="">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>

            <input
              type="text"
              placeholder="Filter by topic"
              value={topicFilter}
              onChange={(e) => {
                setTopicFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm"
              title="Filter by topic"
            />
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Feedback Table */}
        <div
          id="overflow"
          className="overflow-x-auto min-h-[74vh] sm:min-h-[80vh]"
        >
          <table className="min-w-full text-left table-auto border-collapse text-sm whitespace-nowrap">
            <thead>
              <tr className="dark:bg-head bg-headLight text-primary">
                {feedbackHead.map((header, i) => (
                  <th key={i} className="py-3 px-4 border-b border-secondary">
                    {header}
                  </th>
                ))}
                <th className="py-3 px-4 border-b border-secondary">Topics</th>
              </tr>
            </thead>
            <tbody>
              {/* Always render the filtered list. Previously we fell back to full `feedbacks` when filters returned 0,
                  which made filters (e.g., Neutral) appear to not work. */}
              {filteredFeedbacks.length > 0 &&
                filteredFeedbacks.map((feedback, index) => (
                  <tr
                    key={feedback._id || index}
                    className="dark:even:bg-gray-800 odd:bg-gray-200 dark:odd:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    <td className="py-3 px-4 border-b border-secondary">
                      {feedback.employee?.employeeId || "--"}
                    </td>
                    <td className="py-3 px-4 border-b border-secondary">
                      {feedback.employee?.name || "--"}
                    </td>
                    <td className="py-3 px-4 border-b border-secondary">
                      {feedback.employee?.department?.name || "--"}
                    </td>
                    <td className="py-3 px-4 border-b border-secondary">
                      {feedback.employee?.role?.name || "--"}
                    </td>
                    <td className="py-3 px-4 border-b border-secondary">
                      <SentimentBadge
                        label={feedback.sentimentLabel || feedback.review}
                        score={feedback.sentimentScore}
                      />
                    </td>

                    {/* Description with Tooltip - placed to match header order */}
                    <td
                      className="py-3 px-4 border-b border-secondary relative cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {(feedback.description || "").slice(0, 40) + "...."}

                      {hoveredIndex === index && (
                        <div className="absolute left-0 top-full mt-1 max-w-[300px] h-auto bg-gray-900 dark:bg-gray-200 dark:text-black text-white text-xs p-2 rounded shadow-lg z-10 break-words whitespace-normal">
                          <i className="fas fa-quote-left dark:text-gray-700 text-white mr-2"></i>
                          {feedback.description || ""}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 border-b border-secondary">
                      {formatDate(feedback.createdAt)}
                    </td>

                    <td className="py-3 px-4 border-b border-secondary">
                      <div className="inline-flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {feedback.rating}
                        </span>
                        <FaStar className="text-yellow-400" size={14} />
                      </div>
                    </td>

                    <td className="py-3 px-4 border-b border-secondary">
                      <button
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => setViewItem(feedback)}
                      >
                        <FiEye /> View
                      </button>
                    </td>

                    {/* Topics column moved to the end to match header */}
                    <td className="py-3 px-4 border-b border-secondary">
                      <TopicChips
                        topics={feedback.topics || []}
                        onClick={(t) => setTopicFilter(t)}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Show no-data when filters produce zero results. */}
          {!loading && !error && filteredFeedbacks.length === 0 && (
            <NoDataMessage message={"No feedback found"} />
          )}
        </div>

        {!loading && feedbacks.length > 0 && (
          <Pagination
            currentPage={currentPage}
            onPageChange={handlePageChange}
            totalPages={pagination?.totalPages}
          />
        )}
      </section>

      {viewItem && (
        <FeedbackViewModal
          feedback={viewItem}
          onClose={() => setViewItem(null)}
        />
      )}
    </>
  );
}

export default Feedback;
