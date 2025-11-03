import { catchErrors, myCache, formatDate } from "../utils/index.js";
import Resignation from "../models/resignation.model.js";
import Employee from "../models/employee.model.js";
import { sendFullNotification } from "../services/notification.service.js";

const createResignation = catchErrors(async (req, res) => {
  console.log("=== Create Resignation Request ===");
  console.log("Request body:", req.body);
  console.log("Request file:", req.file);
  console.log("================================");
  
  const { employee, resignationDate, lastWorkingDay, noticePeriod, reason, status, documentUrl, remarks, createdAt } = req.body;

  if (!employee || !resignationDate || !lastWorkingDay) {
    console.error("Missing required fields:", { employee, resignationDate, lastWorkingDay });
    throw new Error("Missing required fields: employee, resignationDate, lastWorkingDay");
  }

  let finalDocumentUrl = documentUrl || null;

  // Handle file upload if document is provided
  if (req.file) {
    finalDocumentUrl = req.file.path;
  }

  const data = {
    employee,
    resignationDate: new Date(resignationDate),
    lastWorkingDay: new Date(lastWorkingDay),
    noticePeriod: noticePeriod || 0,
    reason: reason || "",
    status: status || "Pending",
    documentUrl: finalDocumentUrl,
    remarks: remarks || "",
  };
  if (createdAt) data.createdAt = new Date(createdAt);

  console.log("Creating resignation with data:", data);
  
  const resignation = await Resignation.create(data);
  console.log("Resignation created:", resignation._id);
  
  const populated = await Resignation.findById(resignation._id)
    .populate("employee", "name firstName lastName employeeId email profilePicture");
  console.log("Resignation populated:", populated);

  // Send notification to employee (don't let notification errors break resignation creation)
  try {
    const employeeData = await Employee.findById(employee);
    if (employeeData) {
      await sendFullNotification({
        employee: employeeData,
        title: "Resignation Submitted",
        message: "Your resignation has been submitted successfully and is under review.",
        type: "resignation",
        priority: "high",
        link: "/resignation",
        emailSubject: "Resignation Submitted",
        emailTemplate: "resignationSubmitted",
        emailData: {
          resignationDate: formatDate(resignationDate),
          lastWorkingDay: formatDate(lastWorkingDay),
          noticePeriod: noticePeriod || 0,
        },
      });
    }
  } catch (notificationError) {
    console.error("Failed to send notification:", notificationError);
    // Continue even if notification fails
  }

  myCache.del("resignations");

  return res.status(201).json({ success: true, message: "Resignation created successfully", resignation: populated });
});

const getAllResignations = catchErrors(async (req, res) => {
  const cacheKey = "resignations";
  const cached = myCache.get(cacheKey);
  if (cached) {
    return res.status(200).json({ success: true, message: "Resignations fetched (cache)", resignations: cached });
  }

  const resignations = await Resignation.find()
    .populate("employee", "name firstName lastName employeeId email profilePicture")
    .lean();
  myCache.set(cacheKey, resignations);

  return res.status(200).json({ success: true, message: "Resignations fetched successfully", resignations });
});

  const getMyResignation = catchErrors(async (req, res) => {
    const employeeId = req.user.id;
  
    const resignation = await Resignation.findOne({ employee: employeeId })
      .populate("employee", "name firstName lastName employeeId email profilePicture")
      .lean();
  
    if (!resignation) {
      return res.status(404).json({ success: false, message: "No resignation found" });
    }

    return res.status(200).json({ success: true, message: "Resignation fetched successfully", resignation });
  });

const getResignationById = catchErrors(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new Error("Please provide resignation id");
  const resignation = await Resignation.findById(id)
    .populate("employee", "name firstName lastName employeeId email profilePicture");
  return res.status(200).json({ success: true, message: "Resignation fetched", resignation });
});

const updateResignation = catchErrors(async (req, res) => {
  const { id } = req.params;
  const { employee, resignationDate, lastWorkingDay, noticePeriod, reason, status, documentUrl, remarks, createdAt } = req.body;
  if (!id) throw new Error("Please provide resignation id");

  const updateData = {};
  if (employee) updateData.employee = employee;
  if (resignationDate) updateData.resignationDate = new Date(resignationDate);
  if (lastWorkingDay) updateData.lastWorkingDay = new Date(lastWorkingDay);
  if (noticePeriod !== undefined) updateData.noticePeriod = noticePeriod;
  if (reason !== undefined) updateData.reason = reason;
  if (status) updateData.status = status;
  if (remarks !== undefined) updateData.remarks = remarks;
  if (createdAt) updateData.createdAt = new Date(createdAt);

  // Handle file upload if document is provided
  if (req.file) {
    updateData.documentUrl = req.file.path;
  } else if (documentUrl !== undefined) {
    updateData.documentUrl = documentUrl;
  }

  const resignation = await Resignation.findByIdAndUpdate(id, updateData, { new: true })
    .populate("employee", "name firstName lastName employeeId email profilePicture");

  // Send notification if status changed to Approved or Rejected
  if (status && (status === "Approved" || status === "Rejected")) {
    const employeeData = await Employee.findById(resignation.employee._id);
    if (employeeData) {
      if (status === "Approved") {
        await sendFullNotification({
          employee: employeeData,
          title: "Resignation Approved",
          message: `Your resignation has been approved. Your last working day is ${formatDate(resignation.lastWorkingDay)}.`,
          type: "resignation",
          priority: "high",
          link: "/resignation",
          emailSubject: "Resignation Approved",
          emailTemplate: "resignationApproved",
          emailData: {
            lastWorkingDay: formatDate(resignation.lastWorkingDay),
          },
        });
      } else if (status === "Rejected") {
        await sendFullNotification({
          employee: employeeData,
          title: "Resignation Update",
          message: `Your resignation has been ${status.toLowerCase()}. ${remarks || ''}`,
          type: "resignation",
          priority: "high",
          link: "/resignation",
        });
      }
    }
  }

  myCache.del("resignations");

  return res.status(200).json({ success: true, message: "Resignation updated", resignation });
});

const deleteResignation = catchErrors(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new Error("Please provide resignation id");
  await Resignation.findByIdAndDelete(id);
  myCache.del("resignations");
  return res.status(200).json({ success: true, message: "Resignation deleted" });
});

export { createResignation, getAllResignations, getMyResignation, getResignationById, updateResignation, deleteResignation };
