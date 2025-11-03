import mongoose from "mongoose";
import dotenv from "dotenv";
import { seedTimeTracking } from "./timeTracking.seeder.js";

dotenv.config();

const runSeeder = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB");
    
    await seedTimeTracking();
    
    console.log("\n✅ Seeding completed successfully!");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

runSeeder();
