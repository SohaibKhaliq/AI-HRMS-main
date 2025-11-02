import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet";
import { MdAdd } from "react-icons/md";
import { FiSearch, FiEye, FiEdit, FiTrash2 } from "react-icons/fi";
import { getHolidays, deleteHoliday } from "../../services/holiday.service";
import { setFetchFlag } from "../../reducers/holiday.reducer";
import HolidayModal from "../../components/shared/modals/HolidayModal";
import Loader from "../../components/shared/loaders/Loader";
import FetchError from "../../components/shared/error/FetchError";

const Holiday = () => {
  const dispatch = useDispatch();
  const holidayState = useSelector((state) => state.holiday) || {};
  const auth = useSelector((state) => state.authentication) || {};
  const {
    holidays = [],
    loading = false,
    error = null,
    pagination = {
      currentPage: 1,
      totalPages: 1,
      totalHolidays: 0,
      limit: 10,
    },
    fetch = true,
  } = holidayState;
  const { user = {} } = auth;

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("view");
  const [selectedHoliday, setSelectedHoliday] = useState(null);

  const holidayCategories = ["National", "Religious", "Company Specific"];
  const holidayTypes = ["Full Day", "Half Day", "Floating"];

  // Fetch holidays
  useEffect(() => {
    dispatch(
      getHolidays({
        currentPage,
        limit: pageSize,
        category: categoryFilter || undefined,
        type: typeFilter || undefined,
      })
    );
  }, [dispatch, currentPage, pageSize, categoryFilter, typeFilter, fetch]);

  // Filter holidays based on search query
  const filteredHolidays = holidays.filter((holiday) => {
    const name = holiday.holidayName || "";
    const description = holiday.description || "";
    const searchLower = searchQuery.toLowerCase();
    return (
      name.toLowerCase().includes(searchLower) ||
      description.toLowerCase().includes(searchLower)
    );
  });

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleOpenModal = (action, holiday = null) => {
    setModalAction(action);
    setSelectedHoliday(holiday);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedHoliday(null);
    setModalAction("view");
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this holiday?")) {
      dispatch(deleteHoliday(id)).then(() => {
        dispatch(setFetchFlag(true));
      });
    }
  };

  const isAdmin = user?.admin || false;

  // Status colors for display
  const categoryColors = {
    National: "bg-blue-100 text-blue-800",
    Religious: "bg-purple-100 text-purple-800",
    "Company Specific": "bg-green-100 text-green-800",
  };

  const typeColors = {
    "Full Day": "bg-red-100 text-red-800",
    "Half Day": "bg-yellow-100 text-yellow-800",
    Floating: "bg-indigo-100 text-indigo-800",
  };

  if (error) {
    return (
      <>
        <Helmet>
          <title>Holidays - HRMS</title>
        </Helmet>
        <FetchError error={error} />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Holidays - HRMS</title>
      </Helmet>

      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Holidays
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage company holidays and special dates
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative md:col-span-1">
              <FiSearch className="absolute left-3 top-3 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Search holidays..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {holidayCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {holidayTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("");
                  setTypeFilter("");
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && <Loader />}

        {/* Table */}
        {!loading && filteredHolidays.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">
                      Holiday Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredHolidays.map((holiday, index) => (
                    <tr
                      key={holiday._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {holiday.holidayName}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(holiday.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            categoryColors[holiday.category] ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {holiday.category}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            typeColors[holiday.type] ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {holiday.type}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                        {holiday.description}
                      </td>
                      <td className="px-6 py-3 text-sm space-x-2 flex">
                        <button
                          onClick={() =>
                            handleOpenModal("view", holiday)
                          }
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 transition"
                          title="View"
                        >
                          <FiEye size={18} />
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() =>
                                handleOpenModal("edit", holiday)
                              }
                              className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-200 transition"
                              title="Edit"
                            >
                              <FiEdit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(holiday._id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200 transition"
                              title="Delete"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredHolidays.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              No holidays found
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredHolidays.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, pagination.totalHolidays)} of{" "}
              {pagination.totalHolidays} holidays
            </div>

            <div className="flex items-center gap-4">
              {/* Page Size Selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  Per page:
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                >
                  ← Prev
                </button>

                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {pagination.totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage(
                      Math.min(currentPage + 1, pagination.totalPages)
                    )
                  }
                  disabled={currentPage === pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Holiday Modal */}
      {isModalOpen && (
        <HolidayModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          action={modalAction}
          holiday={selectedHoliday}
        />
      )}
    </>
  );
};

export default Holiday;
