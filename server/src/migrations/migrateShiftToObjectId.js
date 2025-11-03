import mongoose from "mongoose";
import dotenv from "dotenv";
import Employee from "../models/employee.model.js";
import Shift from "../models/shift.model.js";

dotenv.config();

/**
 * Migration script to convert string shift values to ObjectId references
 * Run this once to fix existing data in the database
 */
const migrateShiftToObjectId = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB");

    // Find all employees with string shift values
    const employees = await Employee.find({
      shift: { $type: "string" }
    });

    console.log(`Found ${employees.length} employees with string shift values`);

    if (employees.length === 0) {
      console.log("✓ No migration needed - all shift values are already ObjectIds");
      process.exit(0);
    }

    // Get all shifts for lookup
    const shifts = await Shift.find({});
    const shiftMap = {};
    shifts.forEach(shift => {
      shiftMap[shift.name] = shift._id;
    });

    console.log("Available shifts:", Object.keys(shiftMap));

    let updated = 0;
    let failed = 0;

    // Update each employee
    for (const employee of employees) {
      try {
        const shiftName = employee.shift;
        const shiftId = shiftMap[shiftName];

        if (shiftId) {
          await Employee.updateOne(
            { _id: employee._id },
            { $set: { shift: shiftId } }
          );
          console.log(`✓ Updated employee ${employee.employeeId} (${employee.name}): "${shiftName}" -> ObjectId`);
          updated++;
        } else {
          // Set to null if shift name not found
          await Employee.updateOne(
            { _id: employee._id },
            { $set: { shift: null } }
          );
          console.log(`⚠ Employee ${employee.employeeId} (${employee.name}): Unknown shift "${shiftName}" set to null`);
          updated++;
        }
      } catch (error) {
        console.error(`✗ Failed to update employee ${employee.employeeId}:`, error.message);
        failed++;
      }
    }

    console.log("\n=== Migration Complete ===");
    console.log(`✓ Successfully updated: ${updated}`);
    console.log(`✗ Failed: ${failed}`);

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateShiftToObjectId();
