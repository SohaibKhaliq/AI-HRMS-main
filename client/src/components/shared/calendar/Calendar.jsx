import { useState } from "react";
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from "react-icons/fa";
import PropTypes from "prop-types";
import {
  getCalendarGrid,
  getMonthName,
  getWeekDays,
  getPreviousMonth,
  getNextMonth,
  isToday,
  getEventsForDate,
  getEventColor,
} from "../../../utils/calendarUtils";

const Calendar = ({ events = [], onDateClick, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarGrid = getCalendarGrid(year, month);
  const weekDays = getWeekDays("short");
  const monthName = getMonthName(month);

  const handlePreviousMonth = () => {
    const { year: newYear, month: newMonth } = getPreviousMonth(year, month);
    setCurrentDate(new Date(newYear, newMonth, 1));
  };

  const handleNextMonth = () => {
    const { year: newYear, month: newMonth } = getNextMonth(year, month);
    setCurrentDate(new Date(newYear, newMonth, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleDateClick = (dateInfo) => {
    setSelectedDate(dateInfo.date);
    if (onDateClick) {
      onDateClick(dateInfo.date);
    }
  };

  const handleEventClick = (event, e) => {
    e.stopPropagation();
    if (onEventClick) {
      onEventClick(event);
    }
  };

  return (
    <div className="bg-white dark:bg-secondary rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaCalendarAlt className="text-2xl text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {monthName} {year}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={handlePreviousMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <FaChevronLeft className="text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <FaChevronRight className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarGrid.map((dateInfo, index) => {
          const dateEvents = getEventsForDate(events, dateInfo.date);
          const today = isToday(dateInfo.date);
          const selected =
            selectedDate &&
            dateInfo.date.toDateString() === selectedDate.toDateString();

          return (
            <div
              key={index}
              onClick={() => handleDateClick(dateInfo)}
              className={`
                min-h-[100px] p-2 border rounded-lg cursor-pointer transition-all
                ${
                  dateInfo.isCurrentMonth
                    ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-50"
                }
                ${today ? "ring-2 ring-blue-500" : ""}
                ${
                  selected
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700"
                    : ""
                }
                hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600
              `}
            >
              <div className="flex justify-between items-start mb-1">
                <span
                  className={`
                    text-sm font-medium
                    ${today ? "text-blue-600 dark:text-blue-400 font-bold" : ""}
                    ${
                      dateInfo.isCurrentMonth
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-gray-400 dark:text-gray-600"
                    }
                  `}
                >
                  {dateInfo.day}
                </span>
              </div>

              {/* Events */}
              <div className="space-y-1">
                {dateEvents.slice(0, 3).map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    onClick={(e) => handleEventClick(event, e)}
                    className={`
                      text-xs px-2 py-1 rounded text-white truncate
                      ${getEventColor(event.type)}
                      hover:opacity-80 transition-opacity
                    `}
                    title={event.title || event.name}
                  >
                    {event.title || event.name}
                  </div>
                ))}
                {dateEvents.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
                    +{dateEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Meeting
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Leave
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Holiday
          </span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;

Calendar.propTypes = {
  events: PropTypes.array,
  onDateClick: PropTypes.func,
  onEventClick: PropTypes.func,
};
