import { catchErrors } from "../utils/index.js";
import Recruitment from "../models/recruitment.model.js";
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

  const job = await Recruitment.create({
    title,
    department,
    role,
    location,
    type,
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

  const job = await Recruitment.findById(id);

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

  if (job.deadline < Date.now())
    throw new Error("Job expired, deadline reached");

  job.applicants.push({
    name,
    email,
    phone,
    resume: req.file.path,
    coverLetter,
  });
  await job.save();

  await thankYouForApplying({
    email,
    candidateName: name,
    jobTitle: job.title,
  });

  return res.status(201).json({
    success: true,
    message: "Application sent successfully",
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

  // Send email notification for status change
  if (status === "Rejected" || status === "Selected") {
    const { sendMail } = await import("../utils/index.js");
    await sendMail({
      email: applicant.email,
      subject: `Metro HRMS - Application ${status}`,
      html: `
        <div style="font-family: 'Poppins', system-ui; max-width: 480px; width: 100%; margin: 40px auto; background: #2c2c2c; padding: 32px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3); text-align: center;">
          <img src="http://metrohrms.netlify.app/metro.png" alt="Metro HRMS Logo" style="width: 120px; margin-bottom: 24px;">
          <h2 style="color: #ffffff; font-weight: 500; font-size: 22px; margin-bottom: 16px;">Application Update</h2>
          <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">Dear <strong style="color: #007bff;">${applicant.name}</strong>,</p>
          <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">
            Your application for <strong>${job.title}</strong> has been ${status.toLowerCase()}.
          </p>
          ${status === "Selected" ? `<p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">Congratulations! Our HR team will contact you soon with the next steps.</p>` : ''}
          <div style="width: 100%; height: 1px; background: #444444; margin: 24px 0;"></div>
          <p style="margin-top: 24px; font-size: 12px; color: #999999;">Metro HRMS &copy; ${new Date().getFullYear()}. All Rights Reserved.</p>
        </div>
      `,
    });
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
