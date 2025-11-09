import dotenv from "dotenv";
dotenv.config();

import { connectDB, disConnectDB } from "../src/config/index.js";
import EmployeeDocument from "../src/models/employeeDocument.model.js";
import Employee from "../src/models/employee.model.js";
import Recruitment from "../src/models/recruitment.model.js";

const PUBLIC_BASE_RAW = process.env.SERVER_URL || process.env.CLIENT_URL || "";
const PUBLIC_BASE = PUBLIC_BASE_RAW.replace(/\/$/, ""); // remove trailing slash

function normalizeUrl(url) {
  if (!url) return url;
  // if already absolute and has same origin, normalize trailing slash
  try {
    const u = new URL(url, PUBLIC_BASE || "http://localhost");
    return u.href;
  } catch (e) {
    // fallback: just return as-is
    return url;
  }
}

function rewriteFileUrl(original) {
  if (!original) return original;

  // If it's already prefixed with the correct PUBLIC_BASE, leave it
  if (PUBLIC_BASE && original.startsWith(PUBLIC_BASE)) return original;

  // If it starts with /uploads/, prefix with PUBLIC_BASE
  if (original.startsWith("/uploads/")) {
    return `${PUBLIC_BASE}${original}`;
  }

  // If it's an absolute URL pointing to some other host but contains /uploads/, swap origin
  try {
    const u = new URL(original);
    if (u.pathname && u.pathname.includes("/uploads/")) {
      if (PUBLIC_BASE) {
        // build new URL using PUBLIC_BASE origin and same pathname+search+hash
        const pb = new URL(PUBLIC_BASE);
        return `${pb.origin}${u.pathname}${u.search}${u.hash}`;
      }
    }
  } catch (e) {
    // not an absolute URL, fallthrough
  }

  // Otherwise return original (no-op)
  return original;
}

(async () => {
  console.log("Starting fix_document_urls migration...");
  if (!PUBLIC_BASE) {
    console.warn(
      "Warning: SERVER_URL and CLIENT_URL are not set in environment. The script will still try to prefix '/uploads/*' paths with an empty base which may produce relative URLs. Set SERVER_URL in .env for best results."
    );
  } else {
    console.log("Using PUBLIC_BASE:", PUBLIC_BASE);
  }

  await connectDB();

  try {
    const docs = await EmployeeDocument.find().lean();
    console.log(`Found ${docs.length} EmployeeDocument records`);

    let updated = 0;

    for (const d of docs) {
      const updates = {};

      const newFileUrl = rewriteFileUrl(d.fileUrl);
      if (newFileUrl && newFileUrl !== d.fileUrl) updates.fileUrl = newFileUrl;

      if (d.thumbnailUrl) {
        const newThumb = rewriteFileUrl(d.thumbnailUrl);
        if (newThumb && newThumb !== d.thumbnailUrl)
          updates.thumbnailUrl = newThumb;
      }

      if (Object.keys(updates).length > 0) {
        await EmployeeDocument.updateOne({ _id: d._id }, { $set: updates });
        updated += 1;
        console.log(`Updated doc ${d._id}:`, updates);
      }
    }

    console.log(`Migration complete. Documents updated: ${updated}`);
  } catch (err) {
    console.error("Migration failed:", err && err.message ? err.message : err);
  } finally {
    // Continue to other collections before disconnecting
  }
  // --- Employees: update profilePicture fields ---
  try {
    const employees = await Employee.find().lean();
    console.log(`Found ${employees.length} Employee records`);
    let empUpdated = 0;
    for (const e of employees) {
      if (!e.profilePicture) continue;
      const newPic = rewriteFileUrl(e.profilePicture);
      if (newPic && newPic !== e.profilePicture) {
        await Employee.updateOne(
          { _id: e._id },
          { $set: { profilePicture: newPic } }
        );
        empUpdated += 1;
        console.log(`Updated employee ${e._id} profilePicture -> ${newPic}`);
      }
    }
    console.log(`Employee profile pictures updated: ${empUpdated}`);
  } catch (err) {
    console.error(
      "Employee update failed:",
      err && err.message ? err.message : err
    );
  }

  // --- Recruitment applicants: update resume fields ---
  try {
    const jobs = await Recruitment.find().lean();
    console.log(`Found ${jobs.length} recruitment Job records`);
    let resumesUpdated = 0;
    for (const job of jobs) {
      if (!job.applicants || !Array.isArray(job.applicants)) continue;
      const bulkOps = [];
      const updatedApplicants = [];
      for (let i = 0; i < job.applicants.length; i++) {
        const a = job.applicants[i];
        if (!a || !a.resume) continue;
        const newResume = rewriteFileUrl(a.resume);
        if (newResume && newResume !== a.resume) {
          // Prepare a positional update for this applicant index
          const setPath = {};
          setPath[`applicants.${i}.resume`] = newResume;
          bulkOps.push({
            updateOne: { filter: { _id: job._id }, update: { $set: setPath } },
          });
          updatedApplicants.push({ index: i, newResume });
        }
      }
      if (bulkOps.length > 0) {
        // Apply updates (one by one to avoid complex bulk issues)
        for (const op of bulkOps) {
          await Recruitment.updateOne(op.updateOne.filter, op.updateOne.update);
        }
        resumesUpdated += bulkOps.length;
        console.log(`Updated job ${job._id} applicants:`, updatedApplicants);
      }
    }
    console.log(`Recruitment resumes updated: ${resumesUpdated}`);
  } catch (err) {
    console.error(
      "Recruitment update failed:",
      err && err.message ? err.message : err
    );
  } finally {
    await disConnectDB();
    console.log("Disconnected from DB. Exiting.");
    process.exit(0);
  }
})();
