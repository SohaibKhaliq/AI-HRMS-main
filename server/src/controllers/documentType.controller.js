import { catchErrors, myCache } from "../utils/index.js";
import DocumentType from "../models/documentType.model.js";

const createDocumentType = catchErrors(async (req, res) => {
  const { name, description, required, status, createdAt } = req.body;
  if (!name) throw new Error("Please provide a name for document type");

  // Check for duplicate document type name
  const existingDocumentType = await DocumentType.findOne({ name });
  if (existingDocumentType) {
    const error = new Error(
      `Document type name '${name}' is already in use. Please use a different name.`
    );
    error.statusCode = 409;
    throw error;
  }

  const data = {
    name,
    description,
    required: !!required,
    status: status || "Active",
  };
  if (createdAt) data.createdAt = new Date(createdAt);

  const doc = await DocumentType.create(data);
  // clear any cached documentTypes (including status-specific caches)
  myCache.keys().forEach((k) => {
    if (typeof k === "string" && k.startsWith("documentTypes")) myCache.del(k);
  });

  return res.status(201).json({
    success: true,
    message: "Document type created",
    documentType: doc,
  });
});

const getAllDocumentTypes = catchErrors(async (req, res) => {
  // allow optional filtering by status via query, e.g. ?status=active
  const { status } = req.query || {};
  const normalizedStatus = status
    ? String(status).trim().toLowerCase() === "active"
      ? "Active"
      : String(status).trim().toLowerCase() === "inactive"
      ? "Inactive"
      : null
    : null;

  const cacheKey = `documentTypes${
    normalizedStatus ? `-status:${normalizedStatus}` : ""
  }`;
  const cached = myCache.get(cacheKey);
  if (cached)
    return res.status(200).json({
      success: true,
      message: "Fetched (cache)",
      documentTypes: cached,
    });

  const query = {};
  if (normalizedStatus) query.status = normalizedStatus;

  const docTypes = await DocumentType.find(query).lean();
  myCache.set(cacheKey, docTypes);
  return res.status(200).json({
    success: true,
    message: "Document types fetched",
    documentTypes: docTypes,
  });
});

const getDocumentTypeById = catchErrors(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new Error("Please provide id");
  const doc = await DocumentType.findById(id);
  return res
    .status(200)
    .json({ success: true, message: "Fetched", documentType: doc });
});

const updateDocumentType = catchErrors(async (req, res) => {
  const { id } = req.params;
  const { name, description, required, status, createdAt } = req.body;
  if (!id) throw new Error("Please provide id");

  // Check for duplicate document type name (excluding current document type)
  if (name) {
    const existingDocumentType = await DocumentType.findOne({
      name,
      _id: { $ne: id },
    });
    if (existingDocumentType) {
      const error = new Error(
        `Document type name '${name}' is already in use. Please use a different name.`
      );
      error.statusCode = 409;
      throw error;
    }
  }

  const update = { name, description, required: !!required, status };
  if (createdAt) update.createdAt = new Date(createdAt);
  const doc = await DocumentType.findByIdAndUpdate(id, update, { new: true });
  // clear any cached documentTypes (including status-specific caches)
  myCache.keys().forEach((k) => {
    if (typeof k === "string" && k.startsWith("documentTypes")) myCache.del(k);
  });
  return res
    .status(200)
    .json({ success: true, message: "Updated", documentType: doc });
});

const deleteDocumentType = catchErrors(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new Error("Please provide id");
  await DocumentType.findByIdAndDelete(id);
  // clear any cached documentTypes (including status-specific caches)
  myCache.keys().forEach((k) => {
    if (typeof k === "string" && k.startsWith("documentTypes")) myCache.del(k);
  });
  return res.status(200).json({ success: true, message: "Deleted" });
});

export {
  createDocumentType,
  getAllDocumentTypes,
  getDocumentTypeById,
  updateDocumentType,
  deleteDocumentType,
};
