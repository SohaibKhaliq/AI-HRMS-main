import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useSelector } from "react-redux";
import Calendar from "../../components/shared/calendar/Calendar";
import axiosInstance from "../../axios/axiosInstance";
import toast from "react-hot-toast";
import ComponentLoader from "../../components/shared/loaders/ComponentLoader";
import { formatDate } from "../../utils/calendarUtils";

const CalendarView = () => {
  const { user } = useSelector((state) => state.authentication);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      
      // Fetch leaves
      const { data: leavesData } = await axiosInstance.get("/leaves");
      const leaves = (leavesData.leaves || []).map(leave => ({
        ...leave,
        type: "leave",
        title: `Leave: ${leave.leaveType?.name || "Unknown"}`,
        date: leave.fromDate,
      }));

      // Fetch meetings
      const { data: meetingsData } = await axiosInstance.get("/meetings");
      const meetings = (meetingsData.meetings || []).map(meeting => ({
        ...meeting,
        type: "meeting",
        title: meeting.title,
        date: meeting.startTime,
      }));

      // Fetch holidays
      const { data: holidaysData } = await axiosInstance.get("/holidays");
      const holidays = (holidaysData.holidays || []).map(holiday => ({
        ...holiday,
        type: "holiday",
        title: holiday.name,
        date: holiday.date,
      }));

      setEvents([...leaves, ...meetings, ...holidays]);
    } catch (error) {
      toast.error("Failed to load calendar events");
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (date) => {
    // Date clicked - can be used for creating new events
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const getEventDetails = (event) => {
    switch (event.type) {
      case "leave":
        return {
          icon: "🏖️",
          color: "orange",
          details: [
            { label: "Type", value: event.leaveType?.name || "N/A" },
            { label: "From", value: formatDate(event.fromDate, "long") },
            { label: "To", value: formatDate(event.toDate, "long") },
            { label: "Duration", value: `${event.duration || 0} days` },
            { label: "Status", value: event.status },
            { label: "Reason", value: event.reason || "N/A" },
          ],
        };
      case "meeting":
        return {
          icon: "📅",
          color: "blue",
          details: [
            { label: "Title", value: event.title },
            { label: "Start Time", value: formatDate(event.startTime, "long") + " " + formatDate(event.startTime, "time") },
            { label: "End Time", value: formatDate(event.endTime, "long") + " " + formatDate(event.endTime, "time") },
            { label: "Link", value: event.link || "N/A" },
            { label: "Description", value: event.description || "N/A" },
          ],
        };
      case "holiday":
        return {
          icon: "🎉",
          color: "green",
          details: [
            { label: "Holiday", value: event.name },
            { label: "Date", value: formatDate(event.date, "long") },
            { label: "Description", value: event.description || "N/A" },
          ],
        };
      default:
        return {
          icon: "📌",
          color: "gray",
          details: [],
        };
    }
  };

  if (loading) return <ComponentLoader />;

  return (
    <>
      <Helmet>
        <title>Calendar - Metro HR</title>
      </Helmet>

      <section className="px-1 sm:px-4 bg-gray-200 dark:bg-primary min-h-screen py-4">
        <Calendar
          events={events}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
        />

        {/* Event Detail Modal */}
        {showModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-secondary rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{getEventDetails(selectedEvent).icon}</span>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                      {selectedEvent.title || selectedEvent.name}
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                <div className="space-y-3">
                  {getEventDetails(selectedEvent).details.map((detail, index) => (
                    <div
                      key={index}
                      className="flex border-b dark:border-gray-700 pb-2"
                    >
                      <span className="font-semibold text-gray-700 dark:text-gray-300 w-32">
                        {detail.label}:
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 flex-1">
                        {detail.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
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

export default CalendarView;
