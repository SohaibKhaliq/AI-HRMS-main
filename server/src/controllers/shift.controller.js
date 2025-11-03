import { catchErrors, myCache } from "../utils/index.js";
import Shift from "../models/shift.model.js";

const createShift = catchErrors(async (req, res) => {
  const { name, startTime, endTime, breakDuration, workingDays, description, graceTime } = req.body;

  if (!name || !startTime || !endTime) {
    throw new Error("Name, start time, and end time are required");
  }

  const shift = await Shift.create({
    name,
    startTime,
    endTime,
    breakDuration: breakDuration || 60,
    workingDays: workingDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    description: description || "",
    graceTime: graceTime || 15,
  });

  myCache.del("shifts");

  return res.status(201).json({
    success: true,
    message: "Shift created successfully",
    shift,
  });
});

const getAllShifts = catchErrors(async (req, res) => {
  const cacheKey = "shifts";
  const cached = myCache.get(cacheKey);
  if (cached) {
    return res.status(200).json({
      success: true,
      message: "Shifts fetched (cache)",
      shifts: cached,
    });
  }

  const shifts = await Shift.find().sort({ createdAt: -1 }).lean();
  myCache.set(cacheKey, shifts);

  return res.status(200).json({
    success: true,
    message: "Shifts fetched successfully",
    shifts,
  });
});

const getShiftById = catchErrors(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new Error("Shift ID is required");

  const shift = await Shift.findById(id);
  if (!shift) throw new Error("Shift not found");

  return res.status(200).json({
    success: true,
    message: "Shift fetched successfully",
    shift,
  });
});

const updateShift = catchErrors(async (req, res) => {
  const { id } = req.params;
  const { name, startTime, endTime, breakDuration, workingDays, description, graceTime, isActive } = req.body;

  if (!id) throw new Error("Shift ID is required");

  const updateData = {};
  if (name) updateData.name = name;
  if (startTime) updateData.startTime = startTime;
  if (endTime) updateData.endTime = endTime;
  if (breakDuration !== undefined) updateData.breakDuration = breakDuration;
  if (workingDays) updateData.workingDays = workingDays;
  if (description !== undefined) updateData.description = description;
  if (graceTime !== undefined) updateData.graceTime = graceTime;
  if (isActive !== undefined) updateData.isActive = isActive;

  const shift = await Shift.findByIdAndUpdate(id, updateData, { new: true });
  if (!shift) throw new Error("Shift not found");

  myCache.del("shifts");

  return res.status(200).json({
    success: true,
    message: "Shift updated successfully",
    shift,
  });
});

const deleteShift = catchErrors(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new Error("Shift ID is required");

  const shift = await Shift.findByIdAndDelete(id);
  if (!shift) throw new Error("Shift not found");

  myCache.del("shifts");

  return res.status(200).json({
    success: true,
    message: "Shift deleted successfully",
  });
});

export { createShift, getAllShifts, getShiftById, updateShift, deleteShift };
