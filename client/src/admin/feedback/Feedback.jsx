import { Helmet } from "react-helmet";
import { FaStar } from "react-icons/fa";
import { formatDate } from "../../utils";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/shared/loaders/Loader";
import { getFeedbacks } from "../../services/feedback.service";
import { setFetchFlag } from "../../reducers/feedback.reducer";
import { feedbackButtons, feedbackHead } from "../../constants";
import FetchError from "../../components/shared/error/FetchError";
import Pagination from "../../components/shared/others/Pagination";
import FilterButton from "../../components/shared/buttons/FilterButton";
import NoDataMessage from "../../components/shared/error/NoDataMessage";
import { FiSearch, FiEye } from "react-icons/fi";
import FeedbackViewModal from "../../components/shared/modals/FeedbackViewModal";

function Feedback() {
  const dispatch = useDispatch();

  const { feedbacks, loading, pagination, error, fetch } = useSelector(
    (state) => state.feedback
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [reviewFilter, setReviewFilter] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [viewItem, setViewItem] = useState(null);

  const handleReviewFilter = (filter) => {
    dispatch(setFetchFlag(true));
    setReviewFilter(filter);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    dispatch(setFetchFlag(true));
    setCurrentPage(page);
  };

  useEffect(() => {
    if (fetch) {
      dispatch(
        getFeedbacks({ review: reviewFilter.toLowerCase(), currentPage })
      );
    }
  }, [reviewFilter, currentPage, fetch]);

  const filteredFeedbacks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = feedbacks || [];
    if (q) {
      list = list.filter((f) => {
        const fields = [
          f.employee?.employeeId,
          f.employee?.name,
          f.employee?.department?.name,
          f.employee?.role?.name,
          f.suggestion,
          f.description,
          f.review,
        ]
          .filter(Boolean)
          .map((x) => String(x).toLowerCase())
          .join(" ");
        return fields.includes(q);
      });
    }
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      list = list.filter((f) => new Date(f.createdAt).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter((f) => new Date(f.createdAt) <= to);
    }
    return list;
  }, [feedbacks, searchQuery, dateFrom, dateTo]);

  const handleExportCSV = () => {
    const rows = filteredFeedbacks.length ? filteredFeedbacks : feedbacks;
    let csv = "Emp ID,Name,Department,Position,AI Review,Suggestion,Description,Date,Rating\n";
    for (const f of rows) {
      const line = [
        f.employee?.employeeId || "--",
        f.employee?.name || "--",
        f.employee?.department?.name || "--",
        f.employee?.role?.name || "--",
        f.review || "--",
        (f.suggestion || "").replaceAll("\"", "'"),
        (f.description || "").replaceAll("\"", "'"),
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
        <title>{reviewFilter} Feedbacks - Metro HR</title>
      </Helmet>

      {loading && <Loader />}

      <section className="bg-gray-100 dark:bg-secondary p-3 sm:p-4 rounded-lg sm:min-h-screen shadow">
        <div className="mb-4 sm:px-4 flex flex-wrap items-center gap-2 sm:gap-3">
          {feedbackButtons.map((filter, i) => (
            <FilterButton
              key={i}
              setState={handleReviewFilter}
              state={reviewFilter}
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
              </tr>
            </thead>
            <tbody>
                {(filteredFeedbacks.length > 0 ? filteredFeedbacks : feedbacks).length > 0 &&
                (filteredFeedbacks.length > 0 ? filteredFeedbacks : feedbacks).map((feedback, index) => (
                  <tr
                    key={index}
                    className="dark:even:bg-gray-800 odd:bg-gray-200 dark:odd:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    <td className="py-3 px-4 border-b border-secondary">
                      {feedback.employee?.employeeId || "--"}
                    </td>
                    <td className="py-3 px-4 border-b border-secondary">
                      {feedback.employee?.name || "--"}
                    </td>
                    <td className="py-3 px-4 border-b border-secondary">
                      {feedback.employee.department?.name || "--"}
                    </td>
                    <td className="py-3 px-4 border-b border-secondary">
                      {feedback.employee.role?.name || "--"}
                    </td>
                    <td className="py-3 px-4 border-b border-secondary">
                      {feedback.review}
                    </td>

                    {/* Description with Tooltip */}
                    <td
                      className="py-3 px-4 border-b border-secondary relative cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {feedback.description.slice(0, 10) + "...."}

                      {hoveredIndex === index && (
                        <div className="absolute left-0 top-full mt-1 max-w-[300px] h-auto bg-gray-900 dark:bg-gray-200 dark:text-black text-white text-xs p-2 rounded shadow-lg z-10 break-words whitespace-normal">
                          <i className="fas fa-quote-left dark:text-gray-700 text-white mr-2"></i>
                          {feedback.description}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 border-b border-secondary">
                      {formatDate(feedback.createdAt)}
                    </td>
                    <td className="py-3 px-4 border-b border-secondary flex items-center gap-2">
                      {feedback.rating} <FaStar color="gold" />
                    </td>
                    <td className="py-3 px-4 border-b border-secondary">
                      <button
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => setViewItem(feedback)}
                      >
                        <FiEye /> View
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {!loading && !error && (filteredFeedbacks.length === 0 && feedbacks.length === 0) && (
            <NoDataMessage message={"No feedback found"} />
          )}
        </div>

        {!loading && (feedbacks.length > 0) && (
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
