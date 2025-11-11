import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { feedbackSchema } from "../../validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { createFeedback, getFeedbacks } from "../../services/feedback.service";
import ButtonLoader from "../../components/shared/loaders/ButtonLoader";
import { FiSearch, FiEye, FiPlus } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import toast from "react-hot-toast";
import SentimentBadge from "../../components/analysis/SentimentBadge";
import TopicChips from "../../components/analysis/TopicChips";

const Feedback = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.authentication);
  const feedbackState = useSelector((state) => state.feedback) || {};
  const {
    feedbacks = [],
    loading = false,
    fetch = true,
    pagination = {
      currentPage: 1,
      totalPages: 1,
      totalFeedbacks: 0,
      limit: 10,
    },
  } = feedbackState;

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [reviewFilter, setReviewFilter] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [category, setCategory] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(feedbackSchema),
  });

  // Fetch feedbacks on mount and when filters change
  useEffect(() => {
    dispatch(
      getFeedbacks({
        review: reviewFilter || undefined,
        page: currentPage,
        limit: pageSize,
        employee: user?._id,
      })
    );
  }, [dispatch, currentPage, pageSize, reviewFilter, user?._id]);

  // Refetch when fetch flag changes
  useEffect(() => {
    if (fetch) {
      dispatch(
        getFeedbacks({
          review: reviewFilter || undefined,
          page: currentPage,
          limit: pageSize,
          employee: user?._id,
        })
      );
    }
  }, [fetch, dispatch, reviewFilter, currentPage, pageSize, user?._id]);

  // Filter feedbacks by search and optional topic (server returns only current user's feedbacks)
  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      feedback.description?.toLowerCase().includes(searchLower) ||
      feedback.suggestion?.toLowerCase().includes(searchLower) ||
      feedback.review?.toLowerCase().includes(searchLower);

    // topic filtering (client-side)
    if (topicFilter) {
      const t = topicFilter.trim().toLowerCase();
      const has = (feedback.topics || []).some((x) =>
        String(x).toLowerCase().includes(t)
      );
      if (!has) return false;
    }

    return matchesSearch;
  });

  const onSubmit = (data) => {
    const payload = {
      ...data,
      suggestion: category
        ? `[${category}] ${data.suggestion}`
        : data.suggestion,
    };
    dispatch(createFeedback(payload))
      .unwrap()
      .then(() => {
        reset();
        setCategory("");
        setShowModal(false);
        toast.success("Feedback submitted successfully!");
        // Refetch feedbacks
        dispatch(
          getFeedbacks({
            review: reviewFilter || undefined,
            page: currentPage,
            limit: pageSize,
          })
        );
      })
      .catch((error) => {
        console.error("Error creating feedback:", error);
        toast.error("Failed to submit feedback");
      });
  };

  const handleViewFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setShowViewModal(true);
  };

  const getReviewColor = (review) => {
    switch (review?.toLowerCase()) {
      case "positive":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "negative":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      case "neutral":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
      default:
        return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200";
    }
  };

  const reviewOptions = ["Positive", "Neutral", "Negative"];
  const totalPages = pagination?.totalPages || 1;
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, filteredFeedbacks.length);

  return (
    <>
      <Helmet>
        <title>My Feedback - Metro HR</title>
      </Helmet>

      <section className="px-1 sm:px-4 bg-gray-200 dark:bg-primary min-h-screen py-4">
        <div className="bg-white dark:bg-secondary rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Feedback
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                View your submitted feedback and AI sentiment analysis
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FiPlus size={20} />
              New Feedback
            </button>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Search Bar */}
            <div className="relative">
              <FiSearch
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by description, suggestion..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Review Filter */}
            <div>
              <select
                value={reviewFilter}
                onChange={(e) => setReviewFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Sentiments</option>
                {reviewOptions.map((review) => (
                  <option key={review} value={review}>
                    {review}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-50 dark:bg-gray-700 border-b-2 border-blue-200 dark:border-gray-600">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Rating
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    AI Sentiment
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Topics
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Suggestion
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Description
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedbacks.length > 0 ? (
                  filteredFeedbacks.map((feedback, index) => (
                    <tr
                      key={feedback._id}
                      className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                        {startIndex + index}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-1">
                          {feedback.rating}
                          <FaStar className="text-yellow-400" size={16} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <SentimentBadge
                          label={feedback.sentimentLabel || feedback.review}
                          score={feedback.sentimentScore}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                        <div className="max-w-xs truncate">
                          {feedback.suggestion || "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <TopicChips
                          topics={feedback.topics || []}
                          onClick={(t) => setTopicFilter(t)}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                        <div className="max-w-xs truncate">
                          {feedback.description}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleViewFeedback(feedback)}
                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-600 rounded transition"
                            title="View"
                          >
                            <FiEye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <i className="fas fa-comments text-5xl text-gray-300 dark:text-gray-600"></i>
                        <div>
                          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                            No feedback found
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {feedbacks.length > 0
                              ? "You don't have any feedback matching the current filters."
                              : "You haven't submitted any feedback yet. Click 'New Feedback' to share your thoughts."}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredFeedbacks.length > 0 ? startIndex : 0} to{" "}
              {endIndex} of {filteredFeedbacks.length} feedbacks
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">
                Per Page:
              </label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                Previous
              </button>
              <span className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium">
                {currentPage}
              </span>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Create Feedback Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <i className="fa-regular fa-comments text-blue-600"></i>
                    Give Your Feedback
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category (Optional)
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      disabled={loading}
                    >
                      <option value="">Select a category</option>
                      <option value="Work Environment">Work Environment</option>
                      <option value="Compensation & Benefits">
                        Compensation & Benefits
                      </option>
                      <option value="Management & Leadership">
                        Management & Leadership
                      </option>
                      <option value="Career Growth">Career Growth</option>
                      <option value="Training & Development">
                        Training & Development
                      </option>
                      <option value="Policies & Compliance">
                        Policies & Compliance
                      </option>
                      <option value="Facilities & Tools">
                        Facilities & Tools
                      </option>
                      <option value="Work-Life Balance">
                        Work-Life Balance
                      </option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rating *
                    </label>
                    <select
                      {...register("rating")}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors.rating ? "border-red-500" : "border-gray-300"
                      }`}
                      disabled={loading}
                    >
                      <option value="">Select rating</option>
                      <option value="5">5 stars - Excellent</option>
                      <option value="4">4 stars - Good</option>
                      <option value="3">3 stars - Average</option>
                      <option value="2">2 stars - Poor</option>
                      <option value="1">1 star - Very Poor</option>
                    </select>
                    {errors.rating && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.rating.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Suggestion (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Any suggestions for improvement?"
                      {...register("suggestion")}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors.suggestion ? "border-red-500" : "border-gray-300"
                      }`}
                      disabled={loading}
                    />
                    {errors.suggestion && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.suggestion.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Feedback Description *
                    </label>
                    <textarea
                      placeholder="Share your detailed feedback..."
                      rows="5"
                      {...register("description")}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors.description
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      disabled={loading}
                    ></textarea>
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:bg-blue-400 transition"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <ButtonLoader />
                          Submitting...
                        </span>
                      ) : (
                        "Submit Feedback"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        reset();
                        setCategory("");
                      }}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Feedback Modal */}
        {showViewModal && selectedFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Feedback Details
                  </h2>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Rating
                      </p>
                      <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
                        {selectedFeedback.rating}
                        <FaStar className="text-yellow-400" size={20} />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        AI Sentiment
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getReviewColor(
                          selectedFeedback.sentimentLabel ||
                            selectedFeedback.review
                        )}`}
                      >
                        {selectedFeedback.sentimentLabel ||
                          selectedFeedback.review}
                      </span>
                    </div>
                  </div>

                  {selectedFeedback.suggestion && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Suggestion
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedFeedback.suggestion}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Feedback Description
                    </p>
                    <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                      {selectedFeedback.description}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Submitted On
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {new Date(selectedFeedback.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <i className="fas fa-robot text-blue-600 mr-2"></i>
                      AI Analysis
                    </p>
                    <p className="text-gray-900 dark:text-gray-100 mb-2">
                      Our AI has analyzed your feedback and classified it as{" "}
                      <strong>
                        {selectedFeedback.sentimentLabel ||
                          selectedFeedback.review}
                      </strong>{" "}
                      sentiment. This helps management understand and prioritize
                      employee feedback effectively.
                    </p>
                    <div className="flex flex-col gap-2">
                      <SentimentBadge
                        label={
                          selectedFeedback.sentimentLabel ||
                          selectedFeedback.review
                        }
                        score={selectedFeedback.sentimentScore}
                      />
                      {selectedFeedback.topics &&
                        selectedFeedback.topics.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                              Topics
                            </p>
                            <TopicChips topics={selectedFeedback.topics} />
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default Feedback;
