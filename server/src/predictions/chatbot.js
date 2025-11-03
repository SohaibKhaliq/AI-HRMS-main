import Leave from "../models/leave.model.js";
import Payroll from "../models/payroll.model.js";
import Feedback from "../models/feedback.model.js";
import Employee from "../models/employee.model.js";
import Complaint from "../models/complaint.model.js";
import Attendance from "../models/attendance.model.js";
import Performance from "../models/performance.model.js";
import Recruitment from "../models/recruitment.model.js";
import Department from "../models/department.model.js";
import Designation from "../models/designation.model.js";
import LeaveType from "../models/leaveType.model.js";
import getPredictionFromGeminiAI from "../gemini/index.js";

// === CONFIG ===
const MAX_RECORDS_PER_SECTION = 15;
const RECENT_DAYS = 30;
const PROMPT_MAX_TOKENS = 28000; // Stay safe under Gemini limits
const CACHE_TTL = 60 * 1000; // 1 min cache for stats

// === IN-MEMORY CACHE (for stats) ===
const statsCache = {
  data: null,
  timestamp: 0,
};

// === UTILITIES ===
const formatCurrency = (amount) => `PKR ${Number(amount || 0).toLocaleString()}`;
const truncate = (str, len) => (str?.length > len ? str.slice(0, len) + "..." : str || "N/A");
const formatDate = (date) => new Date(date).toLocaleDateString("en-GB");

// === SMART DATA FETCHER ===
async function fetchRelevantData(prompt) {
  const keywords = prompt.toLowerCase();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - RECENT_DAYS));

  // Core models to always load (lightweight)
  const [employees, departments, designations, leaveTypes] = await Promise.all([
    Employee.find().populate("department role designation", "name").lean(),
    Department.find().lean(),
    Designation.find().populate("department", "name").lean(),
    LeaveType.find().lean(),
  ]);

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === "Active").length;

  // Conditional loading based on keywords
  const promises = [];

  if (keywords.includes("leave") || keywords.includes("pending") || keywords.includes("balance")) {
    promises.push(Leave.find().populate("employee leaveType", "name").lean());
  } else {
    promises.push(Leave.find({ status: "Pending" }).populate("employee leaveType", "name").lean());
  }

  if (keywords.includes("complaint") || keywords.includes("issue") || keywords.includes("grievance")) {
    promises.push(Complaint.find().populate("employee againstEmployee", "name employeeId").lean());
  } else {
    promises.push(Complaint.find({ status: "Pending" }).lean());
  }

  if (keywords.includes("payroll") || keywords.includes("salary") || keywords.includes("payment")) {
    promises.push(Payroll.find().populate("employee", "name employeeId").sort({ year: -1, month: -1 }).limit(20).lean());
  } else {
    promises.push(Payroll.find({ isPaid: false }).populate("employee", "name employeeId").lean());
  }

  if (keywords.includes("attendance") || keywords.includes("check-in") || keywords.includes("absent")) {
    promises.push(Attendance.find({ date: { $gte: thirtyDaysAgo } }).populate("employee", "name").sort({ date: -1 }).limit(50).lean());
  } else {
    promises.push(Attendance.find({ date: { $gte: thirtyDaysAgo }, status: { $ne: "Present" } }).populate("employee", "name").lean());
  }

  if (keywords.includes("performance") || keywords.includes("kpi") || keywords.includes("review")) {
    promises.push(Performance.find().populate("employee", "name").sort({ createdAt: -1 }).limit(20).lean());
  } else {
    promises.push(Performance.find({ rating: { $lt: 3 } }).populate("employee", "name").lean());
  }

  if (keywords.includes("feedback") || keywords.includes("sentiment") || keywords.includes("review")) {
    promises.push(Feedback.find().populate("employee", "name").sort({ createdAt: -1 }).limit(15).lean());
  } else {
    promises.push(Feedback.find({ rating: { $lt: 3 } }).lean());
  }

  if (keywords.includes("recruit") || keywords.includes("job") || keywords.includes("hiring")) {
    promises.push(Recruitment.find().populate("department role postedBy", "name").lean());
  } else {
    promises.push(Recruitment.find({ status: "Active" }).lean());
  }

  const [
    leaves,
    complaints,
    payrolls,
    attendances,
    performances,
    feedbacks,
    jobs,
  ] = await Promise.all(promises);

  return {
    employees,
    departments,
    designations,
    leaveTypes,
    leaves,
    complaints,
    payrolls,
    attendances,
    performances,
    feedbacks,
    jobs,
    stats: {
      totalEmployees,
      activeEmployees,
      totalDepartments: departments.length,
      totalDesignations: designations.length,
      pendingLeaves: leaves.filter(l => l.status === "Pending").length,
      pendingComplaints: complaints.filter(c => c.status === "Pending").length,
      avgSalary: totalEmployees > 0
        ? Math.round(employees.reduce((s, e) => s + (e.salary || 0), 0) / totalEmployees)
        : 0,
      recentAttendance: attendances.length,
      activeJobs: jobs.filter(j => j.status === "Active").length,
    },
  };
}

// === BUILD DYNAMIC PROMPT ===
function buildPrompt(prompt, data) {
  const { stats } = data;

  // === SYSTEM CONTEXT (Always included) ===
  let context = `
## HRMS AI Assistant – Metro Cash & Carry
**Built with MERN + Gemini AI** by **Obaid Ali & Sohaib Khaliq**

### Core Modules
- Employee | Attendance | Leave | Performance | Feedback | Complaints
- Recruitment | Payroll | Department | Designation | Analytics

---

### Live HR Stats
| Metric | Value |
|--------|-------|
| Total Employees | **${stats.totalEmployees}** (Active: ${stats.activeEmployees}) |
| Departments | **${stats.totalDepartments}** |
| Designations | **${stats.totalDesignations}** |
| Avg Salary | **${formatCurrency(stats.avgSalary)}** |
| Pending Leaves | **${stats.pendingLeaves}** |
| Pending Complaints | **${stats.pendingComplaints}** |
| Attendance (30d) | **${stats.recentAttendance}** records |
| Active Jobs | **${stats.activeJobs}** |

---

### Query: "${prompt}"
`.trim();

  // === DYNAMIC DATA INJECTION ===
  const sections = [];

  // 1. Employees
  if (prompt.match(/employee|staff|team|headcount|salary/i)) {
    sections.push(`
#### Employees
${data.employees.slice(0, MAX_RECORDS_PER_SECTION).map((e, i) => `
${i + 1}. **${e.name}** (\`${e.employeeId}\`)  
   → ${e.department?.name || "N/A"} | ${e.designation?.name || "N/A"}  
   → ${formatCurrency(e.salary)} | ${e.status} ${e.admin ? "**(Admin)**" : ""}
`.trim()).join("\n")}
${data.employees.length > MAX_RECORDS_PER_SECTION ? `\n... and ${data.employees.length - MAX_RECORDS_PER_SECTION} more` : ""}
    `);
  }

  // 2. Leaves
  if (prompt.match(/leave|vacation|balance|pending|approved/i)) {
    sections.push(`
#### Leave Requests
${data.leaves.slice(0, MAX_RECORDS_PER_SECTION).map((l, i) => `
${i + 1}. **${l.employee?.name}** → **${l.leaveType?.name}**  
   → ${l.duration} day(s) | ${formatDate(l.fromDate)} to ${formatDate(l.toDate)}  
   → **${l.status}** | Substitute: *${l.substitute?.name || "Auto-Assigned"}*
`.trim()).join("\n")}

**Leave Types**: ${data.leaveTypes.map(t => `${t.name} (${t.daysAllowed}d)`).join(", ")}
    `);
  }

  // 3. Complaints
  if (prompt.match(/complaint|issue|grievance|harassment|misconduct/i)) {
    sections.push(`
#### Complaints
${data.complaints.slice(0, 10).map((c, i) => `
${i + 1}. **${c.employee?.name}** vs **${c.againstEmployee?.name || "General"}**  
   → *${c.complainType}*: ${truncate(c.complainSubject, 50)}  
   → **${c.status}** | ${formatDate(c.createdAt)}
`.trim()).join("\n")}
${data.complaints.length > 10 ? `\n... ${data.complaints.length - 10} more` : ""}
    `);
  }

  // 4. Payroll
  if (prompt.match(/payroll|salary|payment|deduction|slip/i)) {
    sections.push(`
#### Payroll (Recent/Unpaid)
${data.payrolls.map((p, i) => `
${i + 1}. **${p.employee?.name}** (\`${p.employee?.employeeId}\`)  
   → ${p.month}/${p.year} | Base: ${formatCurrency(p.baseSalary)}  
   → Net: **${formatCurrency(p.netSalary)}** | Paid: ${p.isPaid ? "Yes" : "**No**"}
`.trim()).join("\n")}
    `);
  }

  // 5. Attendance
  if (prompt.match(/attendance|check.?in|absent|late|present/i)) {
    const absentees = data.attendances.filter(a => a.status !== "Present");
    sections.push(`
#### Attendance (Last ${RECENT_DAYS} Days)
**Total Records**: ${data.attendances.length}  
**Absentees/Late**: ${absentees.length > 0 ? absentees.length : "None"}

${data.attendances.slice(0, 10).map((a, i) => `
${i + 1}. **${a.employee?.name}** | ${formatDate(a.date)}  
   → In: \`${a.checkIn || "—"}\` | Out: \`${a.checkOut || "—"}\` | **${a.status}**
`.trim()).join("\n")}
    `);
  }

  // 6. Performance
  if (prompt.match(/performance|kpi|review|score|rating/i)) {
    const lowPerformers = data.performances.filter(p => p.rating < 3);
    sections.push(`
#### Performance Reviews
**Low Performers**: ${lowPerformers.length > 0 ? lowPerformers.length : "None"}

${data.performances.slice(0, 8).map((p, i) => `
${i + 1}. **${p.employee?.name}** → KPI: **${p.kpiScore?.toFixed(1)}** | Rating: **${p.rating}/5**  
   → "${truncate(p.feedback, 60)}"
`.trim()).join("\n")}
    `);
  }

  // 7. Feedback
  if (prompt.match(/feedback|sentiment|suggestion|review/i)) {
    sections.push(`
#### Employee Feedback
${data.feedbacks.slice(0, 8).map((f, i) => `
${i + 1}. **${f.rating}/5** – ${f.employee?.name || "Anonymous"}  
   → Review: "${truncate(f.review, 60)}"  
   → Suggestion: "${truncate(f.suggestion, 60)}"
`.trim()).join("\n")}
    `);
  }

  // 8. Recruitment
  if (prompt.match(/job|hiring|recruit|applicant|posting/i)) {
    sections.push(`
#### Job Openings
${data.jobs.map((j, i) => `
${i + 1}. **${j.title}** @ ${j.department?.name}  
   → ${formatCurrency(j.minSalary)} – ${formatCurrency(j.maxSalary)} | ${j.type}  
   → Applicants: **${j.applicants?.length || 0}** | Deadline: ${j.deadline ? formatDate(j.deadline) : "Open"}  
   ${j.applicants?.length > 0 ? `→ Top: ${j.applicants[0].name} (${j.applicants[0].status})` : ""}
`.trim()).join("\n")}
    `);
  }

  // === FINAL PROMPT ===
  const finalPrompt = `
${context}

${sections.join("\n---\n")}

---

### AI Instructions
- Answer **only** the user's query using the data above.
- Use **bullet points**, **bold**, and *italics* for clarity.
- Include **stats**, **trends**, and **recommendations**.
- Highlight **critical issues** (e.g., unpaid salaries, pending complaints).
- Be **professional, concise, and actionable**.
- If irrelevant: "This is outside HRMS scope. Ask about employees, leave, payroll, etc."

### Generate a **stellar**, **data-rich**, **insightful** response:
`.trim();

  // Truncate if too long
  if (finalPrompt.length > PROMPT_MAX_TOKENS) {
    return finalPrompt.slice(0, PROMPT_MAX_TOKENS) + "\n\n[Prompt truncated for performance]";
  }

  return finalPrompt;
}

// === MAIN FUNCTION ===
async function getAnswerFromChatbot(prompt) {
  try {
    // Greeting / Farewell shortcuts
    const lower = prompt.toLowerCase().trim();
    if (lower.includes("hi") || lower.includes("hello")) {
      return "Hello! How may I assist you with the HRMS today?";
    }
    if (lower.includes("bye") || lower.includes("goodbye") || lower.includes("thank")) {
      return "Have a great day! Feel free to ask anytime.";
    }

    // Irrelevant query
    const hrKeywords = ["employee", "leave", "attendance", "payroll", "complaint", "performance", "job", "salary", "department", "feedback", "kpi", "recruit"];
    if (!hrKeywords.some(k => lower.includes(k))) {
      return "This seems unrelated to the HRMS. Try asking about employees, leave, payroll, attendance, or recruitment.";
    }

    // Fetch smart data
    const data = await fetchRelevantData(prompt);

    // Build AI prompt
    const aiPrompt = buildPrompt(prompt, data);

    // Call Gemini
    const response = await getPredictionFromGeminiAI(aiPrompt);

    // Final fallback
    return response?.trim() || "No response generated. Please try again.";

  } catch (error) {
    console.error("Chatbot Error:", error);
    return "Sorry, the HRMS AI is temporarily unavailable. Please try again later.";
  }
}

export default getAnswerFromChatbot;