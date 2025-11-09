import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Employee from "../src/models/employee.model.js";
import Recruitment from "../src/models/recruitment.model.js";
import EmployeeDocument from "../src/models/employeeDocument.model.js";
import Promotion from "../src/models/promotion.model.js";
import Resignation from "../src/models/resignation.model.js";
import Termination from "../src/models/termination.model.js";
import Announcement from "../src/models/announcement.model.js";
import Complaint from "../src/models/complaint.model.js";

const connect = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  });
};

const normalizeToPublic = (value) => {
  if (!value || typeof value !== "string") return null;
  const v = value.trim();
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  // if already a public relative path like /uploads/... convert to full URL
  if (v.startsWith("/uploads/")) return `${process.env.CLIENT_URL}${v}`;

  // search for uploads segment
  let idx = v.indexOf("/uploads/");
  if (idx === -1) idx = v.indexOf("\\uploads\\");
  if (idx === -1) idx = v.indexOf("uploads");
  if (idx === -1) return null;

  let tail = v.slice(idx);
  // normalize backslashes to forward slashes
  tail = tail.replace(/\\/g, "/");
  if (!tail.startsWith("/")) tail = "/" + tail;

  return `${process.env.CLIENT_URL}${tail}`;
};

const run = async () => {
  try {
    console.log("Connecting to DB...");
    await connect();
    console.log("Connected");

    const updates = [];

    // Employees: profilePicture
    const employees = await Employee.find({});
    let empCount = 0;
    for (const e of employees) {
      const newUrl = normalizeToPublic(e.profilePicture);
      if (newUrl && newUrl !== e.profilePicture) {
        await Employee.updateOne(
          { _id: e._id },
          { $set: { profilePicture: newUrl } }
        );
        empCount++;
      }
    }
    updates.push({ collection: "employees", updated: empCount });

    // Recruitment applicants: applicants[].resume
    const jobs = await Recruitment.find({});
    let appCount = 0;
    for (const j of jobs) {
      let modified = false;
      const applicants = (j.applicants || []).map((a) => {
        const newResume = normalizeToPublic(a.resume);
        if (newResume && newResume !== a.resume) {
          modified = true;
          appCount++;
          return { ...a.toObject(), resume: newResume };
        }
        return a;
      });
      if (modified) {
        j.applicants = applicants;
        await j.save();
      }
    }
    updates.push({ collection: "recruitment.applicants", updated: appCount });

    // Employee Documents
    const docs = await EmployeeDocument.find({});
    let docCount = 0;
    for (const d of docs) {
      const newUrl = normalizeToPublic(d.fileUrl);
      if (newUrl && newUrl !== d.fileUrl) {
        await EmployeeDocument.updateOne(
          { _id: d._id },
          { $set: { fileUrl: newUrl } }
        );
        docCount++;
      }
    }
    updates.push({ collection: "employeeDocuments", updated: docCount });

    // Promotions
    const promotions = await Promotion.find({});
    let promoCount = 0;
    for (const p of promotions) {
      const newUrl = normalizeToPublic(p.documentUrl);
      if (newUrl && newUrl !== p.documentUrl) {
        await Promotion.updateOne(
          { _id: p._id },
          { $set: { documentUrl: newUrl } }
        );
        promoCount++;
      }
    }
    updates.push({ collection: "promotions", updated: promoCount });

    // Resignations
    const resigns = await Resignation.find({});
    let resCount = 0;
    for (const r of resigns) {
      const newUrl = normalizeToPublic(r.documentUrl);
      if (newUrl && newUrl !== r.documentUrl) {
        await Resignation.updateOne(
          { _id: r._id },
          { $set: { documentUrl: newUrl } }
        );
        resCount++;
      }
    }
    updates.push({ collection: "resignations", updated: resCount });

    // Terminations
    const terms = await Termination.find({});
    let termCount = 0;
    for (const t of terms) {
      const newUrl = normalizeToPublic(t.documentUrl);
      if (newUrl && newUrl !== t.documentUrl) {
        await Termination.updateOne(
          { _id: t._id },
          { $set: { documentUrl: newUrl } }
        );
        termCount++;
      }
    }
    updates.push({ collection: "terminations", updated: termCount });

    // Announcements
    const anns = await Announcement.find({});
    let annCount = 0;
    for (const a of anns) {
      const newUrl = normalizeToPublic(a.attachmentUrl);
      if (newUrl && newUrl !== a.attachmentUrl) {
        await Announcement.updateOne(
          { _id: a._id },
          { $set: { attachmentUrl: newUrl } }
        );
        annCount++;
      }
    }
    updates.push({ collection: "announcements", updated: annCount });

    // Complaints
    const complaints = await Complaint.find({});
    let compCount = 0;
    for (const c of complaints) {
      const newUrl = normalizeToPublic(c.documentUrl);
      if (newUrl && newUrl !== c.documentUrl) {
        await Complaint.updateOne(
          { _id: c._id },
          { $set: { documentUrl: newUrl } }
        );
        compCount++;
      }
    }
    updates.push({ collection: "complaints", updated: compCount });

    console.log("Migration summary:");
    updates.forEach((u) =>
      console.log(`${u.collection}: ${u.updated} updated`)
    );

    console.log("Done");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

run();
