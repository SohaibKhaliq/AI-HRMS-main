/**
 * Calendar Utilities
 * Helper functions for calendar component
 */

/**
 * Get days in a month
 */
export const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Get first day of month (0 = Sunday, 6 = Saturday)
 */
export const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

/**
 * Get calendar grid (6 weeks x 7 days = 42 cells)
 */
export const getCalendarGrid = (year, month) => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInPrevMonth = getDaysInMonth(year, month - 1);
  
  const grid = [];
  
  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    grid.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      isPrevMonth: true,
      date: new Date(year, month - 1, daysInPrevMonth - i),
    });
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    grid.push({
      day,
      isCurrentMonth: true,
      isPrevMonth: false,
      date: new Date(year, month, day),
    });
  }
  
  // Next month days (fill to 42 cells)
  const remainingCells = 42 - grid.length;
  for (let day = 1; day <= remainingCells; day++) {
    grid.push({
      day,
      isCurrentMonth: false,
      isPrevMonth: false,
      date: new Date(year, month + 1, day),
    });
  }
  
  return grid;
};

/**
 * Check if date is today
 */
export const isToday = (date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1, date2) => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

/**
 * Format date for display
 */
export const formatDate = (date, format = 'long') => {
  if (!date) return '';
  
  const d = new Date(date);
  
  if (format === 'short') {
    // "Jan 15"
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else if (format === 'long') {
    // "January 15, 2025"
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } else if (format === 'time') {
    // "2:30 PM"
    return d.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }
  
  return d.toLocaleDateString();
};

/**
 * Get month name
 */
export const getMonthName = (month, format = 'long') => {
  const date = new Date(2000, month, 1);
  return date.toLocaleDateString('en-US', { 
    month: format 
  });
};

/**
 * Get events for a specific date
 */
export const getEventsForDate = (events, date) => {
  if (!events || !Array.isArray(events)) return [];
  
  return events.filter(event => {
    const eventDate = new Date(event.date || event.startTime);
    return isSameDay(eventDate, date);
  });
};

/**
 * Get event color based on type
 */
export const getEventColor = (type) => {
  const colors = {
    meeting: 'bg-blue-500',
    leave: 'bg-orange-500',
    holiday: 'bg-green-500',
    birthday: 'bg-purple-500',
    default: 'bg-gray-500',
  };
  
  return colors[type] || colors.default;
};

/**
 * Navigate to previous month
 */
export const getPreviousMonth = (year, month) => {
  if (month === 0) {
    return { year: year - 1, month: 11 };
  }
  return { year, month: month - 1 };
};

/**
 * Navigate to next month
 */
export const getNextMonth = (year, month) => {
  if (month === 11) {
    return { year: year + 1, month: 0 };
  }
  return { year, month: month + 1 };
};

/**
 * Get week days (Sun - Sat)
 */
export const getWeekDays = (format = 'short') => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  if (format === 'short') {
    return days.map(day => day.substring(0, 3));
  } else if (format === 'min') {
    return days.map(day => day.substring(0, 1));
  }
  
  return days;
};
