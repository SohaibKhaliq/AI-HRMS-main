import Employee from "../models/employee.model.js";

const SAMPLE_SKILLS = [
  "leadership",
  "communication",
  "sales",
  "marketing",
  "payroll",
  "hr",
  "javascript",
  "react",
  "nodejs",
  "excel",
  "project-management",
  "customer-service",
];

export async function seedEmployeeSkills() {
  console.log("Seeding employee skills...");
  const employees = await Employee.find({});
  for (const emp of employees) {
    if (!emp.skills || emp.skills.length === 0) {
      // assign 1-4 random skills
      const count = Math.floor(Math.random() * 4) + 1;
      const shuffled = SAMPLE_SKILLS.sort(() => 0.5 - Math.random());
      emp.skills = shuffled.slice(0, count);
      await emp.save();
      console.log(`Assigned skills to ${emp._id}: ${emp.skills.join(", ")}`);
    }
  }
  console.log("Employee skills seeding done.");
}

export default seedEmployeeSkills;
