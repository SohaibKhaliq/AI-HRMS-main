import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyNotifications } from "../../services/notification.service";
import { formatDistanceToNow } from "../../utils/dateUtils";

const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications = [], loading } = useSelector(
    (s) => s.notification || {}
  );

  useEffect(() => {
    dispatch(getMyNotifications(100));
  }, [dispatch]);

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <div className="text-sm text-gray-500">
            {notifications.length} items
          </div>
        </div>

        <div className="p-4">
          {loading ? (
            <div>Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-gray-500 p-8">
              No notifications
            </div>
          ) : (
            <div className="divide-y dark:divide-gray-700">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    !n.read ? "bg-blue-50 dark:bg-gray-700/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">
                      {(() => {
                        switch (n.type) {
                          case "leave":
                            return "🏖️";
                          case "attendance":
                            return "✅";
                          case "payroll":
                            return "💰";
                          case "meeting":
                            return "📅";
                          case "announcement":
                            return "📢";
                          case "document":
                            return "📄";
                          default:
                            return "📌";
                        }
                      })()}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-semibold text-sm">{n.title}</h4>
                        <div className="text-xs text-gray-500">
                          {formatDistanceToNow(n.createdAt)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                      {n.link && (
                        <a
                          href={n.link}
                          className="text-indigo-600 text-sm mt-2 inline-block"
                        >
                          Open
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
