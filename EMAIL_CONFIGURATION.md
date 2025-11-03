# 📧 Email Configuration Guide

Complete guide to configure email notifications in AI-HRMS.

## Overview

AI-HRMS uses email notifications to keep employees informed about important events. The system includes **16 professional HTML email templates** for various scenarios.

## Email Templates Available

1. **Leave Management** (3 templates)
   - `leaveApplied` - Sent when employee applies for leave
   - `leaveApproved` - Sent when leave is approved
   - `leaveRejected` - Sent when leave is rejected

2. **Payroll** (1 template)
   - `payrollGenerated` - Sent when payroll is generated or salary is paid

3. **Meetings** (2 templates)
   - `meetingInvite` - Sent when employee is invited to a meeting
   - `meetingReminder` - Sent as a reminder before meeting starts

4. **Holidays & Announcements** (2 templates)
   - `holidayAnnouncement` - Sent when new holiday is added
   - `announcement` - Sent for general company announcements

5. **Employee Lifecycle** (4 templates)
   - `employeeOnboarding` - Welcome email for new employees
   - `resignationSubmitted` - Sent when resignation is submitted
   - `resignationApproved` - Sent when resignation is approved
   - `performanceReview` - Sent when performance review is available

6. **HR Operations** (3 templates)
   - `complaintUpdate` - Sent when complaint status changes
   - `documentExpiring` - Sent when employee document is expiring
   - `attendanceAlert` - Sent for attendance-related alerts

7. **Fallback** (1 template)
   - `default` - Generic notification template

## SMTP Configuration

### Step 1: Configure Environment Variables

Edit `server/.env` file:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Step 2: Choose Your Email Provider

#### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication**
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password
   - Use this as `SMTP_PASS`

3. **Configuration**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx
   ```

#### Option 2: Outlook / Office 365

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### Option 3: Custom SMTP Server

```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-password
```

#### Option 4: SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Option 5: AWS SES

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-aws-access-key-id
SMTP_PASS=your-aws-secret-access-key
```

## Testing Email Configuration

### Method 1: Using the Seeder

The seeder will automatically send welcome emails when creating new employees:

```bash
cd server
npm run seed
```

### Method 2: Manual Testing

1. Create a new employee through the admin panel
2. Check if welcome email is received
3. Test other features like leave application, announcements, etc.

### Method 3: Direct API Test

```javascript
// Test email sending
import { sendEmailNotification } from './services/notification.service.js';

await sendEmailNotification({
  email: 'test@example.com',
  subject: 'Test Email',
  templateName: 'announcement',
  templateData: {
    employeeName: 'Test User',
    title: 'Test Announcement',
    message: 'This is a test email.',
  },
});
```

## Troubleshooting

### Issue: "Invalid login" or "Authentication failed"

**Solution:**
- Double-check username and password
- For Gmail: Ensure you're using App Password, not regular password
- Check if 2FA is enabled (required for Gmail)

### Issue: "Connection timeout" or "ETIMEDOUT"

**Solution:**
- Verify SMTP_HOST and SMTP_PORT are correct
- Check firewall settings
- Try switching between port 465 (SSL) and 587 (TLS)

### Issue: Emails go to spam

**Solution:**
- Configure SPF, DKIM, and DMARC records for your domain
- Use a professional email service (SendGrid, AWS SES)
- Avoid spam trigger words in email content
- Ensure "From" email matches SMTP_USER

### Issue: Rate limiting

**Solution:**
- Gmail: Max 500 emails/day for free accounts
- Use a professional email service for production
- Implement email queuing for bulk operations

## Email Customization

### Changing Email Branding

Edit `server/src/services/email.service.js`:

```javascript
const logoUrl = "http://metrohrms.netlify.app/metro.png";
const clientUrl = process.env.CLIENT_URL || "https://metrohrms.netlify.app";
```

Replace with your company logo and URL.

### Creating Custom Templates

1. Add new template function:
```javascript
const myCustomTemplate = (data) => `
  <h2 style="color: #ffffff;">My Custom Email</h2>
  <p style="color: #cccccc;">${data.message}</p>
`;
```

2. Register in `getEmailTemplate`:
```javascript
const templates = {
  // ... existing templates
  myCustom: myCustomTemplate,
};
```

3. Use in controllers:
```javascript
await sendFullNotification({
  employee,
  emailTemplate: "myCustom",
  emailData: { message: "Hello!" },
});
```

## Production Best Practices

1. **Use Professional Email Service**
   - SendGrid, AWS SES, or Mailgun
   - Better deliverability and reliability
   - Higher sending limits

2. **Configure Domain Authentication**
   - Set up SPF records
   - Configure DKIM signing
   - Implement DMARC policy

3. **Email Queuing**
   - Use Bull or BeeQueue for background jobs
   - Prevents blocking API requests
   - Handles retries automatically

4. **Monitor Email Delivery**
   - Track bounce rates
   - Monitor spam complaints
   - Log email sending errors

5. **Compliance**
   - Include unsubscribe links (for marketing emails)
   - Follow GDPR/CAN-SPAM regulations
   - Store email preferences

## Email Notification Flow

```
User Action → Controller → sendFullNotification() → Email Service → SMTP Server → Recipient
                                    ↓
                            In-App Notification
```

## Email Event Triggers

| Event | Template | Recipients |
|-------|----------|-----------|
| Employee Created | employeeOnboarding | New Employee |
| Leave Applied | leaveApplied | Applicant |
| Leave Approved | leaveApproved | Applicant |
| Leave Rejected | leaveRejected | Applicant |
| Payroll Generated | payrollGenerated | Employee |
| Salary Paid | payrollGenerated | Employee |
| Meeting Scheduled | meetingInvite | Participants |
| Holiday Added | holidayAnnouncement | All Employees |
| Announcement Posted | announcement | All Employees |
| Complaint Submitted | complaintUpdate | Complainant |
| Complaint Resolved | complaintUpdate | Complainant |
| Resignation Submitted | resignationSubmitted | Employee |
| Resignation Approved | resignationApproved | Employee |
| Performance Review | performanceReview | Employee |
| Promotion | announcement | Employee |
| Termination | announcement | Employee |
| Interview Scheduled | inviteForInterviewMail | Candidate |

## Support

For email configuration issues:
1. Check server logs: `npm run dev` (in server directory)
2. Review error messages in console
3. Test with online tools: https://www.smtper.net/

---

**Last Updated:** November 2025  
**Version:** 1.0.0
