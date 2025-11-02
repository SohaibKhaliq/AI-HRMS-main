import { catchErrors, myCache } from "../utils/index.js";
import DocumentCategory from "../models/documentCategory.model.js";

const createDocumentCategory = catchErrors(async (req, res) => {
  const { name, description, requiresExpiry, isMandatory, allowedFormats, maxSizeMB } = req.body;

  if (!name) throw new Error("Category name is required");

  const category = await DocumentCategory.create({
    name,
    description: description || "",
    requiresExpiry: requiresExpiry || false,
    isMandatory: isMandatory || false,
    allowedFormats: allowedFormats || [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"],
    maxSizeMB: maxSizeMB || 5,
  });

  myCache.del("documentCategories");

  return res.status(201).json({
    success: true,
    message: "Document category created successfully",
    category,
  });
});

const getAllDocumentCategories = catchErrors(async (req, res) => {
  const cacheKey = "documentCategories";
  const cached = myCache.get(cacheKey);
  if (cached) {
    return res.status(200).json({
      success: true,
      message: "Document categories fetched (cache)",
      categories: cached,
    });
  }

  const categories = await DocumentCategory.find({ isActive: true })
    .sort({ name: 1 })
    .lean();
  myCache.set(cacheKey, categories);

  return res.status(200).json({
    success: true,
    message: "Document categories fetched successfully",
    categories,
  });
});

const updateDocumentCategory = catchErrors(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!id) throw new Error("Category ID is required");

  const category = await DocumentCategory.findByIdAndUpdate(id, updateData, { new: true });
  if (!category) throw new Error("Document category not found");

  myCache.del("documentCategories");

  return res.status(200).json({
    success: true,
    message: "Document category updated successfully",
    category,
  });
});

const deleteDocumentCategory = catchErrors(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new Error("Category ID is required");

  const category = await DocumentCategory.findByIdAndDelete(id);
  if (!category) throw new Error("Document category not found");

  myCache.del("documentCategories");

  return res.status(200).json({
    success: true,
    message: "Document category deleted successfully",
  });
});

export {
  createDocumentCategory,
  getAllDocumentCategories,
  updateDocumentCategory,
  deleteDocumentCategory,
};
