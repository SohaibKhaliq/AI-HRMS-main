import { catchErrors, myCache } from "../utils/index.js";
import DocumentType from "../models/documentType.model.js";

const createDocumentType = catchErrors(async (req, res) => {
  const { name, description, required, status, createdAt } = req.body;
  if (!name) throw new Error("Please provide a name for document type");

  const data = { name, description, required: !!required, status: status || "Active" };
  if (createdAt) data.createdAt = new Date(createdAt);

  const doc = await DocumentType.create(data);
  myCache.del("documentTypes");

  return res.status(201).json({ success: true, message: "Document type created", documentType: doc });
});

const getAllDocumentTypes = catchErrors(async (req, res) => {
  const cacheKey = "documentTypes";
  const cached = myCache.get(cacheKey);
  if (cached) return res.status(200).json({ success: true, message: "Fetched (cache)", documentTypes: cached });

  const docTypes = await DocumentType.find().lean();
  myCache.set(cacheKey, docTypes);
  return res.status(200).json({ success: true, message: "Document types fetched", documentTypes: docTypes });
});

const getDocumentTypeById = catchErrors(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new Error("Please provide id");
  const doc = await DocumentType.findById(id);
  return res.status(200).json({ success: true, message: "Fetched", documentType: doc });
});

const updateDocumentType = catchErrors(async (req, res) => {
  const { id } = req.params;
  const { name, description, required, status, createdAt } = req.body;
  if (!id) throw new Error("Please provide id");
  const update = { name, description, required: !!required, status };
  if (createdAt) update.createdAt = new Date(createdAt);
  const doc = await DocumentType.findByIdAndUpdate(id, update, { new: true });
  myCache.del("documentTypes");
  return res.status(200).json({ success: true, message: "Updated", documentType: doc });
});

const deleteDocumentType = catchErrors(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new Error("Please provide id");
  await DocumentType.findByIdAndDelete(id);
  myCache.del("documentTypes");
  return res.status(200).json({ success: true, message: "Deleted" });
});

export { createDocumentType, getAllDocumentTypes, getDocumentTypeById, updateDocumentType, deleteDocumentType };
