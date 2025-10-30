import { catchErrors, myCache } from "../utils/index.js";
import Designation from "../models/designation.model.js";

const createDesignation = catchErrors(async (req, res) => {
  const { name, description, department, status, createdAt } = req.body;

  if (!name) throw new Error("Please provide a name for the designation");

  const data = { name, description, department, status: status || "Active" };
  if (createdAt) data.createdAt = new Date(createdAt);

  const designation = await Designation.create(data);

  myCache.del("designations");

  return res.status(201).json({ success: true, message: "Designation created successfully", designation });
});

const getAllDesignations = catchErrors(async (req, res) => {
  const cacheKey = "designations";
  const cached = myCache.get(cacheKey);
  if (cached) {
    return res.status(200).json({ success: true, message: "Designations fetched (cache)", designations: cached });
  }

  const designations = await Designation.find().populate("department", "name").lean();
  myCache.set(cacheKey, designations);

  return res.status(200).json({ success: true, message: "Designations fetched successfully", designations });
});

const getDesignationById = catchErrors(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new Error("Please provide designation id");
  const designation = await Designation.findById(id).populate("department", "name");
  return res.status(200).json({ success: true, message: "Designation fetched", designation });
});

const updateDesignation = catchErrors(async (req, res) => {
  const { id } = req.params;
  const { name, description, department, status, createdAt } = req.body;
  if (!id) throw new Error("Please provide designation id");
  const updateData = { name, description, department, status };
  if (createdAt) updateData.createdAt = new Date(createdAt);
  const designation = await Designation.findByIdAndUpdate(id, updateData, { new: true }).populate("department", "name");
  myCache.del("designations");
  return res.status(200).json({ success: true, message: "Designation updated", designation });
});

const deleteDesignation = catchErrors(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new Error("Please provide designation id");
  await Designation.findByIdAndDelete(id);
  myCache.del("designations");
  return res.status(200).json({ success: true, message: "Designation deleted" });
});

export { createDesignation, getAllDesignations, getDesignationById, updateDesignation, deleteDesignation };
