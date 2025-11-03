/**
 * Email Templates Service
 * Provides HTML email templates for various notification types
 */

const baseEmailStyle = `
  font-family: 'Poppins', system-ui, -apple-system, sans-serif;
  max-width: 600px;
  margin: 40px auto;
  background: #2c2c2c;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
`;

const logoUrl = "http://metrohrms.netlify.app/metro.png";
const clientUrl = process.env.CLIENT_URL || "https://metrohrms.netlify.app";

/**
 * Base email wrapper
 */
const wrapEmail = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 20px; background: #1a1a1a;">
  <div style="${baseEmailStyle} text-align: center;">
    <img src="${logoUrl}" alt="Metro HRMS Logo" style="width: 120px; margin-bottom: 24px;">
    <div style="font-size: 16px; font-weight: 600; color: #ffffff; margin-bottom: 8px;">Metro HRMS</div>
    ${content}
    <div style="width: 100%; height: 1px; background: #444444; margin: 24px 0;"></div>
    <p style="margin-top: 24px; font-size: 12px; color: #999999;">Metro HRMS &copy; ${new Date().getFullYear()}. All Rights Reserved.</p>
  </div>
</body>
</html>
`;

/**
 * Complaint Update Template
 */
const complaintUpdateTemplate = (data) => `
  <h2 style="color: #ffffff; font-weight: 500; font-size: 22px; margin-bottom: 16px;">Complaint Status Update</h2>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">Dear <strong style="color: #007bff;">${data.employeeName}</strong>,</p>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">
    Your complaint regarding <strong>${data.complaintType}</strong> has been updated.
  </p>
  <div style="background: #333; padding: 16px; border-radius: 8px; margin: 16px 0;">
    <p style="color: #cccccc; margin: 4px 0;"><strong>Status:</strong> ${data.status}</p>
    <p style="color: #cccccc; margin: 4px 0;"><strong>Subject:</strong> ${data.subject}</p>
    ${data.remarks ? `<p style="color: #cccccc; margin: 4px 0;"><strong>Remarks:</strong> ${data.remarks}</p>` : ''}
  </div>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">
    ${data.status === "Resolved" ? "Thank you for bringing this to our attention. The matter has been resolved." : "We are working on resolving this issue. You will be notified of any updates."}
  </p>
  <a href="${clientUrl}/complaints" style="display: inline-block; padding: 12px 28px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500; margin: 24px 0;">
    View Complaint
  </a>
`;

/**
 * Employee Onboarding Template
 */
const employeeOnboardingTemplate = (data) => `
  <h2 style="color: #10B981; font-weight: 500; font-size: 22px; margin-bottom: 16px;">🎉 Welcome to Metro HRMS!</h2>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">Dear <strong style="color: #007bff;">${data.employeeName}</strong>,</p>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">
    Welcome to the team! We are excited to have you join us.
  </p>
  <div style="background: #1a3a2c; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #10B981;">
    <p style="color: #cccccc; margin: 4px 0;"><strong>Employee ID:</strong> ${data.employeeId}</p>
    <p style="color: #cccccc; margin: 4px 0;"><strong>Department:</strong> ${data.department}</p>
    <p style="color: #cccccc; margin: 4px 0;"><strong>Designation:</strong> ${data.designation}</p>
    <p style="color: #cccccc; margin: 4px 0;"><strong>Start Date:</strong> ${data.startDate}</p>
  </div>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">
    Please login to the HRMS portal to complete your profile and access company resources.
  </p>
  <div style="background: #333; padding: 16px; border-radius: 8px; margin: 16px 0;">
    <p style="color: #cccccc; margin: 4px 0;"><strong>Login Credentials:</strong></p>
    <p style="color: #cccccc; margin: 4px 0;">Email: ${data.email}</p>
    <p style="color: #cccccc; margin: 4px 0;">Password: ${data.temporaryPassword || "Please check with HR"}</p>
    <p style="color: #F59E0B; font-size: 12px; margin-top: 8px;">⚠️ Please change your password after first login</p>
  </div>
  <a href="${clientUrl}/login" style="display: inline-block; padding: 12px 28px; background-color: #10B981; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500; margin: 24px 0;">
    Login to Portal
  </a>
`;

/**
 * Get email template by name
 */
export const getEmailTemplate = (templateName, data) => {
  const templates = {
    leaveApplied: leaveAppliedTemplate,
    leaveApproved: leaveApprovedTemplate,
    leaveRejected: leaveRejectedTemplate,
    meetingInvite: meetingInviteTemplate,
    meetingReminder: meetingReminderTemplate,
    holidayAnnouncement: holidayAnnouncementTemplate,
    announcement: announcementTemplate,
    payrollGenerated: payrollGeneratedTemplate,
    documentExpiring: documentExpiringTemplate,
    attendanceAlert: attendanceAlertTemplate,
    resignationSubmitted: resignationSubmittedTemplate,
    resignationApproved: resignationApprovedTemplate,
    performanceReview: performanceReviewTemplate,
    complaintUpdate: complaintUpdateTemplate,
    employeeOnboarding: employeeOnboardingTemplate,
  };

  const template = templates[templateName];
  if (!template) {
    console.warn(`Email template '${templateName}' not found`);
    return defaultTemplate(data);
  }

  return wrapEmail(template(data));
};

/**
 * Leave Applied Template
 */
const leaveAppliedTemplate = (data) => `
  <h2 style="color: #ffffff; font-weight: 500; font-size: 22px; margin-bottom: 16px;">Leave Application Submitted</h2>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">Dear <strong style="color: #007bff;">${data.employeeName}</strong>,</p>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">
    Your leave application has been submitted successfully.
  </p>
  <div style="background: #333; padding: 16px; border-radius: 8px; margin: 16px 0;">
    <p style="color: #cccccc; margin: 4px 0;"><strong>Leave Type:</strong> ${data.leaveType}</p>
    <p style="color: #cccccc; margin: 4px 0;"><strong>From:</strong> ${data.fromDate}</p>
    <p style="color: #cccccc; margin: 4px 0;"><strong>To:</strong> ${data.toDate}</p>
    <p style="color: #cccccc; margin: 4px 0;"><strong>Duration:</strong> ${data.duration} days</p>
  </div>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">
    Your application is pending approval. You will be notified once it's reviewed.
  </p>
  <a href="${clientUrl}/leave" style="display: inline-block; padding: 12px 28px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500; margin: 24px 0;">
    View Leave Details
  </a>
`;

/**
 * Leave Approved Template
 */
const leaveApprovedTemplate = (data) => `
  <h2 style="color: #10B981; font-weight: 500; font-size: 22px; margin-bottom: 16px;">✓ Leave Application Approved</h2>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">Dear <strong style="color: #007bff;">${data.employeeName}</strong>,</p>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">
    Great news! Your leave application has been <strong style="color: #10B981;">approved</strong>.
  </p>
  <div style="background: #1a3a2c; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #10B981;">
    <p style="color: #cccccc; margin: 4px 0;"><strong>Leave Type:</strong> ${data.leaveType}</p>
    <p style="color: #cccccc; margin: 4px 0;"><strong>From:</strong> ${data.fromDate}</p>
    <p style="color: #cccccc; margin: 4px 0;"><strong>To:</strong> ${data.toDate}</p>
    <p style="color: #cccccc; margin: 4px 0;"><strong>Duration:</strong> ${data.duration} days</p>
    ${data.approverName ? `<p style="color: #cccccc; margin: 4px 0;"><strong>Approved By:</strong> ${data.approverName}</p>` : ''}
  </div>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">
    Enjoy your time off!
  </p>
  <a href="${clientUrl}/leave" style="display: inline-block; padding: 12px 28px; background-color: #10B981; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500; margin: 24px 0;">
    View Leave Details
  </a>
`;

/**
 * Leave Rejected Template
 */
const leaveRejectedTemplate = (data) => `
  <h2 style="color: #EF4444; font-weight: 500; font-size: 22px; margin-bottom: 16px;">Leave Application Not Approved</h2>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">Dear <strong style="color: #007bff;">${data.employeeName}</strong>,</p>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">
    Unfortunately, your leave application could not be approved at this time.
  </p>
  <div style="background: #3a1a1a; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #EF4444;">
    <p style="color: #cccccc; margin: 4px 0;"><strong>Leave Type:</strong> ${data.leaveType}</p>
    <p style="color: #cccccc; margin: 4px 0;"><strong>From:</strong> ${data.fromDate}</p>
    <p style="color: #cccccc; margin: 4px 0;"><strong>To:</strong> ${data.toDate}</p>
    ${data.reason ? `<p style="color: #cccccc; margin: 4px 0;"><strong>Reason:</strong> ${data.reason}</p>` : ''}
  </div>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">
    Please contact HR if you have any questions.
  </p>
`;

/**
 * Meeting Invite Template
 */
const meetingInviteTemplate = (data) => `
  <h2 style="color: #ffffff; font-weight: 500; font-size: 22px; margin-bottom: 16px;">📅 Meeting Invitation</h2>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">Dear <strong style="color: #007bff;">${data.employeeName}</strong>,</p>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">
    You have been invited to a meeting.
  </p>
  <div style="background: #333; padding: 16px; border-radius: 8px; margin: 16px 0;">
    <h3 style="color: #ffffff; margin: 0 0 12px 0;">${data.meetingTitle}</h3>
    <p style="color: #cccccc; margin: 4px 0;"><strong>Date:</strong> ${data.meetingDate}</p>
    <p style="color: #cccccc; margin: 4px 0;"><strong>Time:</strong> ${data.meetingTime}</p>
    <p style="color: #cccccc; margin: 4px 0;"><strong>Location:</strong> ${data.location || 'TBA'}</p>
    ${data.meetingLink ? `<p style="color: #cccccc; margin: 4px 0;"><strong>Link:</strong> <a href="${data.meetingLink}" style="color: #007bff;">${data.meetingLink}</a></p>` : ''}
    <p style="color: #cccccc; margin: 4px 0;"><strong>Organizer:</strong> ${data.organizer}</p>
  </div>
  ${data.agenda ? `<p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;"><strong>Agenda:</strong><br/>${data.agenda}</p>` : ''}
  <a href="${clientUrl}/meetings" style="display: inline-block; padding: 12px 28px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500; margin: 24px 0;">
    View Meeting Details
  </a>
`;

/**
 * Meeting Reminder Template
 */
const meetingReminderTemplate = (data) => `
  <h2 style="color: #F59E0B; font-weight: 500; font-size: 22px; margin-bottom: 16px;">⏰ Meeting Reminder</h2>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">Dear <strong style="color: #007bff;">${data.employeeName}</strong>,</p>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">
    This is a reminder that your meeting is starting in ${data.minutesBefore} minutes.
  </p>
  <div style="background: #3a2f1a; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #F59E0B;">
    <h3 style="color: #ffffff; margin: 0 0 12px 0;">${data.meetingTitle}</h3>
    <p style="color: #cccccc; margin: 4px 0;"><strong>Time:</strong> ${data.meetingTime}</p>
    <p style="color: #cccccc; margin: 4px 0;"><strong>Location:</strong> ${data.location || 'TBA'}</p>
    ${data.meetingLink ? `<p style="color: #cccccc; margin: 4px 0;"><a href="${data.meetingLink}" style="color: #F59E0B; text-decoration: underline;">Join Meeting</a></p>` : ''}
  </div>
`;

/**
 * Holiday Announcement Template
 */
const holidayAnnouncementTemplate = (data) => `
  <h2 style="color: #ffffff; font-weight: 500; font-size: 22px; margin-bottom: 16px;">🎉 Holiday Announcement</h2>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">Dear <strong style="color: #007bff;">${data.employeeName}</strong>,</p>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">
    We would like to inform you about an upcoming holiday.
  </p>
  <div style="background: #333; padding: 16px; border-radius: 8px; margin: 16px 0;">
    <h3 style="color: #ffffff; margin: 0 0 12px 0;">${data.holidayName}</h3>
    <p style="color: #cccccc; margin: 4px 0;"><strong>Date:</strong> ${data.holidayDate}</p>
    ${data.description ? `<p style="color: #cccccc; margin: 4px 0;">${data.description}</p>` : ''}
  </div>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">
    The office will be closed on this day.
  </p>
`;

/**
 * General Announcement Template
 */
const announcementTemplate = (data) => `
  <h2 style="color: #ffffff; font-weight: 500; font-size: 22px; margin-bottom: 16px;">📢 ${data.title}</h2>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">Dear <strong style="color: #007bff;">${data.employeeName}</strong>,</p>
  <div style="background: #333; padding: 16px; border-radius: 8px; margin: 16px 0;">
    <p style="color: #cccccc; font-size: 14px; line-height: 1.6;">${data.message}</p>
  </div>
  <a href="${clientUrl}/updates" style="display: inline-block; padding: 12px 28px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500; margin: 24px 0;">
    View All Announcements
  </a>
`;

/**
 * Payroll Generated Template
 */
const payrollGeneratedTemplate = (data) => `
  <h2 style="color: #10B981; font-weight: 500; font-size: 22px; margin-bottom: 16px;">💰 Payroll Generated</h2>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">Dear <strong style="color: #007bff;">${data.employeeName}</strong>,</p>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">
    Your payroll for ${data.month} ${data.year} has been processed.
  </p>
  <div style="background: #1a3a2c; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #10B981;">
    <p style="color: #cccccc; margin: 4px 0;"><strong>Net Salary:</strong> $${data.netSalary}</p>
    <p style="color: #cccccc; margin: 4px 0;"><strong>Payment Status:</strong> ${data.isPaid ? 'Paid' : 'Pending'}</p>
  </div>
  <a href="${clientUrl}/payroll" style="display: inline-block; padding: 12px 28px; background-color: #10B981; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500; margin: 24px 0;">
    View Payslip
  </a>
`;

/**
 * Document Expiring Template
 */
const documentExpiringTemplate = (data) => `
  <h2 style="color: #F59E0B; font-weight: 500; font-size: 22px; margin-bottom: 16px;">⚠️ Document Expiring Soon</h2>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">Dear <strong style="color: #007bff;">${data.employeeName}</strong>,</p>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">
    One of your documents is expiring soon. Please renew it at your earliest convenience.
  </p>
  <div style="background: #3a2f1a; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #F59E0B;">
    <p style="color: #cccccc; margin: 4px 0;"><strong>Document:</strong> ${data.documentName}</p>
    <p style="color: #cccccc; margin: 4px 0;"><strong>Expiry Date:</strong> ${data.expiryDate}</p>
    <p style="color: #cccccc; margin: 4px 0;"><strong>Days Remaining:</strong> ${data.daysRemaining}</p>
  </div>
`;

/**
 * Attendance Alert Template
 */
const attendanceAlertTemplate = (data) => `
  <h2 style="color: #EF4444; font-weight: 500; font-size: 22px; margin-bottom: 16px;">⚠️ Attendance Alert</h2>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">Dear <strong style="color: #007bff;">${data.employeeName}</strong>,</p>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">
    ${data.message}
  </p>
  <div style="background: #3a1a1a; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #EF4444;">
    <p style="color: #cccccc; margin: 4px 0;"><strong>Date:</strong> ${data.date}</p>
    ${data.details ? `<p style="color: #cccccc; margin: 4px 0;">${data.details}</p>` : ''}
  </div>
`;

/**
 * Resignation Submitted Template
 */
const resignationSubmittedTemplate = (data) => `
  <h2 style="color: #ffffff; font-weight: 500; font-size: 22px; margin-bottom: 16px;">Resignation Submitted</h2>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">Dear <strong style="color: #007bff;">${data.employeeName}</strong>,</p>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">
    Your resignation has been submitted and is under review.
  </p>
  <div style="background: #333; padding: 16px; border-radius: 8px; margin: 16px 0;">
    <p style="color: #cccccc; margin: 4px 0;"><strong>Resignation Date:</strong> ${data.resignationDate}</p>
    <p style="color: #cccccc; margin: 4px 0;"><strong>Last Working Day:</strong> ${data.lastWorkingDay}</p>
    <p style="color: #cccccc; margin: 4px 0;"><strong>Notice Period:</strong> ${data.noticePeriod} days</p>
  </div>
`;

/**
 * Resignation Approved Template
 */
const resignationApprovedTemplate = (data) => `
  <h2 style="color: #ffffff; font-weight: 500; font-size: 22px; margin-bottom: 16px;">Resignation Approved</h2>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">Dear <strong style="color: #007bff;">${data.employeeName}</strong>,</p>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">
    Your resignation has been approved. We wish you all the best in your future endeavors.
  </p>
  <div style="background: #333; padding: 16px; border-radius: 8px; margin: 16px 0;">
    <p style="color: #cccccc; margin: 4px 0;"><strong>Last Working Day:</strong> ${data.lastWorkingDay}</p>
  </div>
`;

/**
 * Performance Review Template
 */
const performanceReviewTemplate = (data) => `
  <h2 style="color: #ffffff; font-weight: 500; font-size: 22px; margin-bottom: 16px;">📊 Performance Review</h2>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">Dear <strong style="color: #007bff;">${data.employeeName}</strong>,</p>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">
    Your performance review for ${data.period} is now available.
  </p>
  <div style="background: #333; padding: 16px; border-radius: 8px; margin: 16px 0;">
    <p style="color: #cccccc; margin: 4px 0;"><strong>Overall Rating:</strong> ${data.rating}/5</p>
  </div>
  <a href="${clientUrl}/performance" style="display: inline-block; padding: 12px 28px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500; margin: 24px 0;">
    View Full Review
  </a>
`;

/**
 * Default Template (fallback)
 */
const defaultTemplate = (data) => `
  <h2 style="color: #ffffff; font-weight: 500; font-size: 22px; margin-bottom: 16px;">${data.title || 'Notification'}</h2>
  <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 8px 0;">Dear <strong style="color: #007bff;">${data.employeeName}</strong>,</p>
  <div style="background: #333; padding: 16px; border-radius: 8px; margin: 16px 0;">
    <p style="color: #cccccc; font-size: 14px; line-height: 1.6;">${data.message || 'You have a new notification.'}</p>
  </div>
  <a href="${clientUrl}" style="display: inline-block; padding: 12px 28px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500; margin: 24px 0;">
    Visit HRMS Portal
  </a>
`;
