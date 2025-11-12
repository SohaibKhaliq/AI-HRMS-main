#!/usr/bin/env node
/*
  Script: show_performance_appointments.js
  Purpose: Find announcements related to performance reviews and ensure they are active and visible
           to employees by creating Update documents (so the employee 'Updates' page shows them).

  Usage:
    Set MONGO_URI in environment or in a .env file in the server folder, then run:
      node server/scripts/show_performance_appointments.js

  Notes: This script is idempotent — it will not create duplicate Update entries if one already exists
         that references the announcement title within recent time.
*/

import mongoose from "mongoose";
import dotenv from "dotenv";
import Announcement from "../src/models/announcement.model.js";
import Employee from "../src/models/employee.model.js";
import Update from "../src/models/update.model.js";

dotenv.config({ path: "./server/.env" });

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL;

if (!MONGO_URI) {
  console.error(
    "MONGO_URI not set. Please set it in environment or server/.env"
  );
  process.exit(1);
}

async function main() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected.");

  const now = new Date();

  // Find announcements that look like performance review notices
const announcements = await Announcement.find({}).lean();

  if (!announcements || announcements.length === 0) {
    console.log("No performance-related announcements found.");
    await mongoose.connection.close();
    return;
  }

  console.log(
    `Found ${announcements.length} performance-related announcement(s)`
  );

  let totalUpdatesCreated = 0;

  // Fetch all employees
  const employees = await Employee.find({}).select("_id").lean();
  if (!employees || employees.length === 0) {
    console.log("No employees found in DB. Aborting.");
    await mongoose.connection.close();
    return;
  }

  for (const ann of announcements) {
    console.log(`\nAnnouncement: ${ann.title} (id: ${ann._id})`);
    console.log(
      `  isActive: ${ann.isActive}, start: ${ann.startDate}, end: ${ann.endDate}`
    );

    // If announcement is not active or not within current date range, update it
    let updated = false;
    const startDate = ann.startDate ? new Date(ann.startDate) : null;
    const endDate = ann.endDate ? new Date(ann.endDate) : null;
    if (
      !ann.isActive ||
      !startDate ||
      !endDate ||
      startDate > now ||
      endDate < now
    ) {
      const newStart = new Date(Date.now() - 24 * 60 * 60 * 1000); // yesterday
      const newEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // +30 days
      await Announcement.findByIdAndUpdate(ann._id, {
        isActive: true,
        startDate: newStart,
        endDate: newEnd,
      });
      console.log(
        "  -> Announcement dates/isActive updated to make it visible to employees."
      );
      updated = true;
    }

    // For each employee, create an Update entry if not exists recently
    const titleRegex = new RegExp(
      ann.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i"
    );
    let createdForThisAnnouncement = 0;

    for (const emp of employees) {
      const exists = await Update.findOne({
        employee: emp._id,
        remarks: { $regex: titleRegex },
      });

      if (exists) continue;

      const newUpdate = await Update.create({
        employee: emp._id,
        type: "announcement",
        status: ann.priority || "Medium",
        remarks: `${ann.title} - ${ann.description}`,
      });

      if (newUpdate) {
        totalUpdatesCreated++;
        createdForThisAnnouncement++;
      }
    }

    console.log(
      `  Created ${createdForThisAnnouncement} Update entries for this announcement.${
        updated ? " (announcement record updated)" : ""
      }`
    );
  }

  console.log(`\nDone. Total Update documents created: ${totalUpdatesCreated}`);
  await mongoose.connection.close();
}

main().catch((err) => {
  console.error(err);
  mongoose.connection.close();
  process.exit(1);
});
