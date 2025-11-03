import { catchErrors, myCache } from "../utils/index.js";
import EmployeeDocument from "../models/employeeDocument.model.js";
import Employee from "../models/employee.model.js";
import { sendFullNotification } from "../services/notification.service.js";

const uploadDocument = catchErrors(async (req, res) => {
  const {
    employee,
    category,
    documentType,
    title,
    description,
    issueDate,
    expiryDate,
    tags,
  } = req.body;

  const uploadedBy = req.employee._id;

  if (!employee || !category || !title) {
    throw new Error("Employee, category, and title are required");
  }

  if (!req.file) {
    throw new Error("Document file is required");
  }

  const document = await EmployeeDocument.create({
    employee,
    category,
    documentType: documentType || null,
    title,
    description: description || "",
    fileUrl: req.file.path, // From cloudinary/multer
    fileName: req.file.originalname,
    fileSize: req.file.size,
    fileType: req.file.mimetype,
    uploadedBy,
    issueDate: issueDate ? new Date(issueDate) : null,
    expiryDate: expiryDate ? new Date(expiryDate) : null,
    tags: tags ? JSON.parse(tags) : [],
  });

  const populated = await EmployeeDocument.findById(document._id)
    .populate("employee", "name email")
    .populate("category", "name")
    .populate("documentType", "name")
    .populate("uploadedBy", "name");

  // Send notification to employee
  const emp = await Employee.findById(employee);
  if (emp) {
    await sendFullNotification({
      employee: emp,
      title: "New Document Uploaded",
      message: `A new document "${title}" has been uploaded to your profile.`,
      type: "document",
      priority: "medium",
      link: "/documents",
      metadata: { documentId: document._id },
      emailSubject: `New Document: ${title}`,
      emailTemplate: "announcement",
      emailData: {
        title: "New Document Uploaded",
        message: `A new document "${title}" has been uploaded to your profile. Please review it at your earliest convenience.`,
      },
    });
  }

  myCache.del(`employeeDocuments-${employee}`);

  return res.status(201).json({
    success: true,
    message: "Document uploaded successfully",
    document: populated,
  });
});

const getEmployeeDocuments = catchErrors(async (req, res) => {
  const { employeeId } = req.params;
  const { category, status } = req.query;

  if (!employeeId) throw new Error("Employee ID is required");

  const query = { employee: employeeId };
  if (category) query.category = category;
  if (status) query.status = status;

  const cacheKey = `employeeDocuments-${employeeId}-${category || "all"}-${status || "all"}`;
  const cached = myCache.get(cacheKey);
  if (cached) {
    return res.status(200).json({
      success: true,
      message: "Documents fetched (cache)",
      documents: cached,
    });
  }

  const documents = await EmployeeDocument.find(query)
    .populate("category", "name")
    .populate("documentType", "name")
    .populate("uploadedBy", "name")
    .populate("verifiedBy", "name")
    .sort({ createdAt: -1 })
    .lean();

  myCache.set(cacheKey, documents);

  return res.status(200).json({
    success: true,
    message: "Documents fetched successfully",
    documents,
  });
});

const getMyDocuments = catchErrors(async (req, res) => {
  const employeeId = req.employee._id;
  const { category, status } = req.query;

  const query = { employee: employeeId };
  if (category) query.category = category;
  if (status) query.status = status;

  const documents = await EmployeeDocument.find(query)
    .populate("category", "name")
    .populate("documentType", "name")
    .populate("uploadedBy", "name")
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json({
    success: true,
    message: "Your documents fetched successfully",
    documents,
  });
});

const getDocumentById = catchErrors(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new Error("Document ID is required");

  const document = await EmployeeDocument.findById(id)
    .populate("employee", "name email employeeId")
    .populate("category", "name")
    .populate("documentType", "name")
    .populate("uploadedBy", "name")
    .populate("verifiedBy", "name");

  if (!document) throw new Error("Document not found");

  return res.status(200).json({
    success: true,
    message: "Document fetched successfully",
    document,
  });
});

const updateDocument = catchErrors(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!id) throw new Error("Document ID is required");

  if (updateData.issueDate) updateData.issueDate = new Date(updateData.issueDate);
  if (updateData.expiryDate) updateData.expiryDate = new Date(updateData.expiryDate);
  if (updateData.tags && typeof updateData.tags === "string") {
    updateData.tags = JSON.parse(updateData.tags);
  }

  // If file is being updated
  if (req.file) {
    updateData.fileUrl = req.file.path;
    updateData.fileName = req.file.originalname;
    updateData.fileSize = req.file.size;
    updateData.fileType = req.file.mimetype;
    updateData.version = (await EmployeeDocument.findById(id)).version + 1;
  }

  const document = await EmployeeDocument.findByIdAndUpdate(id, updateData, {
    new: true,
  })
    .populate("employee", "name email")
    .populate("category", "name")
    .populate("documentType", "name")
    .populate("uploadedBy", "name")
    .populate("verifiedBy", "name");

  if (!document) throw new Error("Document not found");

  myCache.del(`employeeDocuments-${document.employee._id}`);

  return res.status(200).json({
    success: true,
    message: "Document updated successfully",
    document,
  });
});

const verifyDocument = catchErrors(async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;
  const verifiedBy = req.employee._id;

  if (!id) throw new Error("Document ID is required");
  if (!status) throw new Error("Status is required");

  const updateData = {
    status,
    verifiedBy,
    verifiedAt: new Date(),
  };

  if (status === "rejected" && rejectionReason) {
    updateData.rejectionReason = rejectionReason;
  }

  const document = await EmployeeDocument.findByIdAndUpdate(id, updateData, {
    new: true,
  })
    .populate("employee", "name email")
    .populate("category", "name");

  if (!document) throw new Error("Document not found");

  // Send notification to employee
  const emp = await Employee.findById(document.employee._id);
  if (emp) {
    const message =
      status === "verified"
        ? `Your document "${document.title}" has been verified.`
        : `Your document "${document.title}" was rejected. Reason: ${rejectionReason || "Not specified"}`;

    await sendFullNotification({
      employee: emp,
      title: `Document ${status === "verified" ? "Verified" : "Rejected"}`,
      message,
      type: "document",
      priority: status === "verified" ? "medium" : "high",
      link: "/documents",
      metadata: { documentId: document._id },
    });
  }

  myCache.del(`employeeDocuments-${document.employee._id}`);

  return res.status(200).json({
    success: true,
    message: `Document ${status} successfully`,
    document,
  });
});

const deleteDocument = catchErrors(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new Error("Document ID is required");

  const document = await EmployeeDocument.findByIdAndDelete(id);
  if (!document) throw new Error("Document not found");

  myCache.del(`employeeDocuments-${document.employee}`);

  return res.status(200).json({
    success: true,
    message: "Document deleted successfully",
  });
});

const getExpiringDocuments = catchErrors(async (req, res) => {
  const { days = 30 } = req.query;

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + parseInt(days));

  const documents = await EmployeeDocument.find({
    expiryDate: { $lte: futureDate, $gte: new Date() },
    isExpired: false,
  })
    .populate("employee", "name email")
    .populate("category", "name")
    .sort({ expiryDate: 1 })
    .lean();

  return res.status(200).json({
    success: true,
    message: "Expiring documents fetched successfully",
    documents,
    count: documents.length,
  });
});

export {
  uploadDocument,
  getEmployeeDocuments,
  getMyDocuments,
  getDocumentById,
  updateDocument,
  verifyDocument,
  deleteDocument,
  getExpiringDocuments,
};
