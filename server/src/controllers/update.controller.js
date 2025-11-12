import Leave from "../models/leave.model.js";
import { catchErrors } from "../utils/index.js";
import Complaint from "../models/complaint.model.js";
import Update from "../models/update.model.js";
import Announcement from "../models/announcement.model.js";

const createUpdate = async ({ employee, type, status, remarks }) => {
  await Update.create({ employee, type, status, remarks });
};

const getUpdates = catchErrors(async (req, res) => {
  const employee = req.user.id;

  // Employee-specific updates
  const updates = await Update.find({ employee })
    .populate({
      path: "employee",
      select: "name employeeId department role",
      populate: [
        {
          path: "department",
          select: "name",
        },
        {
          path: "role",
          select: "name",
        },
      ],
    })
    .sort({ createdAt: -1 })
    .lean();

  // Also include active announcements (global notices) so the Updates page shows company announcements
  const now = new Date();
  const announcements = await Announcement.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  })
    .populate({
      path: "createdBy",
      select: "name employeeId designation",
      populate: {
        path: "designation",
        select: "name",
      },
    })
    .sort({ createdAt: -1 })
    .lean();

  // Map announcements into the same shape as updates so the frontend can render them together
  const mappedAnnouncements = announcements.map((a) => ({
    _id: a._id,
    employee: a.createdBy || null,
    type: "announcement",
    status: a.priority || "Medium",
    remarks: a.description,
    createdAt: a.createdAt,
    announcement: a,
  }));

  // Merge and sort by createdAt descending
  const merged = [...updates, ...mappedAnnouncements].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return res.status(200).json({
    success: true,
    message: "Updates fetched successfully",
    updates: merged,
  });
});

const getDate = catchErrors(async (req, res) => {
  const datetime = new Date().toISOString();

  return res.status(200).json({
    success: true,
    message: "Date fetched successfully",
    datetime,
  });
});

export { getUpdates, createUpdate, getDate };
