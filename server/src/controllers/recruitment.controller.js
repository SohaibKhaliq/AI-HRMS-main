import { catchErrors, sendMail } from "../utils/index.js";
import Recruitment from "../models/recruitment.model.js";
import JobType from "../models/jobType.model.js";
import {
  inviteForInterviewMail,
  thankYouForApplying,
} from "../templates/index.js";

const createJob = catchErrors(async (req, res) => {
  const postedBy = req.user.id;
  const {
    title,
    department,
    role,
    location,
    type,
    description,
    requirements,
    deadline,
    minSalary,
    maxSalary,
  } = req.body;

  if (!title || !description || !type)
    throw new Error("Please provide all required fields");

  // Normalize type: accept either JobType _id or name string
  let typeRef = null;
  if (type) {
    // If it looks like an ObjectId, try to use it directly
    if (typeof type === "string" && /^[0-9a-fA-F]{24}$/.test(type)) {
      const exists = await JobType.findById(type);
      if (exists) typeRef = exists._id;
    }
    // If still not found, try to find by name (case-insensitive)
    if (!typeRef && typeof type === "string") {
      const byName = await JobType.findOne({
        name: { $regex: `^${type}$`, $options: "i" },
      });
      if (byName) typeRef = byName._id;
    }
  }

  const job = await Recruitment.create({
    title,
    department,
    role,
    location,
    type: typeRef || type,
    description,
    requirements,
    deadline,
    postedBy,
    minSalary,
    maxSalary,
  });

  return res.status(201).json({
    success: true,
    message: "Job created successfully",
    job,
  });
});

const getAllJobs = catchErrors(async (req, res) => {
  const { status, deadline } = req.query;

  const query = {};
  if (status) query.status = { $regex: status, $options: "i" };
  if (deadline) {
    const deadlineDate = new Date(deadline);
    query.deadline = { $gte: deadlineDate };
  }

  const jobs = await Recruitment.find(query)
    .populate([
      { path: "department", select: "name" },
      { path: "role", select: "name" },
      { path: "type", select: "name" },
    ])
    .sort({ postedAt: -1 });

  return res.status(200).json({
    success: true,
    jobs,
  });
});

const getJobApplications = catchErrors(async (req, res) => {
  const { id } = req.params;
  const { status } = req.query;

  const job = await Recruitment.findById(id).populate([
    { path: "department", select: "name" },
    { path: "role", select: "name" },
  ]);

  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Job not found",
    });
  }

  let applicants = job.applicants;

  if (status) {
    applicants = applicants.filter(
      (applicant) => applicant.status?.toLowerCase() === status.toLowerCase()
    );
  }

  applicants.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

  return res.status(200).json({
    success: true,
    message: "Applicants fetch successfully",
    applicants,
  });
});

const getJobById = catchErrors(async (req, res) => {
  const { id } = req.params;

  const job = await Recruitment.findById(id).populate([
    { path: "department", select: "name" },
    { path: "role", select: "name" },
    { path: "type", select: "name" },
  ]);

  if (!job) throw new Error("Job not found");

  return res.status(200).json({
    success: true,
    job,
  });
});

const updateJobStatus = catchErrors(async (req, res) => {
  const { status, deadline } = req.body;
  if (!status) throw new Error("Status is required");

  const job = await Recruitment.findByIdAndUpdate(
    req.params.id,
    { status, deadline },
    { new: true }
  );

  if (!job) throw new Error("Job not found");

  return res.status(200).json({
    success: true,
    message: "Job status updated",
    job,
  });
});

const createApplicant = catchErrors(async (req, res) => {
  const { name, email, phone, coverLetter } = req.body;

  if (!name || !email || !phone || !req.file)
    throw new Error("Please provide all application field");

  const job = await Recruitment.findById(req.params.id);
  if (!job) throw new Error("Job not found");

  // Enforce only active/open jobs can receive applications
  if (job.status && job.status.toLowerCase() !== "open") {
    throw new Error("This job is not open for applications");
  }

  // Optional: ensure the job poster (employee) is active
  if (job.postedBy) {
    try {
      const { default: Employee } = await import("../models/employee.model.js");
      const poster = await Employee.findById(job.postedBy).select(
        "status name"
      );
      if (poster && poster.status && poster.status.toLowerCase() !== "active") {
        throw new Error(
          "Applications are only accepted for jobs posted by active employees"
        );
      }
    } catch (e) {
      // If employee model lookup fails, fail-safe: allow, but log
      console.error(
        "Warning: could not verify job poster active status:",
        e?.message || e
      );
    }
  }

  if (job.deadline && job.deadline < Date.now())
    throw new Error("Job expired, deadline reached");

  // Handle local storage path for resume URL (multer.diskStorage writes to server/public/uploads/resumes)
  const resumePath = req.file.path || `/uploads/resumes/${req.file.filename}`;

  job.applicants.push({
    name,
    email,
    phone,
    resume: resumePath,
    coverLetter,
  });
  await job.save();

  const createdApplication = job.applicants[job.applicants.length - 1];

  // Send acknowledgement email but don't fail the request if email fails
  try {
    await thankYouForApplying({
      email,
      candidateName: name,
      jobTitle: job.title,
    });
  } catch (mailErr) {
    console.error("Failed to send application acknowledgement:", mailErr);
  }

  return res.status(201).json({
    success: true,
    message: "Application sent successfully",
    application: createdApplication,
  });
});

const updateApplicationStatus = catchErrors(async (req, res) => {
  const { jobId, applicantId } = req.params;
  const { status } = req.body;

  if (!status) throw new Error("Status is required");

  const job = await Recruitment.findById(jobId);
  if (!job) throw new Error("Job not found");

  const applicant = job.applicants.id(applicantId);
  if (!applicant) throw new Error("Applicant not found");

  applicant.status = status;
  applicant.updatedAt = new Date();

  await job.save();

  // Send email notification for status change using standardized service
  if (status === "Rejected" || status === "Selected") {
    try {
      const statusColor = status === "Selected" ? "#10B981" : "#EF4444";
      const statusMessage =
        status === "Selected"
          ? "Congratulations! Our HR team will contact you soon with the next steps."
          : "We appreciate your interest in joining our team. We encourage you to apply for future opportunities.";

      await sendMail({
        email: applicant.email,
        subject: `Metro HRMS - Application ${status}`,
        html: `
          <div style="font-family: 'Poppins', system-ui; max-width: 600px; width: 100%; margin: 40px auto; background: #2c2c2c; padding: 32px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3); text-align: center;">
            <img src="http://metrohrms.netlify.app/metro.png" alt="Metro HRMS Logo" style="width: 120px; margin-bottom: 24px;">
            <div style="font-size: 16px; font-weight: 600; color: #ffffff; margin-bottom: 8px;">Metro HRMS</div>
            <h2 style="color: ${statusColor}; font-weight: 500; font-size: 22px; margin-bottom: 16px;">Application ${status}</h2>
            <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">Dear <strong style="color: #007bff;">${
              applicant.name
            }</strong>,</p>
            <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">
              Your application for <strong>${
                job.title
              }</strong> has been ${status.toLowerCase()}.
            </p>
            <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">
              ${statusMessage}
            </p>
            <div style="width: 100%; height: 1px; background: #444444; margin: 24px 0;"></div>
            <p style="margin-top: 24px; font-size: 12px; color: #999999;">Metro HRMS &copy; ${new Date().getFullYear()}. All Rights Reserved.</p>
          </div>
        `,
      });
    } catch (err) {
      console.error("Failed to send application status email:", err);
    }
  }

  return res.status(200).json({
    success: true,
    message: "Applicant status updated successfully",
    applicant,
  });
});

const inviteForInterview = catchErrors(async (req, res) => {
  const { jobId, applicantId } = req.params;
  const { interviewDate, interviewTime } = req.body;

  const job = await Recruitment.findById(jobId);
  if (!job) throw new Error("Job not found");

  const applicant = job.applicants.id(applicantId);
  if (!applicant) throw new Error("Applicant not found");

  await inviteForInterviewMail({
    email: applicant.email,
    candidateName: applicant.name,
    jobTitle: job.title,
    interviewDate,
    interviewTime,
  });

  applicant.status = "Interview";
  applicant.updatedAt = new Date();

  await job.save();

  return res.status(200).json({
    success: true,
    message: "Interview invited successfully",
    applicant,
  });
});

export {
  createJob,
  getAllJobs,
  getJobById,
  updateJobStatus,
  createApplicant,
  getJobApplications,
  inviteForInterview,
  updateApplicationStatus,
};
