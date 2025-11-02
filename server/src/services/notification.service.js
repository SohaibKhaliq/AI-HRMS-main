import Notification from "../models/notification.model.js";
import { sendMail } from "../utils/index.js";
import { getEmailTemplate } from "./email.service.js";

/**
 * Create a notification for an employee
 */
export const createNotification = async ({
  recipient,
  title,
  message,
  type,
  priority = "medium",
  link = null,
  metadata = {},
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      title,
      message,
      type,
      priority,
      link,
      metadata,
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

/**
 * Create notifications for multiple employees
 */
export const createBulkNotifications = async (recipients, notificationData) => {
  try {
    const notifications = recipients.map((recipient) => ({
      recipient,
      ...notificationData,
    }));
    const created = await Notification.insertMany(notifications);
    return created;
  } catch (error) {
    console.error("Error creating bulk notifications:", error);
    throw error;
  }
};

/**
 * Send email notification
 */
export const sendEmailNotification = async ({
  email,
  subject,
  templateName,
  templateData,
}) => {
  try {
    const html = getEmailTemplate(templateName, templateData);
    await sendMail({
      email,
      subject,
      html,
    });
  } catch (error) {
    console.error("Error sending email notification:", error);
    throw error;
  }
};

/**
 * Send notification both in-app and via email
 */
export const sendFullNotification = async ({
  employee,
  title,
  message,
  type,
  priority = "medium",
  link = null,
  metadata = {},
  emailSubject = null,
  emailTemplate = null,
  emailData = {},
}) => {
  try {
    // Create in-app notification
    const notification = await createNotification({
      recipient: employee._id,
      title,
      message,
      type,
      priority,
      link,
      metadata,
    });

    // Send email if template is provided
    if (emailTemplate && employee.email) {
      await sendEmailNotification({
        email: employee.email,
        subject: emailSubject || title,
        templateName: emailTemplate,
        templateData: {
          employeeName: employee.name,
          ...emailData,
        },
      });
    }

    return notification;
  } catch (error) {
    console.error("Error sending full notification:", error);
    throw error;
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true, readAt: new Date() },
      { new: true }
    );
    return notification;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Get unread count for an employee
 */
export const getUnreadCount = async (employeeId) => {
  try {
    const count = await Notification.countDocuments({
      recipient: employeeId,
      read: false,
    });
    return count;
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
};

/**
 * Get all notifications for an employee
 */
export const getEmployeeNotifications = async (employeeId, limit = 50) => {
  try {
    const notifications = await Notification.find({ recipient: employeeId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return notifications;
  } catch (error) {
    console.error("Error getting employee notifications:", error);
    return [];
  }
};
