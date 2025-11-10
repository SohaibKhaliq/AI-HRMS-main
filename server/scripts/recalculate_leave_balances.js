/**
 * Script to recalculate all leave balance 'available' fields
 * Run this to fix any leave balances that have incorrect available values
 *
 * Usage: node scripts/recalculate_leave_balances.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hrms";

// Define LeaveBalance schema inline
const leaveBalanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    leaveType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeaveType",
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    totalAllotted: {
      type: Number,
      required: true,
      min: 0,
    },
    used: {
      type: Number,
      default: 0,
      min: 0,
    },
    pending: {
      type: Number,
      default: 0,
      min: 0,
    },
    available: {
      type: Number,
      default: 0,
      min: 0,
    },
    carriedForward: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const LeaveBalance = mongoose.model("LeaveBalance", leaveBalanceSchema);

async function recalculateLeaveBalances() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✓ Connected to MongoDB");

    console.log("\nFetching all leave balance records...");
    const balances = await LeaveBalance.find({});
    console.log(`✓ Found ${balances.length} leave balance records`);

    let updatedCount = 0;
    let errorCount = 0;
    const errors = [];

    console.log("\nRecalculating available days for each record...\n");

    for (const balance of balances) {
      try {
        const oldAvailable = balance.available;
        const newAvailable =
          balance.totalAllotted +
          balance.carriedForward -
          balance.used -
          balance.pending;

        if (oldAvailable !== newAvailable) {
          balance.available = newAvailable;
          await balance.save({ validateBeforeSave: false }); // Skip validation to avoid pre-save hook

          console.log(`✓ Updated balance ID ${balance._id}:`);
          console.log(`  Employee: ${balance.employee}`);
          console.log(`  Leave Type: ${balance.leaveType}`);
          console.log(`  Year: ${balance.year}`);
          console.log(
            `  Calculation: ${balance.totalAllotted} + ${balance.carriedForward} - ${balance.used} - ${balance.pending} = ${newAvailable}`
          );
          console.log(
            `  Old available: ${oldAvailable} → New available: ${newAvailable}`
          );
          console.log("");

          updatedCount++;
        }
      } catch (error) {
        errorCount++;
        errors.push({
          balanceId: balance._id,
          error: error.message,
        });
        console.error(
          `✗ Error updating balance ${balance._id}: ${error.message}`
        );
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("RECALCULATION COMPLETE");
    console.log("=".repeat(60));
    console.log(`Total records processed: ${balances.length}`);
    console.log(`Records updated: ${updatedCount}`);
    console.log(
      `Records unchanged: ${balances.length - updatedCount - errorCount}`
    );
    console.log(`Errors: ${errorCount}`);

    if (errors.length > 0) {
      console.log("\nErrors encountered:");
      errors.forEach((err) => {
        console.log(`  - Balance ID ${err.balanceId}: ${err.error}`);
      });
    }

    console.log("\n✓ Script completed successfully!");
  } catch (error) {
    console.error("✗ Script failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("✓ Disconnected from MongoDB");
    process.exit(0);
  }
}

// Run the script
recalculateLeaveBalances();
