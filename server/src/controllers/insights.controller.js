import { myCache } from "../utils/index.js";
import Leave from "../models/leave.model.js";
import { catchErrors } from "../utils/index.js";
import Employee from "../models/employee.model.js";
import Feedback from "../models/feedback.model.js";
import Complaint from "../models/complaint.model.js";
import {
  getEmployeeAttendanceByMonth,
  getMonthlyAttendancePercentage,
  getDepartmentAttendancePercentage,
} from "./attendance.controller.js";
import Recruitment from "../models/recruitment.model.js";
import Performance from "../models/performance.model.js";

const getAdminInsights = catchErrors(async (req, res) => {
  const cacheKey = "insights";

  const cachedInsights = myCache.get(cacheKey);
  if (cachedInsights) {
    return res.status(200).json({
      success: true,
      message: "Insights fetched successfully (from cache)",
      insights: cachedInsights,
    });
  }

  const today = new Date();

  // Group all parallel queries together
  const [
    totalEmployees,
    { pendingComplaints: totalComplaints, allComplaints: totalAllComplaints },
    departmentAttandancePercent,
    overallAttendancePercentage,
    totalMaleEmployees,
    pendingLeaves,
    employeesOnLeave,
    feedbackResult,
    totalLeaves,
    { rejectedLeaves, approvedLeaves },
    { resolvedComplaints, closedComplaints },
    jobApplications,
  ] = await Promise.all([
    // Basic counts
    Employee.countDocuments(),

    // Complaints counts
    (async () => {
      const [pendingComplaints, allComplaints] = await Promise.all([
        Complaint.countDocuments({ status: "Pending" }),
        Complaint.countDocuments(),
      ]);
      return { pendingComplaints, allComplaints };
    })(),

    // Attendance percentages
    getDepartmentAttendancePercentage(),
    getMonthlyAttendancePercentage(),

    // Employee demographics
    Employee.countDocuments({ gender: "Male" }),

    // Leave status counts
    Leave.countDocuments({ status: "Pending" }),
    Leave.countDocuments({
      status: "Approved",
      $or: [
        { fromDate: { $lte: today }, toDate: { $gte: today } },
        { fromDate: { $lte: today }, toDate: null },
      ],
    }),

    // Feedback aggregation
    Feedback.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
        },
      },
    ]),

    // Total leaves
    Leave.countDocuments(),

    // Leave status counts
    (async () => {
      const [rejected, approved] = await Promise.all([
        Leave.countDocuments({ status: { $regex: "rejected", $options: "i" } }),
        Leave.countDocuments({ status: { $regex: "approved", $options: "i" } }),
      ]);
      return { rejectedLeaves: rejected, approvedLeaves: approved };
    })(),

    // Complaint resolutions
    (async () => {
      const [resolved, closed] = await Promise.all([
        Complaint.countDocuments({
          status: { $regex: "resolved", $options: "i" },
        }),
        Complaint.countDocuments({
          status: { $regex: "closed", $options: "i" },
        }),
      ]);
      return { resolvedComplaints: resolved, closedComplaints: closed };
    })(),

    // Job Applications
    (async () => {
      const result = await Recruitment.aggregate([
        { $unwind: "$applicants" },
        { $match: { "applicants.status": "Applied" } },
        { $count: "totalApplied" },
      ]);

      if (result.length === 0) {
        return 0;
      }

      return result[0].totalApplied;
    })(),
  ]);

  // Calculate rates
  const leaveRejectionRate =
    totalLeaves > 0 ? (rejectedLeaves / totalLeaves) * 100 : 0;
  const leaveApprovalRate =
    totalLeaves > 0 ? (approvedLeaves / totalLeaves) * 100 : 0;
  const complaintResolutionRate =
    totalAllComplaints > 0
      ? (resolvedComplaints / totalAllComplaints) * 100
      : 0;
  const complaintCloseRate =
    totalAllComplaints > 0 ? (closedComplaints / totalAllComplaints) * 100 : 0;

  const totalFemaleEmployees = totalEmployees - totalMaleEmployees;

  const insights = {
    pendingLeaves,
    totalEmployees,
    feedbackResult,
    jobApplications,
    totalComplaints,
    employeesOnLeave,
    totalMaleEmployees,
    leaveRejectionRate,
    leaveApprovalRate,
    complaintCloseRate,
    totalFemaleEmployees,
    complaintResolutionRate,
    overallAttendancePercentage,
    departmentAttandancePercent,
  };

  // Sentiment and topic aggregations (Feedback + Complaint)
  try {
    const [fbSentimentAgg, compSentimentAgg, fbTopicsAgg, compTopicsAgg] =
      await Promise.all([
        // sentiment counts and avg per label for Feedback
        Feedback.aggregate([
          { $match: { sentimentLabel: { $exists: true } } },
          {
            $group: {
              _id: "$sentimentLabel",
              count: { $sum: 1 },
              avgScore: { $avg: "$sentimentScore" },
            },
          },
        ]),
        // sentiment counts and avg per label for Complaints
        Complaint.aggregate([
          { $match: { sentimentLabel: { $exists: true } } },
          {
            $group: {
              _id: "$sentimentLabel",
              count: { $sum: 1 },
              avgScore: { $avg: "$sentimentScore" },
            },
          },
        ]),
        // topics for Feedback
        Feedback.aggregate([
          { $unwind: "$topics" },
          { $group: { _id: "$topics", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
        // topics for Complaint
        Complaint.aggregate([
          { $unwind: "$topics" },
          { $group: { _id: "$topics", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
      ]);

    // Merge sentiment counts and compute weighted avg
    const sentimentCounts = {};
    let totalSentimentCount = 0;
    let totalSentimentScoreSum = 0;

    const mergeAgg = (arr) => {
      for (const r of arr) {
        if (!r || !r._id) continue;
        sentimentCounts[r._id] = (sentimentCounts[r._id] || 0) + (r.count || 0);
        totalSentimentCount += r.count || 0;
        totalSentimentScoreSum += (r.avgScore || 0) * (r.count || 0);
      }
    };

    mergeAgg(fbSentimentAgg || []);
    mergeAgg(compSentimentAgg || []);

    const overallAvgSentiment =
      totalSentimentCount > 0
        ? totalSentimentScoreSum / totalSentimentCount
        : 0;

    // Merge topics
    const topicMap = new Map();
    for (const t of fbTopicsAgg || []) {
      topicMap.set(t._id, (topicMap.get(t._id) || 0) + (t.count || 0));
    }
    for (const t of compTopicsAgg || []) {
      topicMap.set(t._id, (topicMap.get(t._id) || 0) + (t.count || 0));
    }

    const topTopics = Array.from(topicMap.entries())
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    insights.sentiment = {
      counts: sentimentCounts,
      avgScore: overallAvgSentiment,
      totalAnalyzed: totalSentimentCount,
      topTopics,
    };
  } catch (err) {
    // Non-fatal: if aggregation fails, continue without sentiment fields
    console.warn("Sentiment/topic aggregation failed:", err && err.message);
  }

  // myCache.set(cacheKey, insights);
  myCache.set(cacheKey, JSON.parse(JSON.stringify(insights)));

  return res.status(200).json({
    success: true,
    message: "Insights fetched successfully",
    insights,
  });
});

const getEmployeeInsights = catchErrors(async (req, res) => {
  const employee = req.user.id;

  if (!employee) throw new Error("Employee ID is required");

  const [
    performanceRecord,
    employeeData,
    leavesTaken,
    complaintResolved,
    feedbackSubmitted,
    attendancePercentageByMonth,
  ] = await Promise.all([
    Performance.findOne({ employee }).select("kpiScore kpis"),
    Employee.findById(employee).select("leaveBalance"),
    Complaint.find({ employee, status: "Approved" }).countDocuments(),
    Complaint.find({ employee, status: "Resolved" }).countDocuments(),
    Feedback.find({ employee }).countDocuments(),
    getEmployeeAttendanceByMonth(employee, new Date().getFullYear()),
  ]);

  const insights = {
    leaveBalance: employeeData?.leaveBalance || 0,
    leavesTaken,
    complaintResolved,
    feedbackSubmitted,
    attendanceRecord: attendancePercentageByMonth,
    kpiScore: performanceRecord?.kpiScore.toFixed(2) || 0,
    attendancePercentage: performanceRecord?.kpis.attendance || [],
  };

  return res.status(200).json({
    success: true,
    message: "Insights fetched successfully",
    insights,
  });
});

export { getAdminInsights, getEmployeeInsights };
