import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyMeetings, updateMeetingStatus } from '../../services/meeting.service';
import { FaCalendarAlt, FaMapMarkerAlt, FaVideo, FaUsers, FaFilter } from 'react-icons/fa';
import RSVPConfirmModal from '../../components/shared/modals/RSVPConfirmModal';
import toast from 'react-hot-toast';

const EmployeeMeetings = () => {
  const dispatch = useDispatch();
  const { myMeetings, loading } = useSelector((state) => state.meeting);
  
  const [filteredMeetings, setFilteredMeetings] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('upcoming');
  const [rsvpModal, setRsvpModal] = useState(null);

  useEffect(() => {
    dispatch(getMyMeetings());
  }, [dispatch]);

  useEffect(() => {
    if (myMeetings) {
      filterMeetings();
    }
  }, [myMeetings, typeFilter, statusFilter, dateFilter]);

  const filterMeetings = () => {
    let filtered = [...(myMeetings || [])];

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter((m) => m.type === typeFilter);
    }

    // Filter by RSVP status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((m) => {
        const participant = m.participants?.find((p) => p._id === localStorage.getItem('userId'));
        return participant?.status === statusFilter;
      });
    }

    // Filter by date
    const now = new Date();
    if (dateFilter === 'today') {
      filtered = filtered.filter((m) => {
        const meetingDate = new Date(m.startTime);
        return meetingDate.toDateString() === now.toDateString();
      });
    } else if (dateFilter === 'week') {
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((m) => {
        const meetingDate = new Date(m.startTime);
        return meetingDate >= now && meetingDate <= weekFromNow;
      });
    } else if (dateFilter === 'month') {
      const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((m) => {
        const meetingDate = new Date(m.startTime);
        return meetingDate >= now && meetingDate <= monthFromNow;
      });
    } else if (dateFilter === 'upcoming') {
      filtered = filtered.filter((m) => new Date(m.startTime) >= now);
    }

    // Sort by date
    filtered.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    setFilteredMeetings(filtered);
  };

  const getMeetingTypeColor = (type) => {
    const colors = {
      general: 'bg-blue-500',
      standup: 'bg-purple-500',
      review: 'bg-green-500',
      planning: 'bg-orange-500',
      'one-on-one': 'bg-pink-500',
      'all-hands': 'bg-cyan-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  const getStatusBadge = (meeting) => {
    const participant = meeting.participants?.find((p) => p._id === localStorage.getItem('userId'));
    const status = participant?.status || 'pending';

    const badges = {
      accepted: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', text: 'Accepted' },
      declined: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', text: 'Declined' },
      pending: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300', text: 'Pending' },
    };

    return badges[status];
  };

  const handleRSVP = (meeting, action) => {
    setRsvpModal({ meeting, action });
  };

  const confirmRSVP = async () => {
    if (!rsvpModal) return;

    const { meeting, action } = rsvpModal;
    try {
      await dispatch(updateMeetingStatus({ 
        meetingId: meeting._id, 
        status: action 
      })).unwrap();
      
      toast.success(`Meeting ${action === 'accepted' ? 'accepted' : 'declined'} successfully`);
      setRsvpModal(null);
      dispatch(getMyMeetings());
    } catch (error) {
      toast.error(error.message || 'Failed to update RSVP');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          My Meetings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          View and manage your meeting invitations
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FaFilter className="text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Meeting Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="general">General</option>
              <option value="standup">Standup</option>
              <option value="review">Review</option>
              <option value="planning">Planning</option>
              <option value="one-on-one">One-on-One</option>
              <option value="all-hands">All-Hands</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              RSVP Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="upcoming">Upcoming</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Meetings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredMeetings.length === 0 ? (
        <div className="text-center py-12">
          <FaCalendarAlt className="mx-auto text-6xl text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No meetings found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No meetings match your current filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeetings.map((meeting) => {
            const statusBadge = getStatusBadge(meeting);
            const isPending = statusBadge.text === 'Pending';

            return (
              <div
                key={meeting._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Card Header */}
                <div className={`${getMeetingTypeColor(meeting.type)} bg-gradient-to-r p-4`}>
                  <h3 className="text-xl font-bold text-white mb-2">{meeting.title}</h3>
                  <span className="inline-block px-3 py-1 bg-white bg-opacity-30 rounded-full text-white text-sm font-medium">
                    {meeting.type?.charAt(0).toUpperCase() + meeting.type?.slice(1).replace('-', ' ')}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  {/* Date & Time */}
                  <div className="flex items-start gap-2 mb-3">
                    <FaCalendarAlt className="text-gray-500 mt-1" />
                    <div>
                      <p className="text-gray-800 dark:text-white font-medium">
                        {formatDate(meeting.startTime)}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                      </p>
                    </div>
                  </div>

                  {/* Location or Link */}
                  {meeting.location && (
                    <div className="flex items-center gap-2 mb-3">
                      <FaMapMarkerAlt className="text-gray-500" />
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {meeting.location}
                      </p>
                    </div>
                  )}

                  {meeting.meetingLink && (
                    <div className="flex items-center gap-2 mb-3">
                      <FaVideo className="text-gray-500" />
                      <a
                        href={meeting.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm hover:underline"
                      >
                        Join Online Meeting
                      </a>
                    </div>
                  )}

                  {/* Description */}
                  {meeting.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {meeting.description}
                    </p>
                  )}

                  {/* Participants */}
                  <div className="flex items-center gap-2 mb-4">
                    <FaUsers className="text-gray-500" />
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {meeting.participants?.length || 0} Participants
                    </p>
                  </div>

                  {/* RSVP Status Badge */}
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}>
                      {statusBadge.text}
                    </span>
                  </div>

                  {/* Actions */}
                  {isPending && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRSVP(meeting, 'accepted')}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRSVP(meeting, 'declined')}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RSVP Confirmation Modal */}
      {rsvpModal && (
        <RSVPConfirmModal
          isOpen={!!rsvpModal}
          onClose={() => setRsvpModal(null)}
          meeting={rsvpModal.meeting}
          action={rsvpModal.action}
          onConfirm={confirmRSVP}
        />
      )}
    </div>
  );
};

export default EmployeeMeetings;
