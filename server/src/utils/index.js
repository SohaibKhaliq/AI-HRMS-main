import dotenv from "dotenv";
dotenv.config();

import QRCode from "qrcode";
import jsQR from "jsqr";
import geolib from "geolib";
import { Jimp } from "jimp";
import axios from "axios";
import NodeCache from "node-cache";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import streamifier from "streamifier";

const myCache = new NodeCache();

const workplaceLocation = {
  latitude: process.env.LATITUDE,
  longitude: process.env.LONGITUDE,
};

function getLocation(latitude, longitude) {
  const distance = geolib.getDistance(workplaceLocation, {
    latitude,
    longitude,
  });

  return distance;
}

// Save buffer to local uploads folder and return a public path
const saveBufferToUploads = async (
  buffer,
  subfolder = "qrcodes",
  ext = "png"
) => {
  try {
    const uploadsDir = path.join(
      process.cwd(),
      "server",
      "public",
      "uploads",
      subfolder
    );
    if (!fs.existsSync(uploadsDir))
      fs.mkdirSync(uploadsDir, { recursive: true });

    const filename = `${uuidv4().slice(0, 8)}.${ext}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.promises.writeFile(filePath, buffer);

    // Build a URL path relative to server static folder
    const publicUrl = `/uploads/${subfolder}/${filename}`;
    return publicUrl;
  } catch (err) {
    throw new Error(`Failed to save file: ${err.message}`);
  }
};

async function generateQrCode(employeeId) {
  if (!employeeId) {
    console.error("Id not provided for QR code generation");
    return;
  }

  const qrData = JSON.stringify({ employeeId });

  try {
    const qrCodeBuffer = await QRCode.toBuffer(qrData);
    // Save PNG locally and return public path
    const publicUrl = await saveBufferToUploads(qrCodeBuffer, "qrcodes", "png");
    return publicUrl;
  } catch (err) {
    console.error("Error generating or saving QR code:", err);
  }
}

const deleteUploadedFile = async (urlOrPath) => {
  if (!urlOrPath) return false;
  try {
    // If it's already a local uploads path like /uploads/... or contains 'uploads/', derive file path
    let idx = urlOrPath.indexOf("/uploads/");
    if (idx === -1 && urlOrPath.includes("uploads")) {
      idx = urlOrPath.indexOf("uploads");
    }
    if (idx !== -1) {
      const relative = urlOrPath.slice(idx + 1); // remove leading /
      const fullPath = path.join(
        process.cwd(),
        "server",
        "public",
        relative.replace(/\//g, path.sep)
      );
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        return true;
      }
    }
    return false;
  } catch (err) {
    console.error("Failed to delete uploaded file:", err.message);
    return false;
  }
};

const catchErrors = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      console.error("❌ Error caught:", err);
      console.error("Stack trace:", err.stack);
      next(err.message);
    });
  };
};

const sendMail = async (option) => {
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  let info = await transporter.sendMail({
    from: process.env.USER,
    to: option.email,
    subject: option.subject,
    text: option.text,
    html: option.html,
  });

  return info;
};

function getPublicIdFromUrl(url) {
  const regex = /\/(?:v\d+\/)?([^/]+)\.\w+$/;
  const match = url.match(regex);

  return match ? match[1] : null;
}

const decodeQR = async (URL) => {
  try {
    const response = await axios({
      url: URL,
      responseType: "arraybuffer",
    });

    const image = await Jimp.read(Buffer.from(response.data));

    const imageData = {
      data: new Uint8ClampedArray(image.bitmap.data),
      width: image.bitmap.width,
      height: image.bitmap.height,
    };

    const decodedQR = jsQR(imageData.data, imageData.width, imageData.height);

    if (!decodedQR) {
      throw new Error("QR code not found in the image.");
    }
    return JSON.parse(decodedQR.data).employeeId;
  } catch (error) {
    console.error("Error decoding QR code:", error);
  }
};

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear();
  return `${day} ${month}, ${year}`;
};

function formatTime(time24) {
  const [hours, minutes] = time24.split(":");

  const hoursNum = parseInt(hours, 10);
  const period = hoursNum >= 12 ? "PM" : "AM";
  const hours12 = hoursNum % 12 || 12;
  return `${hours12}:${minutes} ${period}`;
}

const getMonthName = (month) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[month - 1];
};

export {
  myCache,
  sendMail,
  decodeQR,
  formatDate,
  formatTime,
  catchErrors,
  getLocation,
  getMonthName,
  generateQrCode,
  getPublicIdFromUrl,
  saveBufferToUploads,
  deleteUploadedFile,
};
