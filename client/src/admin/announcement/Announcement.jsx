import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet";
import { MdAdd } from "react-icons/md";
import { FiSearch, FiEye, FiEdit, FiTrash2, FiFilter, FiFile } from "react-icons/fi";
import { IoArrowDownOutline } from "react-icons/io5";
import { BsMegaphone } from "react-icons/bs";
import { getAnnouncements, deleteAnnouncement } from "../../services/announcement.service";
import { setFetchFlag } from "../../reducers/announcement.reducer";
import AnnouncementModal from "../../components/shared/modals/AnnouncementModal";
import Loader from "../../components/shared/loaders/Loader";
import FetchError from "../../components/shared/error/FetchError";

const Announcement = () => {
  const dispatch = useDispatch();
  const announcementState = useSelector((state) => state.announcement) || {};
  const auth = useSelector((state) => state.authentication) || {};
  const {
    announcements = [],
    loading = false,
    error = null,
    pagination = {
      currentPage: 1,
      totalPages: 1,
      totalAnnouncements: 0,
      limit: 10,
    },
    fetch = true,
  } = announcementState;
  const { user = {} } = auth;

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("view");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const announcementCategories = ["General", "Policy", "Event", "Training", "Urgent", "Benefits", "Recognition"];
  const priorityLevels = ["Low", "Medium", "High", "Critical"];

  // Fetch announcements
  useEffect(() => {
    dispatch(
      getAnnouncements({
        currentPage,
        limit: pageSize,
        category: categoryFilter || undefined,
        priority: priorityFilter || undefined,
      })
    );
  }, [dispatch, currentPage, pageSize, categoryFilter, priorityFilter, fetch]);

  // Filter announcements based on search query
  const filteredAnnouncements = announcements.filter((announcement) => {
    const title = announcement.title || "";
    const description = announcement.description || "";
    const searchLower = searchQuery.toLowerCase();
    return (
      title.toLowerCase().includes(searchLower) ||
      description.toLowerCase().includes(searchLower)
    );
  });

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleOpenModal = (action, announcement = null) => {
    setModalAction(action);
    setSelectedAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAnnouncement(null);
    setModalAction("view");
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      dispatch(deleteAnnouncement(id)).then(() => {
        dispatch(setFetchFlag(true));
      });
    }
  };

  const handleExportPDF = () => {
    // Create CSV export
    let csvContent = "Title,Category,Date Range,Priority,Description\n";
    filteredAnnouncements.forEach((announcement) => {
      const startDate = new Date(announcement.startDate).toLocaleDateString("en-US");
      const endDate = new Date(announcement.endDate).toLocaleDateString("en-US");
      const dateRange = `${startDate} - ${endDate}`;
      csvContent += `"${announcement.title}","${announcement.category}","${dateRange}","${announcement.priority}","${announcement.description}"\n`;
    });

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent)
    );
    element.setAttribute("download", `announcements_${new Date().getTime()}.csv`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const isAdmin = user?.admin || false;

  // Colors for display
  const categoryColors = {
    General: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    Policy: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    Event: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    Training: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    Urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    Benefits: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    Recognition: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  };

  const priorityColors = {
    Low: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    Medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    High: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    Critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  if (error) {
    return (
      <>
        <Helmet>
          <title>Announcements - HRMS</title>
        </Helmet>
        <FetchError error={error} />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Announcements - HRMS</title>
      </Helmet>

      <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Header with Title and Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Announcements
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage company announcements and communications
            </p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <FiFilter size={18} />
              Filters
            </button>

            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <IoArrowDownOutline size={18} />
              Export PDF
            </button>

            {isAdmin && (
              <button
                onClick={() => handleOpenModal("create")}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                <MdAdd size={20} />
                Add Announcement
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search announcements by title or description..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Categories</option>
                  {announcementCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => {
                    setPriorityFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Priorities</option>
                  {priorityLevels.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("");
                    setPriorityFilter("");
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && <Loader />}

        {/* Table */}
        {!loading && filteredAnnouncements.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">
                      #
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-green-600">
                      Title
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">
                      Category
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">
                      Date Range
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">
                      Attachments
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAnnouncements.map((announcement, index) => (
                    <tr
                      key={announcement._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <td className="px-4 md:px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="px-4 md:px-6 py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {announcement.title}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                priorityColors[announcement.priority] ||
                                "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {announcement.priority}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-3 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            categoryColors[announcement.category] ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {announcement.category}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <div className="font-medium">
                            {new Date(announcement.startDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            to {new Date(announcement.endDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-3 text-sm">
                        {announcement.attachmentUrl ? (
                          <a
                            href={announcement.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-500 hover:text-blue-700 transition"
                          >
                            <FiFile size={16} />
                            <span>Attachment</span>
                          </a>
                        ) : (
                          <span className="text-gray-400">No Attachment</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenModal("view", announcement)}
                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-600 rounded transition"
                            title="View"
                          >
                            <FiEye size={18} />
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleOpenModal("edit", announcement)}
                                className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-gray-600 rounded transition"
                                title="Edit"
                              >
                                <FiEdit size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(announcement._id)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-gray-600 rounded transition"
                                title="Delete"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredAnnouncements.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center mb-6">
            <BsMegaphone className="mx-auto text-4xl text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No announcements found
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredAnnouncements.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, pagination.totalAnnouncements)} of{" "}
              {pagination.totalAnnouncements} announcements
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              {/* Page Size Selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  Per Page:
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage(Math.max(currentPage - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-600 transition text-sm"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                        currentPage === page
                          ? "bg-green-600 text-white"
                          : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage(
                      Math.min(currentPage + 1, pagination.totalPages)
                    )
                  }
                  disabled={currentPage === pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-600 transition text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Announcement Modal */}
      {isModalOpen && (
        <AnnouncementModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          action={modalAction}
          announcement={selectedAnnouncement}
        />
      )}
    </>
  );
};

export default Announcement;