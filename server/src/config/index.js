import fs from "fs";
import path from "path";
import multer from "multer";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";
// multer-storage-cloudinary removed: using local disk storage

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database Connection Utilities
const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB Connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const disConnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB Disconnected");
  } catch (error) {
    console.error(`MongoDB Disconnection Error: ${error.message}`);
    process.exit(1);
  }
};

// File Upload Configurations
const createImageStorage = () => {
  // Use local disk storage for images
  const uploadDir = path.join(__dirname, "../public/uploads/images");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const parsed = path.parse(file.originalname);
      const sanitized = parsed.name
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_-]/g, "");
      const filename = `${sanitized}_${uuidv4().substring(0, 8)}${parsed.ext}`;
      cb(null, filename);
    },
  });
};

const createResumeStorage = () => {
  // Use local disk storage for resumes
  const uploadDir = path.join(__dirname, "../public/uploads/resumes");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const parsedName = path.parse(file.originalname);
      const sanitizedName = parsedName.name
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_-]/g, "");
      const uniqueName = `${sanitizedName}_${uuidv4().substring(0, 8)}${
        parsedName.ext
      }`;
      cb(null, uniqueName);
    },
  });
};

const createDocumentStorage = () => {
  // Use local disk storage for documents (promotion documents etc.)
  const uploadDir = path.join(__dirname, "../public/uploads/documents");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const parsedName = path.parse(file.originalname);
      const sanitizedName = parsedName.name
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_-]/g, "");
      const filename = `${sanitizedName}_${uuidv4().substring(0, 8)}${
        parsedName.ext
      }`;
      cb(null, filename);
    },
  });
};

// Multer Initialization with Error Handling
const initializeUploader = (storage, options = {}) => {
  return multer({
    storage,
    limits: {
      fileSize: options.maxFileSize || 5242880,
      files: options.maxFiles || 1,
    },
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = options.allowedMimeTypes || [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new Error(
            `Invalid file type. Only ${
              options.allowedTypes || "specified"
            } files are allowed`
          ),
          false
        );
      }
    },
  });
};

// Configure uploaders
const imageStorage = createImageStorage();
const resumeStorage = createResumeStorage();
const documentStorage = createDocumentStorage();

const upload = initializeUploader(imageStorage, {
  allowedMimeTypes: ["image/jpeg", "image/png", "image/svg+xml"],
  maxFileSize: 2097152,
  allowedTypes: "JPG, PNG, JPEG, SVG",
});

const uploadResume = initializeUploader(resumeStorage, {
  allowedMimeTypes: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  maxFileSize: 5242880,
  allowedTypes: "PDF, DOC, DOCX",
});

const uploadDocument = initializeUploader(documentStorage, {
  allowedMimeTypes: ["application/pdf"],
  maxFileSize: 5242880,
  allowedTypes: "PDF",
});

export { connectDB, disConnectDB, upload, uploadResume, uploadDocument };
