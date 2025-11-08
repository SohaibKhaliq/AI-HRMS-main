/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { getUnreadCount } from "../services/notification.service";
import toast from "react-hot-toast";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useSelector((state) => state.authentication);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user?._id) return;

    // Connect to socket server
    const socketUrl =
      import.meta.env.VITE_URL?.replace("/api", "") || "http://localhost:3000";
    const newSocket = io(socketUrl, {
      auth: {
        userId: user._id,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected");
      setConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setConnected(false);
    });

    // Listen for new notifications
    newSocket.on("notification", (notification) => {
      console.log("New notification received:", notification);

      // Show toast notification
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200 dark:border-gray-700">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        ),
        {
          duration: 5000,
          position: "top-right",
        }
      );

      // Refresh unread count
      dispatch(getUnreadCount());
    });

    // Listen for leave status updates
    newSocket.on("leave-updated", (data) => {
      console.log("Leave updated:", data);
      toast.success(`Leave request ${data.status}`);
      dispatch(getUnreadCount());
    });

    // Listen for payroll updates
    newSocket.on("payroll-updated", (data) => {
      console.log("Payroll updated:", data);
      toast.success("Payroll updated");
      dispatch(getUnreadCount());
    });

    // Listen for meeting updates
    newSocket.on("meeting-updated", (data) => {
      console.log("Meeting updated:", data);
      toast.info("Meeting updated");
      dispatch(getUnreadCount());
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?._id, dispatch]);

  const value = {
    socket,
    connected,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: PropTypes.node,
};
