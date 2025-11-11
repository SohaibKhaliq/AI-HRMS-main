import { catchErrors, myCache } from "../utils/index.js";
import EmployeeDocument from "../models/employeeDocument.model.js";
import Employee from "../models/employee.model.js";
import { sendFullNotification } from "../services/notification.service.js";
import fs from "fs";
import path from "path";
import * as Jimp from "jimp";
// jimp may be published as CommonJS; support both default and namespace imports
const JimpLib = Jimp && (Jimp.default || Jimp);
import { fileURLToPath } from "url";

// Resolve public base URL at request time. Prefer SERVER_URL, then CLIENT_URL,
// otherwise derive from the incoming request host so links point to the backend origin.
const getPublicBase = (req) =>
  process.env.SERVER_URL ||
  process.env.CLIENT_URL ||
  `${req.protocol}://${req.get("host")}`;

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

  const uploadedBy = req.user.id;

  // category is optional for employee upload; require employee and title
  if (!employee || !title) {
    throw new Error("Employee and title are required");
  }

  if (!req.file) {
    throw new Error("Document file is required");
  }

  // Prevent duplicate submissions: if the same employee has already uploaded
  // a document for this documentType that is pending or verified, block it.
  if (documentType) {
    const existing = await EmployeeDocument.findOne({
      employee,
      documentType,
      status: { $in: ["pending", "verified"] },
    });
    if (existing) {
      throw new Error("You have already submitted this document type.");
    }
  } else {
    // If no documentType provided, check for same title to avoid duplicates
    const existingByTitle = await EmployeeDocument.findOne({
      employee,
      title,
      status: { $in: ["pending", "verified"] },
    });
    if (existingByTitle) {
      throw new Error("You have already submitted a document with this title.");
    }
  }

  const document = await EmployeeDocument.create({
    employee,
    category,
    documentType: documentType || null,
    title,
    description: description || "",
    // Store public URL so client can fetch over HTTP. Prefer the server URL so
    // assets are requested from the backend that actually serves the files.
    fileUrl: `${getPublicBase(req).replace(/\/$/, "")}/uploads/documents/${
      req.file.filename
    }`,
    fileName: req.file.originalname,
    fileSize: req.file.size,
    fileType: req.file.mimetype,
    uploadedBy,
    // if issueDate/expiryDate not provided, set issueDate to now and expiryDate to null
    issueDate: issueDate ? new Date(issueDate) : new Date(),
    expiryDate: expiryDate ? new Date(expiryDate) : null,
    tags: tags ? JSON.parse(tags) : [],
  });
  // Attempt to generate a thumbnail (non-blocking but best-effort)
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const uploadsDir = path.join(
      __dirname,
      "..",
      "public",
      "uploads",
      "documents"
    );
    const thumbsDir = path.join(
      __dirname,
      "..",
      "public",
      "uploads",
      "thumbnails"
    );
    if (!fs.existsSync(thumbsDir)) fs.mkdirSync(thumbsDir, { recursive: true });

    const srcPath = path.join(uploadsDir, req.file.filename);
    const thumbName = `${path.parse(req.file.filename).name}_thumb.png`;
    const thumbPath = path.join(thumbsDir, thumbName);

    if (req.file.mimetype && req.file.mimetype.startsWith("image/")) {
      const img = await JimpLib.read(srcPath);
      await img.resize(800, JimpLib.AUTO).quality(80).writeAsync(thumbPath);
    } else {
      // For PDFs or unsupported types, create a simple placeholder thumbnail
      const img = new JimpLib(800, 1100, 0xffffffff);
      const font = await JimpLib.loadFont(JimpLib.FONT_SANS_32_BLACK);
      img.print(font, 20, 20, {
        text: "PDF",
      });
      await img.quality(80).writeAsync(thumbPath);
    }

    // Persist thumbnail URL to the document record
    await EmployeeDocument.findByIdAndUpdate(document._id, {
      thumbnailUrl: `${getPublicBase(req).replace(
        /\/$/,
        ""
      )}/uploads/thumbnails/${thumbName}`,
    });
  } catch (thumbErr) {
    console.warn(
      "Thumbnail generation failed:",
      thumbErr && thumbErr.message ? thumbErr.message : thumbErr
    );
  }

  const populated = await EmployeeDocument.findById(document._id)
    .populate("employee", "name email")
    .populate("category", "name")
    .populate("documentType", "name")
    .populate("uploadedBy", "name");

  // Send notification to employee (fire-and-forget)
  const emp = await Employee.findById(employee);
  if (emp) {
    sendFullNotification({
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
    }).catch((e) =>
      console.warn(
        "Non-fatal: document upload notification failed:",
        e && e.message ? e.message : e
      )
    );
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

  const cacheKey = `employeeDocuments-${employeeId}-${category || "all"}-${
    status || "all"
  }`;
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
  const employeeId = req.user.id;
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

  if (updateData.issueDate)
    updateData.issueDate = new Date(updateData.issueDate);
  if (updateData.expiryDate)
    updateData.expiryDate = new Date(updateData.expiryDate);
  if (updateData.tags && typeof updateData.tags === "string") {
    updateData.tags = JSON.parse(updateData.tags);
  }

  // If file is being updated
  if (req.file) {
    updateData.fileUrl = `${getPublicBase(req).replace(
      /\/$/,
      ""
    )}/uploads/documents/${req.file.filename}`;
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

  // If a new file was uploaded, attempt to regenerate thumbnail
  if (req.file) {
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const uploadsDir = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        "documents"
      );
      const thumbsDir = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        "thumbnails"
      );
      if (!fs.existsSync(thumbsDir))
        fs.mkdirSync(thumbsDir, { recursive: true });

      const srcPath = path.join(uploadsDir, req.file.filename);
      const thumbName = `${path.parse(req.file.filename).name}_thumb.png`;
      const thumbPath = path.join(thumbsDir, thumbName);

      if (req.file.mimetype && req.file.mimetype.startsWith("image/")) {
        const img = await JimpLib.read(srcPath);
        await img.resize(800, JimpLib.AUTO).quality(80).writeAsync(thumbPath);
      } else {
        const img = new JimpLib(800, 1100, 0xffffffff);
        const font = await JimpLib.loadFont(JimpLib.FONT_SANS_32_BLACK);
        img.print(font, 20, 20, { text: "PDF" });
        await img.quality(80).writeAsync(thumbPath);
      }

      await EmployeeDocument.findByIdAndUpdate(document._id, {
        thumbnailUrl: `${getPublicBase(req).replace(
          /\/$/,
          ""
        )}/uploads/thumbnails/${thumbName}`,
      });
    } catch (thumbErr) {
      console.warn(
        "Thumbnail regeneration failed:",
        thumbErr && thumbErr.message ? thumbErr.message : thumbErr
      );
    }

    // refetch populated record after thumbnail update
    const updatedPopulated = await EmployeeDocument.findById(document._id)
      .populate("employee", "name email")
      .populate("category", "name")
      .populate("documentType", "name")
      .populate("uploadedBy", "name");

    myCache.del(`employeeDocuments-${document.employee._id}`);

    return res.status(200).json({
      success: true,
      message: "Document updated successfully",
      document: updatedPopulated,
    });
  }

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
  const verifiedBy = req.user.id;

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

  // Send notification to employee (fire-and-forget)
  const emp = await Employee.findById(document.employee._id);
  if (emp) {
    const message =
      status === "verified"
        ? `Your document "${document.title}" has been verified.`
        : `Your document "${document.title}" was rejected. Reason: ${
            rejectionReason || "Not specified"
          }`;

    sendFullNotification({
      employee: emp,
      title: `Document ${status === "verified" ? "Verified" : "Rejected"}`,
      message,
      type: "document",
      priority: status === "verified" ? "medium" : "high",
      link: "/documents",
      metadata: { documentId: document._id },
    }).catch((e) =>
      console.warn(
        "Non-fatal: document verification notification failed:",
        e && e.message ? e.message : e
      )
    );
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

  const document = await EmployeeDocument.findById(id);
  if (!document) throw new Error("Document not found");

  // Allow deletion if requester is admin or owner
  const requesterId = req.user?.id;
  const requester = await Employee.findById(requesterId);
  const isAdmin = requester?.admin;

  if (!isAdmin && document.employee.toString() !== requesterId) {
    throw new Error("Unauthorized access");
  }

  await EmployeeDocument.findByIdAndDelete(id);

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

const getAllDocuments = catchErrors(async (req, res) => {
  // Admin-facing: list all documents with filters, search and pagination
  const {
    employee,
    category,
    status,
    search,
    page = 1,
    limit = 10,
  } = req.query;

  const query = {};
  if (employee) query.employee = employee;
  if (category) query.category = category;
  if (status) query.status = status;

  if (search) {
    const s = String(search).trim();
    query.$or = [
      { title: { $regex: s, $options: "i" } },
      { fileName: { $regex: s, $options: "i" } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const perPage = Math.max(1, parseInt(limit, 10) || 10);

  const total = await EmployeeDocument.countDocuments(query);
  const totalPages = Math.ceil(total / perPage) || 1;

  const documents = await EmployeeDocument.find(query)
    .populate("employee", "name email")
    .populate("category", "name")
    .populate("documentType", "name")
    .populate("uploadedBy", "name")
    .populate("verifiedBy", "name")
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * perPage)
    .limit(perPage)
    .lean();

  return res.status(200).json({
    success: true,
    message: "Documents fetched successfully",
    documents,
    total,
    totalPages,
    currentPage: pageNum,
  });
});

// export added function
export { getAllDocuments };
