import Holiday from "../models/holiday.model.js";
import Employee from "../models/employee.model.js";
import { catchErrors, myCache, formatDate } from "../utils/index.js";
import { createBulkNotifications, sendEmailNotification } from "../services/notification.service.js";

const getHolidays = catchErrors(async (req, res) => {
  const { category, type, page = 1, limit = 12 } = req.query;

  const query = {};

  if (category) query.category = { $regex: category, $options: "i" };
  if (type) query.type = { $regex: type, $options: "i" };

  const pageNumber = Math.max(parseInt(page), 1);
  const limitNumber = Math.max(parseInt(limit), 1);
  const skip = (pageNumber - 1) * limitNumber;

  const holidays = await Holiday.find(query)
    .sort({ date: 1 })
    .skip(skip)
    .limit(limitNumber);

  const totalHolidays = await Holiday.countDocuments(query);
  const totalPages = Math.ceil(totalHolidays / limitNumber);

  return res.status(200).json({
    success: true,
    message: "Holidays fetched successfully",
    holidays,
    pagination: {
      currentPage: pageNumber,
      totalPages,
      totalHolidays,
      limit: limitNumber,
    },
  });
});

const createHoliday = catchErrors(async (req, res) => {
  const { holidayName, date, category, type, description, isPaid } = req.body;

  if (!holidayName || !date || !category || !type || !description)
    throw new Error("All required fields are required");

  const holiday = await Holiday.create({
    holidayName,
    date,
    category,
    type,
    description,
    isPaid: isPaid !== undefined ? isPaid : true,
  });

  // Send notification to all employees about new holiday
  try {
    const employees = await Employee.find({}).select('_id name email');
    
    // Create bulk in-app notifications
    await createBulkNotifications(
      employees.map(emp => emp._id),
      {
        title: `Holiday Announcement: ${holidayName}`,
        message: `${holidayName} on ${formatDate(date)}. ${description}`,
        type: "holiday",
        priority: "medium",
        link: "/holidays",
      }
    );

    // Send emails to all employees (in background)
    Promise.all(employees.map(emp => 
      sendEmailNotification({
        email: emp.email,
        subject: `Metro HRMS - Holiday: ${holidayName}`,
        templateName: "holidayAnnouncement",
        templateData: {
          employeeName: emp.name,
          holidayName: holidayName,
          holidayDate: formatDate(date),
          description: description,
        },
      }).catch(err => console.error(`Failed to send email to ${emp.email}:`, err))
    ));
  } catch (err) {
    console.error("Error sending holiday notifications:", err);
  }

  myCache.del("insights");

  return res.status(201).json({
    success: true,
    message: "Holiday created successfully",
    holiday,
  });
});

const getHolidayById = catchErrors(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new Error("Holiday ID is required");

  const holiday = await Holiday.findById(id);

  if (!holiday) throw new Error("Holiday not found");

  return res.status(200).json({
    success: true,
    message: "Holiday fetched successfully",
    holiday,
  });
});

const updateHoliday = catchErrors(async (req, res) => {
  const { id } = req.params;
  const { holidayName, date, category, type, description, isPaid } = req.body;

  if (!id) throw new Error("Holiday ID is required");

  const holiday = await Holiday.findById(id);

  if (!holiday) throw new Error("Holiday not found");

  if (holidayName) holiday.holidayName = holidayName;
  if (date) holiday.date = date;
  if (category) holiday.category = category;
  if (type) holiday.type = type;
  if (description) holiday.description = description;
  if (isPaid !== undefined) holiday.isPaid = isPaid;

  await holiday.save();

  myCache.del("insights");

  return res.status(200).json({
    success: true,
    message: "Holiday updated successfully",
    holiday,
  });
});

const deleteHolidayById = catchErrors(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new Error("Holiday ID is required");

  const holiday = await Holiday.findByIdAndDelete(id);

  if (!holiday) throw new Error("Holiday not found");

  myCache.del("insights");

  return res.status(200).json({
    success: true,
    message: "Holiday deleted successfully",
  });
});

export {
  getHolidays,
  createHoliday,
  getHolidayById,
  updateHoliday,
  deleteHolidayById,
};
