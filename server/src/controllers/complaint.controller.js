import Complaint from "../models/complaint.model.js";
import Employee from "../models/employee.model.js";
import { createUpdate } from "./update.controller.js";
import { complaintRespond } from "../templates/index.js";
import { catchErrors, myCache, buildPublicUrl } from "../utils/index.js";
import { sendFullNotification } from "../services/notification.service.js";
import { enqueueAnalysisJob } from "../services/analysisQueue.service.js";

const getComplaints = catchErrors(async (req, res) => {
  const { status, page = 1, limit = 12, employee } = req.query;

  const query = {};

  if (status) query.status = { $regex: status, $options: "i" };
  // optional employee filter: support special value 'me' to return complaints
  // where the requester is either the reporter or the target (againstEmployee)
  if (employee === "me") {
    const requester = req.user && req.user.id;
    if (requester) {
      query.$or = [{ employee: requester }, { againstEmployee: requester }];
    }
  } else if (employee) {
    query.employee = employee;
  }

  const pageNumber = Math.max(parseInt(page), 1);
  const limitNumber = Math.max(parseInt(limit), 1);
  const skip = (pageNumber - 1) * limitNumber;

  const complaint = await Complaint.find(query)
    .sort({ createdAt: -1 })
    .populate({
      path: "employee",
      select: "name employeeId department role designation",
      populate: [
        {
          path: "department",
          select: "name",
        },
        {
          path: "role",
          select: "name",
        },
        {
          path: "designation",
          select: "name",
        },
      ],
    })
    .populate({
      path: "againstEmployee",
      select: "name employeeId designation",
      populate: {
        path: "designation",
        select: "name",
      },
    })
    .populate({
      path: "assignComplaint",
      select: "name designation",
      populate: {
        path: "designation",
        select: "name",
      },
    })
    .skip(skip)
    .limit(limitNumber);

  const totalComplaints = await Complaint.countDocuments(query);
  const totalPages = Math.ceil(totalComplaints / limitNumber);

  return res.status(200).json({
    success: true,
    message: "Complaint fetched successfully",
    complaint,
    pagination: {
      currentPage: pageNumber,
      totalPages,
      totalComplaints,
      limit: limitNumber,
    },
  });
});

const createComplaint = catchErrors(async (req, res) => {
  const {
    againstEmployee,
    complainType,
    complaintDetails,
    complainSubject,
    assignComplaint,
    remarks,
  } = req.body;

  // Employee should come from authenticated token rather than client-supplied body
  const employeeId = req.user && req.user.id;
  if (!employeeId || !complainType || !complaintDetails || !complainSubject)
    throw new Error("All required fields are required");

  let documentUrl = null;
  if (req.file) {
    // Store public URL for the uploaded document (server-origin)
    documentUrl = buildPublicUrl(
      req,
      `/uploads/documents/${req.file.filename}`
    );
  }

  const complaint = await Complaint.create({
    employee: employeeId,
    againstEmployee: againstEmployee || null,
    complainType,
    complainSubject,
    complaintDetails,
    status: "Pending",
    assignComplaint: assignComplaint || null,
    documentUrl,
    remarks: remarks || null,
  });
  // Enqueue analysis job for complaint (best-effort background)
  try {
    await enqueueAnalysisJob("complaint", complaint._id);
  } catch (e) {
    console.warn(
      "Failed to enqueue complaint analysis job:",
      e && e.message ? e.message : e
    );
  }

  // Send notification to employee confirming complaint submission
  const employeeData = await Employee.findById(employeeId);
  if (employeeData) {
    // Fire-and-forget notification/email
    sendFullNotification({
      employee: employeeData,
      title: "Complaint Submitted",
      message: `Your complaint regarding ${complainType} has been submitted successfully and is under review.`,
      type: "complaint",
      priority: "medium",
      link: "/complaints",
      emailSubject: "Complaint Submitted",
      emailTemplate: "complaintUpdate",
      emailData: {
        complaintType: complainType,
        subject: complainSubject,
        status: "Pending",
      },
    }).catch((e) =>
      console.warn(
        "Non-fatal: complaint notification failed:",
        e && e.message ? e.message : e
      )
    );
  }

  myCache.del("insights");

  return res.status(200).json({
    success: true,
    message: "Complaint created successfully",
    complaint,
  });
});

const assignComplaintForResolution = catchErrors(async (req, res) => {
  const { id } = req.params;
  const { employee } = req.body;

  if (!id || !employee) throw new Error("All fields are required");

  const updatedComplaint = await Complaint.findByIdAndUpdate(
    id,
    { assignComplaint: employee },
    { new: true }
  ).populate("assignComplaint", "name email");

  if (!updatedComplaint) throw new Error("Complaint not found");

  res.status(200).json({
    success: true,
    message: "Complaint successfully assigned for resolution.",
    complaint: updatedComplaint,
  });
});

const respondComplaint = catchErrors(async (req, res) => {
  const { id } = req.params;
  const { remarks, status } = req.body;

  if (!status || !id) throw new Error("All fields are required");

  const complaint = await Complaint.findById(id).populate(
    "employee",
    "name email"
  );

  if (!complaint) throw new Error("Complaint not found");

  if (complaint.status === "Resolved")
    throw new Error("Complaint already resolved");

  complaint.status = status;

  if (remarks) complaint.remarks = remarks;

  await complaint.save();

  await createUpdate({
    employee: complaint.employee._id,
    status: complaint.status,
    type: `Complaint - ${complaint.complainType}`,
    remarks: remarks || "--",
  });

  // Send notification using new service
  const employeeData = await Employee.findById(complaint.employee._id);
  if (employeeData) {
    // Fire-and-forget notification/email
    sendFullNotification({
      employee: employeeData,
      title: `Complaint ${status}`,
      message: `Your complaint regarding ${
        complaint.complainType
      } has been ${status.toLowerCase()}. ${remarks || ""}`,
      type: "complaint",
      priority: status === "Resolved" ? "low" : "medium",
      link: "/complaints",
      emailSubject: `Complaint ${status}`,
      emailTemplate: "complaintUpdate",
      emailData: {
        complaintType: complaint.complainType,
        subject: complaint.complainSubject,
        status: status,
        remarks: remarks,
      },
    }).catch((e) =>
      console.warn(
        "Non-fatal: complaint update notification failed:",
        e && e.message ? e.message : e
      )
    );
  }

  myCache.del("insights");

  return res.status(200).json({
    success: true,
    message: `Complaint ${status.toLowerCase()} successfully`,
    complaint,
  });
});

const updateComplaint = catchErrors(async (req, res) => {
  const { id } = req.params;
  const {
    employee,
    againstEmployee,
    complainType,
    complainSubject,
    complaintDetails,
    status,
    assignComplaint,
    remarks,
  } = req.body;

  if (!id) throw new Error("Complaint ID is required");

  const complaint = await Complaint.findById(id);

  if (!complaint) throw new Error("Complaint not found");

  if (employee) complaint.employee = employee;
  if (againstEmployee) complaint.againstEmployee = againstEmployee;
  if (complainType) complaint.complainType = complainType;
  if (complainSubject) complaint.complainSubject = complainSubject;
  if (complaintDetails) complaint.complaintDetails = complaintDetails;
  if (status) complaint.status = status;
  if (assignComplaint) complaint.assignComplaint = assignComplaint;
  if (remarks) complaint.remarks = remarks;
  if (req.file)
    complaint.documentUrl = buildPublicUrl(
      req,
      `/uploads/documents/${req.file.filename}`
    );

  await complaint.save();

  // If complaint details changed, enqueue re-analysis job
  if (complaintDetails) {
    try {
      await enqueueAnalysisJob("complaint", complaint._id);
    } catch (e) {
      console.warn(
        "Failed to enqueue complaint re-analysis job:",
        e && e.message ? e.message : e
      );
    }
  }

  myCache.del("insights");

  return res.status(200).json({
    success: true,
    message: "Complaint updated successfully",
    complaint,
  });
});

const deleteComplaintById = catchErrors(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new Error("Complaint ID is required");

  // Ensure the requester owns the complaint (employees may only delete their own complaints)
  const complaint = await Complaint.findById(id);
  if (!complaint) throw new Error("Complaint not found");

  const requesterId = req.user && req.user.id;
  if (!requesterId) throw new Error("Unauthorized");

  // If complaint owner doesn't match requester, forbid the delete
  if (String(complaint.employee) !== String(requesterId)) {
    throw new Error("You are not authorized to delete this complaint");
  }

  await Complaint.findByIdAndDelete(id);

  myCache.del("insights");

  return res.status(200).json({
    success: true,
    message: "Complaint deleted successfully",
  });
});

const deleteComplaint = async (employee) => {
  if (!employee) throw new Error("Please provide employee Id");

  const complaint = await Complaint.deleteOne({ employee });

  if (complaint.deletedCount) return;

  return "Complaint deleted successfuly";
};

export {
  getComplaints,
  deleteComplaint,
  createComplaint,
  respondComplaint,
  assignComplaintForResolution,
  updateComplaint,
  deleteComplaintById,
};
