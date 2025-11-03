import mongoose from "mongoose";
import Role from "../models/role.model.js";
import { config } from "dotenv";

config();

const designations = [
  { name: "Software Engineer", description: "Develops and maintains software applications" },
  { name: "Senior Software Engineer", description: "Lead developer with advanced expertise" },
  { name: "Team Lead", description: "Manages a team of developers" },
  { name: "Project Manager", description: "Oversees project planning and execution" },
  { name: "Business Analyst", description: "Analyzes business requirements and processes" },
  { name: "QA Engineer", description: "Tests and ensures software quality" },
  { name: "DevOps Engineer", description: "Manages deployment and infrastructure" },
  { name: "UI/UX Designer", description: "Designs user interfaces and experiences" },
  { name: "HR Manager", description: "Manages human resources operations" },
  { name: "Marketing Manager", description: "Leads marketing strategies and campaigns" },
  { name: "Sales Executive", description: "Handles sales and client relationships" },
  { name: "Accountant", description: "Manages financial records and reporting" },
  { name: "Data Analyst", description: "Analyzes and interprets data" },
  { name: "Product Manager", description: "Manages product development and strategy" },
];

const seedDesignations = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing designations
    await Role.deleteMany({});
    console.log("Cleared existing designations");

    // Insert new designations
    const result = await Role.insertMany(designations);
    console.log(`Seeded ${result.length} designations`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

seedDesignations();
