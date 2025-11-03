import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/shared/loaders/Loader";
import FetchError from "../../components/shared/error/FetchError";
import MeetingModal from "../../components/shared/modals/MeetingModal";
import { getAllMeetings, deleteMeeting, updateMeeting, createMeeting } from "../../services/meeting.service";
import { getAllEmployees } from "../../services/employee.service";
import { FaEye, FaEdit, FaTrash, FaPlus, FaCheck, FaUsers, FaCalendar, FaMapMarkerAlt, FaVideo } from "react-icons/fa";

const AdminMeeting = () => {
  const dispatch = useDispatch();
  const { meetings, loading, error } = useSelector(state => state.meeting || { meetings: [], loading: false, error: null });
  const { employees } = useSelector(state => state.employee || { employees: [] });

  const [action, setAction] = useState("");
  const [modalOpen, setModalOpen] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    dispatch(getAllMeetings());
    if (!employees || employees.length === 0) {
      dispatch(getAllEmployees({ currentPage: 1, filters: {} }));
    }
  }, [dispatch]);

  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => setShowSuccessPopup(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup]);

  const filtered = useMemo(() => {
    let result = meetings || [];
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => 
        m.title?.toLowerCase().includes(q) || 
        m.description?.toLowerCase().includes(q) ||
        m.location?.toLowerCase().includes(q)
      );
    }
    
    if (typeFilter) {
      result = result.filter(m => m.type === typeFilter);
    }
    
    if (dateFrom) {
      result = result.filter(m => new Date(m.startTime) >= new Date(dateFrom));
    }
    if (dateTo) {
      result = result.filter(m => new Date(m.startTime) <= new Date(dateTo + "T23:59:59"));
    }
    
    return result.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  }, [meetings, searchQuery, typeFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const openCreate = () => { setAction("create"); setModalOpen({}); };
  const openEdit = (m) => { setAction("update"); setModalOpen(m); };
  const openView = (m) => { setAction("view"); setModalOpen(m); };
  const handleDelete = (id) => { 
    if (!confirm("Are you sure you want to delete this meeting?")) return; 
    dispatch(deleteMeeting(id));
  };

  const handleModalClose = () => {
    setModalOpen(null);
    setAction("");
  };

  const handleModalSubmit = async (formData) => {
    if (action === "create") {
      await dispatch(createMeeting(formData));
      setSuccessMessage("Meeting scheduled successfully!");
      setShowSuccessPopup(true);
    } else if (action === "update" && modalOpen?._id) {
      await dispatch(updateMeeting({ id: modalOpen._id, data: formData }));
      setSuccessMessage("Meeting updated successfully!");
      setShowSuccessPopup(true);
    }
    handleModalClose();
  };

  const clearFilters = () => {
    setTypeFilter("");
    setDateFrom("");
    setDateTo("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMeetingStatus = (meeting) => {
    const now = new Date();
    const start = new Date(meeting.startTime);
    const end = new Date(meeting.endTime);
    
    if (now < start) return { label: "Upcoming", class: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" };
    if (now >= start && now <= end) return { label: "In Progress", class: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" };
    return { label: "Completed", class: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" };
  };

  if (error) return <FetchError error={error} />;

  return (
    <>
      <Helmet><title>Meeting Management - Metro HR</title></Helmet>

      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 max-w-sm w-full mx-4 text-center animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <FaCheck className="text-green-600 dark:text-green-400 text-2xl" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Success!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{successMessage}</p>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          {/* Header */}
          <div className="p-6 border-b dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meeting Management</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Schedule and manage team meetings
                </p>
              </div>
              <button
                onClick={openCreate}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
              >
                <FaPlus /> Schedule Meeting
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <input
                type="text"
                placeholder="Search meetings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
              />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="general">General</option>
                <option value="standup">Stand-up</option>
                <option value="review">Review</option>
                <option value="planning">Planning</option>
                <option value="one-on-one">One-on-One</option>
                <option value="all-hands">All Hands</option>
              </select>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From Date"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To Date"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
              />
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition dark:text-white"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <Loader />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Meeting Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Participants
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {pageData.map((meeting) => {
                      const status = getMeetingStatus(meeting);
                      return (
                        <tr key={meeting._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{meeting.title}</div>
                            {meeting.meetingLink && (
                              <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-1">
                                <FaVideo size={10} /> Online
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                              <FaCalendar size={12} className="text-gray-400" />
                              {formatDateTime(meeting.startTime)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white capitalize">{meeting.type}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                              {meeting.location ? (
                                <>
                                  <FaMapMarkerAlt size={12} className="text-gray-400" />
                                  {meeting.location}
                                </>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                              <FaUsers size={12} className="text-gray-400" />
                              {meeting.participants?.length || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.class}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openView(meeting)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                title="View"
                              >
                                <FaEye size={18} />
                              </button>
                              <button
                                onClick={() => openEdit(meeting)}
                                className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                title="Edit"
                              >
                                <FaEdit size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(meeting._id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Delete"
                              >
                                <FaTrash size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 flex items-center justify-between border-t dark:border-gray-700">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} meetings
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <MeetingModal
        isOpen={modalOpen !== null}
        onClose={handleModalClose}
        meeting={modalOpen}
        onSubmit={handleModalSubmit}
        action={action}
      />
    </>
  );
};

export default AdminMeeting;
