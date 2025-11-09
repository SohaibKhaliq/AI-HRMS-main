import Termination from "../models/termination.model.js";
import Employee from "../models/employee.model.js";
import { myCache, catchErrors, formatDate } from "../utils/index.js";
import { sendFullNotification } from "../services/notification.service.js";

const createTermination = catchErrors(async (req, res) => {
  const {
    employee,
    type,
    terminationDate,
    noticeDate,
    reason,
    status,
    remarks,
  } = req.body;

  if (!employee || !type || !terminationDate || !noticeDate || !reason) {
    throw new Error(
      "Missing required fields: employee, type, terminationDate, noticeDate, reason"
    );
  }

  let finalDocumentUrl = null;

  // Handle file upload if document is provided
  if (req.file) {
    finalDocumentUrl = `${process.env.CLIENT_URL}/uploads/documents/${req.file.filename}`;
  }

  const data = {
    employee,
    type,
    terminationDate: new Date(terminationDate),
    noticeDate: new Date(noticeDate),
    reason,
    status: status || "In progress",
    documentUrl: finalDocumentUrl,
    remarks: remarks || "",
  };

  const termination = await Termination.create(data);
  const populated = await Termination.findById(termination._id).populate(
    "employee",
    "name firstName lastName employeeId email profilePicture"
  );

  // Send notification to employee
  const employeeData = await Employee.findById(employee);
  if (employeeData) {
    sendFullNotification({
      employee: employeeData,
      title: "Termination Notice",
      message: `This is to inform you about your employment termination. Type: ${type}. Termination date: ${formatDate(
        terminationDate
      )}. Please contact HR for more details.`,
      type: "termination",
      priority: "high",
      link: "/profile",
      emailSubject: "Employment Termination Notice",
      emailTemplate: "announcement",
      emailData: {
        title: "Employment Termination Notice",
        message: `This is to inform you about your employment termination. Type: ${type}. Notice date: ${formatDate(
          noticeDate
        )}. Termination date: ${formatDate(
          terminationDate
        )}. Reason: ${reason}. ${
          remarks ? `Additional remarks: ${remarks}` : ""
        } Please contact HR for further details.`,
      },
    }).catch((e) =>
      console.warn(
        "Non-fatal: termination notification failed:",
        e && e.message ? e.message : e
      )
    );
  }

  myCache.del("terminations");

  return res.status(201).json({
    success: true,
    message: "Termination created successfully",
    termination: populated,
  });
});

const getAllTerminations = catchErrors(async (req, res) => {
  try {
    const terminations = await Termination.find()
      .populate(
        "employee",
        "name firstName lastName employeeId email profilePicture"
      )
      .sort({ createdAt: -1 })
      .lean();

    myCache.set("terminations", terminations, 600);

    return res.status(200).json({
      success: true,
      message: "Terminations fetched successfully",
      terminations,
    });
  } catch (err) {
    console.error(
      "Error in getAllTerminations:",
      err && err.message ? err.message : err
    );
    throw err;
  }
});

const getTerminationById = catchErrors(async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) throw new Error("Please provide termination id");
    const termination = await Termination.findById(id)
      .populate(
        "employee",
        "name firstName lastName employeeId email profilePicture"
      )
      .lean();
    return res.status(200).json({
      success: true,
      message: "Termination fetched",
      termination,
    });
  } catch (err) {
    console.error(
      "Error in getTerminationById:",
      err && err.message ? err.message : err
    );
    throw err;
  }
});

const updateTermination = catchErrors(async (req, res) => {
  const { id } = req.params;
  const {
    employee,
    type,
    terminationDate,
    noticeDate,
    reason,
    status,
    remarks,
  } = req.body;

  if (!id) throw new Error("Please provide termination id");

  const updateData = {};
  if (employee) updateData.employee = employee;
  if (type) updateData.type = type;
  if (terminationDate) updateData.terminationDate = new Date(terminationDate);
  if (noticeDate) updateData.noticeDate = new Date(noticeDate);
  if (reason) updateData.reason = reason;
  if (status) updateData.status = status;
  if (remarks !== undefined) updateData.remarks = remarks;

  // Handle file upload if document is provided
  if (req.file) {
    updateData.documentUrl = `${process.env.CLIENT_URL}/uploads/documents/${req.file.filename}`;
  }

  const termination = await Termination.findByIdAndUpdate(id, updateData, {
    new: true,
  }).populate(
    "employee",
    "name firstName lastName employeeId email profilePicture"
  );

  myCache.del("terminations");

  return res.status(200).json({
    success: true,
    message: "Termination updated",
    termination,
  });
});

const deleteTermination = catchErrors(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new Error("Please provide termination id");
  await Termination.findByIdAndDelete(id);
  myCache.del("terminations");
  return res
    .status(200)
    .json({ success: true, message: "Termination deleted" });
});

export {
  createTermination,
  getAllTerminations,
  getTerminationById,
  updateTermination,
  deleteTermination,
};
