import Announcement from "../models/announcement.model.js";
import Employee from "../models/employee.model.js";
import { catchErrors, myCache } from "../utils/index.js";
import { createBulkNotifications, sendEmailNotification } from "../services/notification.service.js";

const getAnnouncements = catchErrors(async (req, res) => {
  const { category, priority, page = 1, limit = 12 } = req.query;

  const query = {};

  if (category) query.category = { $regex: category, $options: "i" };
  if (priority) query.priority = { $regex: priority, $options: "i" };

  const pageNumber = Math.max(parseInt(page), 1);
  const limitNumber = Math.max(parseInt(limit), 1);
  const skip = (pageNumber - 1) * limitNumber;

  const announcements = await Announcement.find(query)
    .sort({ createdAt: -1 })
    .populate({
      path: "createdBy",
      select: "name employeeId designation",
      populate: {
        path: "designation",
        select: "name",
      },
    })
    .skip(skip)
    .limit(limitNumber);

  const totalAnnouncements = await Announcement.countDocuments(query);
  const totalPages = Math.ceil(totalAnnouncements / limitNumber);

  return res.status(200).json({
    success: true,
    message: "Announcements fetched successfully",
    announcements,
    pagination: {
      currentPage: pageNumber,
      totalPages,
      totalAnnouncements,
      limit: limitNumber,
    },
  });
});

const createAnnouncement = catchErrors(async (req, res) => {
  const { title, category, description, startDate, endDate, targetDepartments, priority, isActive } = req.body;

  if (!title || !category || !description || !startDate || !endDate)
    throw new Error("All required fields are required");

  let attachmentUrl = null;
  if (req.file) {
    attachmentUrl = req.file.path;
  }

  // Parse targetDesignations if it's a JSON string
  let parsedTargetDesignations = ["All"];
  if (req.body.targetDesignations) {
    try {
      parsedTargetDesignations = JSON.parse(req.body.targetDesignations);
    } catch (e) {
      parsedTargetDesignations = Array.isArray(req.body.targetDesignations) 
        ? req.body.targetDesignations 
        : ["All"];
    }
  }

  const announcement = await Announcement.create({
    title,
    category,
    description,
    startDate,
    endDate,
    attachmentUrl,
    targetDepartments: targetDepartments || ["All"],
    targetDesignations: parsedTargetDesignations,
    priority: priority || "Medium",
    isActive: isActive !== undefined ? isActive : true,
    createdBy: req.user.id,
  });

  // Send notification to all employees
  try {
    const employees = await Employee.find({}).select('_id name email');
    
    // Create bulk in-app notifications
    await createBulkNotifications(
      employees.map(emp => emp._id),
      {
        title: `New Announcement: ${title}`,
        message: description.substring(0, 100) + (description.length > 100 ? '...' : ''),
        type: "announcement",
        priority: priority?.toLowerCase() || "medium",
        link: "/announcements",
      }
    );

    // Send emails to all employees (in background, don't wait)
    // Note: For production with large user base, consider implementing:
    // - Email queue system (Bull, BeeQueue)
    // - Batch processing with delays
    // - Professional email service (SendGrid, AWS SES) with higher rate limits
    Promise.all(employees.map(emp => 
      sendEmailNotification({
        email: emp.email,
        subject: `Metro HRMS - ${title}`,
        templateName: "announcement",
        templateData: {
          employeeName: emp.name,
          title: title,
          message: description,
        },
      }).catch(err => console.error(`Failed to send email to ${emp.email}:`, err))
    ));
  } catch (err) {
    console.error("Error sending announcement notifications:", err);
  }

  myCache.del("insights");

  return res.status(201).json({
    success: true,
    message: "Announcement created successfully",
    announcement,
  });
});

const getAnnouncementById = catchErrors(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new Error("Announcement ID is required");

  const announcement = await Announcement.findById(id)
    .populate({
      path: "createdBy",
      select: "name employeeId designation",
      populate: {
        path: "designation",
        select: "name",
      },
    });

  if (!announcement) throw new Error("Announcement not found");

  return res.status(200).json({
    success: true,
    message: "Announcement fetched successfully",
    announcement,
  });
});

const updateAnnouncement = catchErrors(async (req, res) => {
  const { id } = req.params;
  const { title, category, description, startDate, endDate, targetDepartments, priority, isActive } = req.body;

  if (!id) throw new Error("Announcement ID is required");

  const announcement = await Announcement.findById(id);

  if (!announcement) throw new Error("Announcement not found");

  if (title) announcement.title = title;
  if (category) announcement.category = category;
  if (description) announcement.description = description;
  if (startDate) announcement.startDate = startDate;
  if (endDate) announcement.endDate = endDate;
  if (targetDepartments) announcement.targetDepartments = targetDepartments;
  
  // Parse targetDesignations if it's a JSON string
  if (req.body.targetDesignations) {
    try {
      announcement.targetDesignations = JSON.parse(req.body.targetDesignations);
    } catch (e) {
      announcement.targetDesignations = Array.isArray(req.body.targetDesignations) 
        ? req.body.targetDesignations 
        : announcement.targetDesignations;
    }
  }
  
  if (priority) announcement.priority = priority;
  if (isActive !== undefined) announcement.isActive = isActive;
  if (req.file) announcement.attachmentUrl = req.file.path;

  await announcement.save();

  myCache.del("insights");

  return res.status(200).json({
    success: true,
    message: "Announcement updated successfully",
    announcement,
  });
});

const deleteAnnouncementById = catchErrors(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new Error("Announcement ID is required");

  const announcement = await Announcement.findByIdAndDelete(id);

  if (!announcement) throw new Error("Announcement not found");

  myCache.del("insights");

  return res.status(200).json({
    success: true,
    message: "Announcement deleted successfully",
  });
});

export {
  getAnnouncements,
  createAnnouncement,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncementById,
};