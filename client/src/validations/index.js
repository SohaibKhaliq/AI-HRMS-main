import { z } from "zod";

// Common validation patterns
const nameRegex = /^[A-Za-z\s'-]+$/;
const cityRegex = /^[A-Za-z\s-]+$/;
const addressRegex = /^[A-Za-z0-9\s,.-]+$/;
const postalCodeRegex = /^[A-Za-z0-9\s-]+$/;

// Reusable address schema with strict validation
const addressSchema = z.object({
  street: z
    .string()
    .min(5, "* Street address must be at least 5 characters")
    .max(200, "* Street address must not exceed 200 characters")
    .regex(addressRegex, "* Street address contains invalid characters"),
  city: z
    .string()
    .min(2, "* City must be at least 2 characters")
    .max(50, "* City must not exceed 50 characters")
    .regex(
      cityRegex,
      "* City name can only contain letters, spaces, and hyphens"
    )
    .refine((val) => !/\d/.test(val), {
      message: "* City name cannot contain numbers",
    }),
  state: z
    .string()
    .min(2, "* State must be at least 2 characters")
    .max(50, "* State must not exceed 50 characters")
    .regex(
      cityRegex,
      "* State name can only contain letters, spaces, and hyphens"
    )
    .refine((val) => !/\d/.test(val), {
      message: "* State name cannot contain numbers",
    }),
  postalCode: z
    .string()
    .min(4, "* Postal code must be at least 4 characters")
    .max(10, "* Postal code must not exceed 10 characters")
    .regex(postalCodeRegex, "* Postal code contains invalid characters"),
  country: z
    .string()
    .min(2, "* Country must be at least 2 characters")
    .max(50, "* Country must not exceed 50 characters")
    .regex(
      cityRegex,
      "* Country name can only contain letters, spaces, and hyphens"
    )
    .refine((val) => !/\d/.test(val), {
      message: "* Country name cannot contain numbers",
    }),
});

// Reusable emergency contact schema
const emergencyContactSchema = z.object({
  name: z
    .string()
    .min(2, "* Emergency contact name must be at least 2 characters")
    .max(100, "* Emergency contact name must not exceed 100 characters")
    .regex(
      nameRegex,
      "* Name can only contain letters, spaces, hyphens, and apostrophes"
    )
    .refine((val) => !/\d/.test(val), {
      message: "* Name cannot contain numbers",
    }),
  relationship: z.enum(["Father", "Brother", "Friend"]),
  phoneNumber: z
    .string()
    .regex(/^\d+$/, "* Phone number can only contain digits (0-9)")
    .length(11, "* Phone number must be exactly 11 digits"),
});

const authenticationSchema = z.object({
  authority: z.string().nonempty("* Authority is required"),
  employeeId: z
    .string()
    .regex(/^\d{3}$/, "* Employee ID must be exactly 3 digits"),
  password: z.string().min(6, "* Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

const forgetPasswordSchema = z.object({
  email: z
    .string()
    .email("* Invalid email format")
    .nonempty("* Email is required"),
});

const createEmployeeSchema = z.object({
  employeeId: z
    .string()
    .regex(/^\d{3}$/, "* Employee ID must be exactly 3 digits"),
  name: z
    .string()
    .min(2, "* Full name must be at least 2 characters")
    .max(100, "* Full name must not exceed 100 characters")
    .regex(
      /^[A-Za-z\s'-]+$/,
      "* Name can only contain letters, spaces, hyphens, and apostrophes"
    )
    .refine((val) => !/\d/.test(val), {
      message: "* Name cannot contain numbers",
    })
    .refine((val) => !/^\s|\s$/.test(val), {
      message: "* Name cannot start or end with spaces",
    }),
  email: z
    .string()
    .email("* Invalid email address")
    .min(6, "* Email must be at least 6 characters"),
  password: z.string().min(6, "* Password must be at least 6 characters"),
  dob: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "* Date of Birth must be in YYYY-MM-DD format"
    ),
  phoneNumber: z
    .string()
    .length(11, "* Phone number must be exactly 11 digits")
    .regex(
      /^03\d{9}$/,
      "* Phone number must start with '03' and contain only digits"
    ),
  gender: z.enum(["Male", "Female"]),
  martialStatus: z.enum(["Single", "Married"]),
  address: addressSchema,

  department: z.string().min(1, "* Department is required"),
  role: z.string().min(1, "* Role is required"),
  designation: z.string().min(1, "* Designation is required"),
  salary: z.coerce
    .number()
    .min(0, "* Salary must be a positive number")
    .max(10000000, "* Salary must not exceed 10,000,000"),
  shift: z.string().min(1, "* Shift is required"),
  status: z.enum(["Active", "Inactive", "Leave"]),
  dateOfJoining: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "* Date of Joining must be in YYYY-MM-DD format"
    ),
  employmentType: z.enum(["Full-Time", "Part-Time"]),
  bankDetails: z.object({
    accountNumber: z
      .string()
      .min(8, "* Account number must be at least 8 digits")
      .max(16, "* Account number cannot exceed 16 digits")
      .regex(/^\d+$/, "* Account number can only contain digits (0-9)"),
    bankName: z.enum(["HBL", "ABL", "GOP"]),
  }),
  emergencyContact: emergencyContactSchema,
});

const updateEmployeeSchema = z.object({
  employeeId: z
    .string()
    .regex(/^\d{3}$/, "* Employee ID must be exactly 3 digits"),
  name: z
    .string()
    .min(2, "* Full name must be at least 2 characters")
    .max(100, "* Full name must not exceed 100 characters")
    .regex(
      nameRegex,
      "* Name can only contain letters, spaces, hyphens, and apostrophes"
    )
    .refine((val) => !/\d/.test(val), {
      message: "* Name cannot contain numbers",
    })
    .refine((val) => !/^\s|\s$/.test(val), {
      message: "* Name cannot start or end with spaces",
    }),
  email: z
    .string()
    .email("* Invalid email address")
    .min(6, "* Email must be at least 6 characters"),
  dob: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "* Date of Birth must be in YYYY-MM-DD format"
    ),
  phoneNumber: z
    .string()
    .length(11, "* Phone number must be exactly 11 digits")
    .regex(
      /^03\d{9}$/,
      "* Phone number must start with '03' and contain only digits"
    ),
  gender: z.enum(["Male", "Female"]),
  martialStatus: z.enum(["Single", "Married"]),
  address: addressSchema,

  department: z.string().min(1, "* Department is required"),
  role: z.string().min(1, "* Role is required"),
  salary: z.coerce
    .number()
    .min(0, "* Salary must be a positive number")
    .max(10000000, "* Salary must not exceed 10,000,000"),
  shift: z.string().min(1, "* Shift is required"),
  status: z.enum(["Active", "Inactive", "Leave"]),
  dateOfJoining: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "* Date of Joining must be in YYYY-MM-DD format"
    ),
  employmentType: z.enum(["Full-Time", "Part-Time"]),
  bankDetails: z.object({
    accountNumber: z
      .string()
      .min(8, "* Account number must be at least 8 digits")
      .max(16, "* Account number cannot exceed 16 digits")
      .regex(/^\d+$/, "* Account number can only contain digits (0-9)"),
    bankName: z.enum(["HBL", "ABL", "GOP"]),
  }),
  emergencyContact: emergencyContactSchema,
});

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "* Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "* Password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "* New password and confirm password must match",
    path: ["confirmPassword"],
  });

const updatePasswordSchema = z
  .object({
    oldPassword: z.string().min(6, "* Password must be at least 6 characters"),
    newPassword: z.string().min(6, "* Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "* Password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "* New password and confirm password must match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "* New password must be different from old password",
    path: ["newPassword"],
  });

const feedbackSchema = z.object({
  rating: z.enum(["1", "2", "3", "4", "5"], {
    message: "Rating must be between 1 and 5",
  }),
  suggestion: z.string().min(2, "* Suggestion must be at least 2 characters"),
  description: z
    .string()
    .min(10, "* Description must be at least 10 characters"),
});

const complaintSchema = z.object({
  employee: z.string().min(1, "* Complainant is required"),
  againstEmployee: z.string().optional().or(z.literal("")),
  complainType: z
    .string()
    .min(1, "* Complaint type is required")
    .refine(
      (val) =>
        [
          "Workplace",
          "Payroll",
          "Harassment",
          "Leave",
          "Scheduling",
          "Misconduct",
          "Discrimination",
          "Safety",
          "Other",
        ].includes(val),
      {
        message: "* Invalid complaint type",
      }
    ),
  complainSubject: z
    .string()
    .min(1, "* Complaint subject is required")
    .min(5, "* Complaint subject must be at least 5 characters")
    .max(150, "* Complaint subject must not exceed 150 characters"),
  complaintDetails: z
    .string()
    .min(1, "* Complaint details is required")
    .min(10, "* Complaint details must be at least 10 characters")
    .max(1000, "* Complaint details must not exceed 1000 characters"),
  status: z
    .string()
    .refine(
      (val) =>
        ["Pending", "In Progress", "Resolved", "Closed", "Escalated"].includes(
          val
        ),
      {
        message: "* Invalid status",
      }
    ),
  assignComplaint: z.string().optional().or(z.literal("")),
  remarks: z
    .string()
    .max(500, "* Remarks must not exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

const leaveSchema = z
  .object({
    leaveType: z.string().min(1, "* Leave type is required"),
    duration: z.coerce.number().min(1, "* Duration must be at least 1 day"),
    fromDate: z.string().min(1, "* From date is required"),
    toDate: z.string().min(1, "* To date is required"),
    description: z.string().optional(),
  })
  .refine((data) => new Date(data.fromDate) <= new Date(data.toDate), {
    message: "* From date cannot be greater than To date",
    path: ["fromDate"],
  });

const resignationSchema = z
  .object({
    employee: z.string().min(1, "* Employee is required"),
    resignationDate: z
      .string()
      .min(1, "* Resignation date is required")
      .refine((date) => {
        const d = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return d >= today;
      }, "* Resignation date must be today or in the future"),
    lastWorkingDay: z
      .string()
      .min(1, "* Last working day is required")
      .refine((date) => {
        const d = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return d >= today;
      }, "* Last working day must be today or in the future"),
    noticePeriod: z.string().refine((val) => {
      const num = parseInt(val);
      return num > 0 && num <= 365;
    }, "* Notice period must be between 1 and 365 days"),
    reason: z
      .string()
      .min(1, "* Resignation reason is required")
      .refine(
        (val) =>
          [
            "Career change",
            "Better opportunities",
            "Relocation",
            "Further education",
            "Personal reasons",
            "Health reasons",
            "Family matters",
            "Other",
          ].includes(val),
        {
          message: "* Invalid resignation reason",
        }
      ),
    status: z
      .string()
      .refine(
        (val) => ["Pending", "Approved", "Rejected", "Completed"].includes(val),
        {
          message: "* Invalid status",
        }
      ),
    remarks: z.string().optional(),
  })
  .refine(
    (data) => new Date(data.resignationDate) <= new Date(data.lastWorkingDay),
    {
      message: "* Last working day must be on or after resignation date",
      path: ["lastWorkingDay"],
    }
  )
  .refine(
    (data) => {
      const resignDate = new Date(data.resignationDate);
      const lastDate = new Date(data.lastWorkingDay);
      const diffTime = Math.abs(lastDate - resignDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays === parseInt(data.noticePeriod);
    },
    {
      message:
        "* Notice period must match the difference between resignation date and last working day",
      path: ["noticePeriod"],
    }
  );

const employeeResignationSchema = z.object({
  resignationDate: z
    .string()
    .min(1, "* Resignation date is required")
    .refine((date) => {
      const d = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return d >= today;
    }, "* Resignation date must be today or in the future"),
  noticePeriod: z.string().refine((val) => {
    const num = parseInt(val);
    return num > 0 && num <= 365;
  }, "* Notice period must be between 1 and 365 days"),
  reason: z
    .string()
    .min(1, "* Resignation reason is required")
    .refine(
      (val) =>
        [
          "Career change",
          "Better opportunities",
          "Relocation",
          "Further education",
          "Personal reasons",
          "Health reasons",
          "Family matters",
          "Other",
        ].includes(val),
      {
        message: "* Invalid resignation reason",
      }
    ),
  remarks: z.string().optional(),
});

const terminationSchema = z
  .object({
    employee: z.string().min(1, "* Employee is required"),
    type: z
      .string()
      .min(1, "* Termination type is required")
      .refine(
        (val) =>
          [
            "Retirement",
            "Resignation",
            "Termination",
            "Redundancy",
            "Voluntary",
            "Involuntary",
          ].includes(val),
        {
          message: "* Invalid termination type",
        }
      ),
    terminationDate: z
      .string()
      .min(1, "* Termination date is required")
      .refine((date) => {
        if (!date) return false;
        const d = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return d >= today;
      }, "* Termination date must be today or in the future"),
    noticeDate: z
      .string()
      .min(1, "* Notice date is required")
      .refine((date) => {
        if (!date) return false;
        const d = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return d >= today;
      }, "* Notice date must be today or in the future"),
    reason: z
      .string()
      .min(1, "* Termination reason is required")
      .min(10, "* Termination reason must be at least 10 characters")
      .max(500, "* Termination reason must not exceed 500 characters"),
    status: z
      .string()
      .min(1, "* Status is required")
      .refine(
        (val) => ["In progress", "Completed", "Cancelled"].includes(val),
        {
          message: "* Invalid status",
        }
      ),
    remarks: z
      .string()
      .max(500, "* Remarks must not exceed 500 characters")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      const noticeDate = new Date(data.noticeDate);
      const terminationDate = new Date(data.terminationDate);
      return noticeDate >= terminationDate;
    },
    {
      message: "* Notice date must be on or after termination date",
      path: ["noticeDate"],
    }
  )
  .refine(
    (data) => {
      const noticeDate = new Date(data.noticeDate);
      const terminationDate = new Date(data.terminationDate);
      const daysDifference = Math.ceil(
        (noticeDate - terminationDate) / (1000 * 60 * 60 * 24)
      );
      return daysDifference <= 365;
    },
    {
      message: "* Notice period should not exceed 1 year (365 days)",
      path: ["noticeDate"],
    }
  );

const holidaySchema = z.object({
  holidayName: z
    .string()
    .min(2, "* Holiday name must be at least 2 characters")
    .max(100, "* Holiday name must not exceed 100 characters"),
  date: z
    .string()
    .or(z.date())
    .refine((val) => {
      if (!val) return false;
      const date = typeof val === "string" ? new Date(val) : val;
      return !isNaN(date.getTime());
    }, "* Valid date is required"),
  category: z
    .string()
    .min(1, "* Category is required")
    .refine(
      (val) => ["National", "Religious", "Company Specific"].includes(val),
      {
        message: "* Invalid category",
      }
    ),
  type: z
    .string()
    .min(1, "* Type is required")
    .refine((val) => ["Full Day", "Half Day", "Floating"].includes(val), {
      message: "* Invalid type",
    }),
  description: z
    .string()
    .min(5, "* Description must be at least 5 characters")
    .max(500, "* Description must not exceed 500 characters"),
  isPaid: z.boolean().optional().default(true),
});

const announcementSchema = z
  .object({
    title: z
      .string()
      .min(5, "* Title must be at least 5 characters")
      .max(200, "* Title must not exceed 200 characters"),
    category: z
      .string()
      .min(1, "* Category is required")
      .refine(
        (val) =>
          [
            "General",
            "Policy",
            "Event",
            "Training",
            "Urgent",
            "Benefits",
            "Recognition",
          ].includes(val),
        {
          message: "* Invalid category",
        }
      ),
    description: z
      .string()
      .min(10, "* Description must be at least 10 characters")
      .max(2000, "* Description must not exceed 2000 characters"),
    startDate: z
      .string()
      .or(z.date())
      .refine((val) => {
        if (!val) return false;
        const date = typeof val === "string" ? new Date(val) : val;
        return !isNaN(date.getTime());
      }, "* Valid start date is required"),
    endDate: z
      .string()
      .or(z.date())
      .refine((val) => {
        if (!val) return false;
        const date = typeof val === "string" ? new Date(val) : val;
        return !isNaN(date.getTime());
      }, "* Valid end date is required"),
    targetDepartments: z.array(z.string()).optional().default(["All"]),
    targetDesignations: z.array(z.string()).optional().default(["All"]),
    priority: z
      .string()
      .refine((val) => ["Low", "Medium", "High", "Critical"].includes(val), {
        message: "* Invalid priority",
      })
      .optional()
      .default("Medium"),
    isActive: z.boolean().optional().default(true),
  })
  .refine(
    (data) => {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      return endDate >= startDate;
    },
    {
      message: "* End date must be after start date",
      path: ["endDate"],
    }
  );

export {
  leaveSchema,
  feedbackSchema,
  complaintSchema,
  holidaySchema,
  announcementSchema,
  authenticationSchema,
  createEmployeeSchema,
  forgetPasswordSchema,
  updateEmployeeSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  resignationSchema,
  employeeResignationSchema,
  terminationSchema,
};
