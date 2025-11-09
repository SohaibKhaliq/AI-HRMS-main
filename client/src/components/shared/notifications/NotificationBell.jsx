import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaBell } from "react-icons/fa";
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
} from "../../../services/notification.service";
import { formatDistanceToNow } from "../../../utils/dateUtils";
import { useNavigate } from "react-router-dom";

const NotificationBell = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading } = useSelector(
    (state) => state.notification || {}
  );
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch unread count on mount
    dispatch(getUnreadCount());

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      dispatch(getUnreadCount());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleToggle = () => {
    if (!isOpen) {
      // Fetch notifications when opening
      dispatch(getMyNotifications(20));
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = (notificationId, e) => {
    e.stopPropagation();
    dispatch(markAsRead(notificationId));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "medium":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "leave":
        return "🏖️";
      case "attendance":
        return "✅";
      case "payroll":
        return "💰";
      case "meeting":
        return "📅";
      case "holiday":
        return "🎉";
      case "announcement":
        return "📢";
      case "document":
        return "📄";
      case "performance":
        return "📊";
      case "resignation":
        return "👋";
      default:
        return "📌";
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <FaBell className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Notification Panel - use fixed positioning so it's not clipped by sidebar overflow */}
          <div className="fixed right-4 top-[70px] mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 max-h-[500px] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {loading && notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <FaBell className="text-4xl mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                        !notification.read
                          ? "bg-blue-50 dark:bg-gray-700/50"
                          : ""
                      }`}
                      onClick={(e) => {
                        if (!notification.read) {
                          handleMarkAsRead(notification._id, e);
                        }
                        if (notification.link) {
                          window.location.href = notification.link;
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="text-2xl flex-shrink-0">
                          {getTypeIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4
                              className={`font-semibold text-sm ${
                                !notification.read
                                  ? "text-gray-900 dark:text-white"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {notification.title}
                            </h4>
                            <span
                              className={`text-xs ${getPriorityColor(
                                notification.priority
                              )} flex-shrink-0`}
                            >
                              {notification.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {formatDistanceToNow(notification.createdAt)}
                          </p>
                        </div>

                        {/* Unread Indicator */}
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t dark:border-gray-700">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/notifications");
                  }}
                  className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
