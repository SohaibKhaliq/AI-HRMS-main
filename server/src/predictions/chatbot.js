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

async function getAnswerFromChatbot(prompt) {
  const [
    leaves,
    feedbacks,
    performances,
    employees,
    complaints,
    jobs,
    departments,
    designations,
    payrolls,
    attendances,
    leaveTypes,
  ] = await Promise.all([
    Leave.find().populate("employee leaveType", "name").lean(),
    Feedback.find().populate("employee", "name").lean(),
    Performance.find().populate("employee", "name").lean(),
    Employee.find()
      .populate("department role designation", "name")
      .lean(),
    Complaint.find()
      .populate("employee againstEmployee", "name employeeId")
      .lean(),
    Recruitment.find()
      .populate("department role postedBy", "name")
      .lean(),
    Department.find().lean(),
    Designation.find().populate("department", "name").lean(),
    Payroll.find().populate("employee", "name employeeId").lean(),
    Attendance.find().populate("employee", "name").lean(),
    LeaveType.find().lean(),
  ]);

  // Calculate statistics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === "Active").length;
  const totalDepartments = departments.length;
  const totalDesignations = designations.length;
  const pendingLeaves = leaves.filter(l => l.status === "Pending").length;
  const pendingComplaints = complaints.filter(c => c.status === "Pending").length;
  const averageSalary = employees.length > 0 
    ? (employees.reduce((sum, e) => sum + (e.salary || 0), 0) / employees.length).toFixed(0)
    : 0;
  const recentAttendance = attendances.filter(a => {
    const date = new Date(a.date);
    const today = new Date();
    const diffTime = Math.abs(today - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }).length;

  const formattedPrompt = `
    **Admin Query:** "${prompt}"
    
    ### About the HRMS  
    This HRMS is developed for **Metro Cash & Carry** using **MERN Stack** & **Gemini AI** by **Obaid Ali & Sohaib Khaliq**.  
    
    ### Key Modules:  
    1. **Employee Management** (Full CRUD with designation & salary management)
    2. **Attendance Tracking** (QR code-based with geolocation verification)
    3. **Leave Management** (AI-powered substitute assigning with balance tracking)
    4. **Performance Management** (KPI scoring & comprehensive reviews)
    5. **Feedback & Complaints** (Employee feedback collection & complaint resolution)
    6. **AI Sentiment Analysis** (Employee sentiment tracking from feedback)
    7. **Recruitment Management** (Job postings + Applicant tracking system)
    8. **Payroll Processing** (Automated salary calculations & payment tracking)
    9. **Department & Designation** (Organizational structure with salary bands)
    10. **Analytics & Reporting** (Real-time dashboards & comprehensive insights)
    
    ---
    
    ### Response Guidelines:
    - **Greeting** (Hi/Hello): Respond with "👋 Hello! How may I assist you with the HRMS today?"
    - **Farewell** (Bye/Goodbye): Respond with "Have a great day! Feel free to ask anytime. 👋"
    - **Irrelevant Query**: "🤔 This seems unrelated to the HRMS. Could you ask something about employees, attendance, leave, performance, complaints, recruitment, or payroll?"
    - Provide **data-driven insights** with **statistics and trends**
    - Use **bullet points** for clarity
    - Be **concise yet comprehensive**
    - Include **actionable recommendations** when appropriate
  
    ---
    
    ### System Overview & Statistics:
    - **Total Employees:** ${totalEmployees} (Active: ${activeEmployees})
    - **Total Departments:** ${totalDepartments}
    - **Total Designations:** ${totalDesignations}
    - **Average Salary:** PKR ${averageSalary}
    - **Pending Leaves:** ${pendingLeaves}
    - **Pending Complaints:** ${pendingComplaints}
    - **Attendance Records (Last 30 Days):** ${recentAttendance}
    - **Total Leave Types:** ${leaveTypes.length}
    - **Active Job Postings:** ${jobs.filter(j => j.status === "Active").length}
    
    ---
    
    ### HRMS Data Analysis:
    
    #### **1. Employee Data (${totalEmployees} total)**  
    ${employees
      .map(
        (emp, index) =>
          `${index + 1}. **Name:** ${emp?.name} | **ID:** ${emp?.employeeId} | **Department:** ${
            emp?.department?.name || "N/A"
          } | **Designation:** ${emp?.designation?.name || "N/A"} | **Role:** ${
            emp?.role?.name || "N/A"
          } | **Salary:** PKR ${emp?.salary?.toLocaleString() || 0} | **Status:** ${emp?.status} | **Admin:** ${emp?.admin ? "Yes" : "No"}`
      )
      .join("\n")}
    
    #### **2. Performance Data (${performances.length} reviews)**  
    ${performances
      .map(
        (per, index) =>
          `${index + 1}. **Employee:** ${per?.employee?.name || "N/A"} | **KPI Score:** ${
            per.kpiScore?.toFixed(2) || "0.00"
          } | **Rating:** ${per?.rating || "Not Rated"} | **Attendance %:** ${
            per?.kpis?.attendance?.toFixed(1) || "0.0"
          }% | **Feedback:** ${per?.feedback?.substring(0, 50) || "No feedback"}${per?.feedback?.length > 50 ? "..." : ""}`
      )
      .join("\n")}
    
    #### **3. Leave Data (${leaves.length} requests)**  
    ${leaves
      .map(
        (leave, index) =>
          `${index + 1}. **Employee:** ${leave?.employee?.name || "N/A"} | **Type:** ${
            leave?.leaveType?.name || leave?.leaveType || "N/A"
          } | **Duration:** ${leave?.duration || 1} day(s) | **From:** ${leave?.fromDate} | **To:** ${leave?.toDate} | **Status:** ${
            leave?.status
          } | **Substitute:** ${leave?.substitute?.name || "Not Assigned"}`
      )
      .join("\n")}
    
    **Available Leave Types:** ${leaveTypes.map(lt => `${lt.name} (${lt.daysAllowed} days)`).join(", ")}  
    
    #### **4. Complaint Data (${complaints.length} complaints)**  
    ${complaints
      .map(
        (com, index) =>
          `${index + 1}. **Complainant:** ${
            com?.employee?.name || "N/A"
          } (${com?.employee?.employeeId || "N/A"}) | **Against:** ${
            com?.againstEmployee?.name || "General"
          } | **Type:** ${com?.complainType} | **Subject:** ${com?.complainSubject?.substring(0, 40)}${com?.complainSubject?.length > 40 ? "..." : ""} | **Status:** ${
            com?.status
          } | **Date:** ${new Date(com?.createdAt).toLocaleDateString()}`
      )
      .join("\n")}
    
    **Complaint Types:** Workplace, Payroll, Leave, Harassment, Scheduling, Misconduct, Discrimination, Safety, Other  
    
    #### **5. Feedback Data (${feedbacks.length} feedbacks)**  
    ${feedbacks
      .map(
        (feed, index) =>
          `${index + 1}. **Employee:** ${feed?.employee?.name || "Anonymous"} | **Rating:** ${
            feed?.rating || "N/A"
          }/5 | **Review:** ${feed?.review?.substring(0, 50)}${feed?.review?.length > 50 ? "..." : ""} | **Suggestion:** ${feed?.suggestion?.substring(0, 50)}${feed?.suggestion?.length > 50 ? "..." : ""}`
      )
      .join("\n")}

    #### **6. Department Data (${totalDepartments} departments)**  
    ${departments
      .map(
        (dept, index) =>
          `${index + 1}. **Name:** ${dept?.name} | **Status:** ${dept?.status || "Active"} | **Description:** ${dept?.description?.substring(0, 60) || "No description"}${dept?.description?.length > 60 ? "..." : ""}`
      )
      .join("\n")}

    #### **7. Designation Data (${totalDesignations} designations)**  
    ${designations
      .map(
        (des, index) =>
          `${index + 1}. **Name:** ${des?.name} | **Department:** ${des?.department?.name || "N/A"} | **Salary:** PKR ${des?.salary?.toLocaleString() || 0} | **Status:** ${des?.status || "Active"}`
      )
      .join("\n")}

    #### **8. Payroll Data (${payrolls.length} records)**  
    ${payrolls.slice(0, 20)
      .map(
        (pay, index) =>
          `${index + 1}. **Employee:** ${pay?.employee?.name || "N/A"} (${pay?.employee?.employeeId || "N/A"}) | **Month:** ${pay?.month}/${pay?.year} | **Base Salary:** PKR ${pay?.baseSalary?.toLocaleString() || 0} | **Net Salary:** PKR ${pay?.netSalary?.toLocaleString() || 0} | **Paid:** ${pay?.isPaid ? "Yes" : "No"}`
      )
      .join("\n")}
    ${payrolls.length > 20 ? `\n... and ${payrolls.length - 20} more payroll records` : ""}

    #### **9. Attendance Data (Last 30 days: ${recentAttendance} records)**  
    ${attendances.slice(0, 15)
      .map(
        (att, index) =>
          `${index + 1}. **Employee:** ${att?.employee?.name || "N/A"} | **Date:** ${new Date(att?.date).toLocaleDateString()} | **Check-In:** ${att?.checkIn || "N/A"} | **Check-Out:** ${att?.checkOut || "N/A"} | **Status:** ${att?.status || "Present"}`
      )
      .join("\n")}
    ${attendances.length > 15 ? `\n... and ${attendances.length - 15} more attendance records` : ""}

    #### **10. Recruitment Data (${jobs.length} jobs)**  
    ${jobs
      .map(
        (job, index) => `
        ${index + 1}. **Job Title:** ${job?.title} | **Department:** ${
          job?.department?.name
        } | **Role:** ${job?.role?.name} | **Location:** ${
          job?.location
        } | **Salary Range:** ${job?.minSalary} - ${
          job?.maxSalary
        } | **Type:** ${job?.type} | **Status:** ${
          job?.status
        } | **Posted By:** ${job?.postedBy?.name} | **Deadline:** ${
          job?.deadline
        }
        
        **Applicants:**  
        ${job?.applicants
          .map(
            (app, i) =>
              `   - ${i + 1}. **Name:** ${app?.name} | **Email:** ${
                app?.email
              } | **Phone:** ${app?.phone} | **Status:** ${app?.status}`
          )
          .join("\n")}
      `
      )
      .join("\n")}
    
    ---
    
    ### Generate an insightful and concise response to the admin's query based on the provided data.
    `;

  const response = await getPredictionFromGeminiAI(formattedPrompt);

  return response || "⚠️ Failed to generate response, Try again later";
}

export default getAnswerFromChatbot;
