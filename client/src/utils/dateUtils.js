/**
 * Format a date as "X time ago" (e.g., "2 hours ago", "3 days ago")
 */
export const formatDistanceToNow = (date) => {
  if (!date) return "";
  
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return "just now";
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour !== 1 ? "s" : ""} ago`;
  } else if (diffDay < 7) {
    return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;
  } else {
    return past.toLocaleDateString();
  }
};

/**
 * Format date as readable string
 */
export const formatDate = (date, includeTime = false) => {
  if (!date) return "";
  const d = new Date(date);
  if (includeTime) {
    return d.toLocaleString();
  }
  return d.toLocaleDateString();
};

/**
 * Format time from date
 */
export const formatTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

/**
 * Check if date is today
 */
export const isToday = (date) => {
  if (!date) return false;
  const d = new Date(date);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};
