import { catchErrors } from "../utils/index.js";
import {
  getEmployeeNotifications,
  getUnreadCount,
  markAsRead,
  createNotification,
} from "../services/notification.service.js";

const getMyNotifications = catchErrors(async (req, res) => {
  const employeeId = req.employee._id;
  const { limit } = req.query;

  const notifications = await getEmployeeNotifications(
    employeeId,
    parseInt(limit) || 50
  );
  const unreadCount = await getUnreadCount(employeeId);

  return res.status(200).json({
    success: true,
    message: "Notifications fetched successfully",
    notifications,
    unreadCount,
  });
});

const markNotificationAsRead = catchErrors(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new Error("Notification ID is required");

  const notification = await markAsRead(id);

  return res.status(200).json({
    success: true,
    message: "Notification marked as read",
    notification,
  });
});

const getUnreadNotificationCount = catchErrors(async (req, res) => {
  const employeeId = req.employee._id;
  const count = await getUnreadCount(employeeId);

  return res.status(200).json({
    success: true,
    message: "Unread count fetched successfully",
    count,
  });
});

const createAdminNotification = catchErrors(async (req, res) => {
  const { recipient, title, message, type, priority, link, metadata } = req.body;

  if (!recipient || !title || !message || !type) {
    throw new Error("Recipient, title, message, and type are required");
  }

  const notification = await createNotification({
    recipient,
    title,
    message,
    type,
    priority: priority || "medium",
    link: link || null,
    metadata: metadata || {},
  });

  return res.status(201).json({
    success: true,
    message: "Notification created successfully",
    notification,
  });
});

export {
  getMyNotifications,
  markNotificationAsRead,
  getUnreadNotificationCount,
  createAdminNotification,
};
