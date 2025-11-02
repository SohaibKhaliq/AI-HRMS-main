import { catchErrors } from "../utils/index.js";
import JobCategory from "../models/jobCategory.model.js";
import JobType from "../models/jobType.model.js";
import JobLocation from "../models/jobLocation.model.js";

const list = (Model) =>
  catchErrors(async (req, res) => {
    const items = await Model.find({}).sort({ name: 1 });
    res.status(200).json({ success: true, items });
  });

const create = (Model) =>
  catchErrors(async (req, res) => {
    const { name, description, status = "Active" } = req.body;
    if (!name) throw new Error("Name is required");
    const exists = await Model.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
    if (exists) throw new Error("Name already exists");
    const item = await Model.create({ name, description, status });
    res.status(201).json({ success: true, message: "Created successfully", item });
  });

const update = (Model) =>
  catchErrors(async (req, res) => {
    const { id } = req.params;
    const { name, description, status } = req.body;
    const item = await Model.findByIdAndUpdate(
      id,
      { 
        ...(name && { name }), 
        ...(description !== undefined && { description }), 
        ...(status && { status }) 
      },
      { new: true }
    );
    if (!item) throw new Error("Record not found");
    res.status(200).json({ success: true, message: "Updated successfully", item });
  });

const remove = (Model) =>
  catchErrors(async (req, res) => {
    const { id } = req.params;
    const item = await Model.findByIdAndDelete(id);
    if (!item) throw new Error("Record not found");
    res.status(200).json({ success: true, message: "Deleted successfully" });
  });

// Export concrete handlers
export const categories = {
  list: list(JobCategory),
  create: create(JobCategory),
  update: update(JobCategory),
  remove: remove(JobCategory),
};

export const types = {
  list: list(JobType),
  create: create(JobType),
  update: update(JobType),
  remove: remove(JobType),
};

export const locations = {
  list: list(JobLocation),
  create: create(JobLocation),
  update: update(JobLocation),
  remove: remove(JobLocation),
};
