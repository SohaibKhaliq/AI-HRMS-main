import mongoose from "mongoose";
import dotenv from "dotenv";
import Employee from "../models/employee.model.js";

dotenv.config();

/**
 * Check what type of shift values are in the database
 */
const checkShiftData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB");

    // Get all employees and check their shift field
    const employees = await Employee.find({}).select("employeeId name shift").lean();
    
    console.log(`\nTotal employees: ${employees.length}\n`);
    
    const stringShifts = [];
    const objectIdShifts = [];
    const nullShifts = [];
    
    for (const emp of employees) {
      if (emp.shift === null || emp.shift === undefined) {
        nullShifts.push(emp);
      } else if (typeof emp.shift === "string") {
        stringShifts.push(emp);
      } else if (emp.shift && typeof emp.shift === "object") {
        objectIdShifts.push(emp);
      }
    }
    
    console.log("=== Shift Data Analysis ===");
    console.log(`✓ ObjectId shifts: ${objectIdShifts.length}`);
    console.log(`✗ String shifts: ${stringShifts.length}`);
    console.log(`○ Null/undefined shifts: ${nullShifts.length}`);
    
    if (stringShifts.length > 0) {
      console.log("\n⚠️  Employees with STRING shift values:");
      stringShifts.forEach(emp => {
        console.log(`   - ${emp.employeeId} (${emp.name}): shift = "${emp.shift}"`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Check failed:", error);
    process.exit(1);
  }
};

checkShiftData();
