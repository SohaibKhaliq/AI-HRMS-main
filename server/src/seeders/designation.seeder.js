import mongoose from "mongoose";
import Designation from "../models/designation.model.js";
import { config } from "dotenv";

config();

const designations = [
  { name: "Software Engineer", description: "Develops and maintains software applications", salary: 80000 },
  { name: "Senior Software Engineer", description: "Lead developer with advanced expertise", salary: 120000 },
  { name: "Team Lead", description: "Manages a team of developers", salary: 140000 },
  { name: "Project Manager", description: "Oversees project planning and execution", salary: 150000 },
  { name: "Business Analyst", description: "Analyzes business requirements and processes", salary: 90000 },
  { name: "QA Engineer", description: "Tests and ensures software quality", salary: 70000 },
  { name: "DevOps Engineer", description: "Manages deployment and infrastructure", salary: 110000 },
  { name: "UI/UX Designer", description: "Designs user interfaces and experiences", salary: 80000 },
  { name: "HR Manager", description: "Manages human resources operations", salary: 95000 },
  { name: "Marketing Manager", description: "Leads marketing strategies and campaigns", salary: 100000 },
  { name: "Sales Executive", description: "Handles sales and client relationships", salary: 60000 },
  { name: "Accountant", description: "Manages financial records and reporting", salary: 65000 },
  { name: "Data Analyst", description: "Analyzes and interprets data", salary: 85000 },
  { name: "Product Manager", description: "Manages product development and strategy", salary: 130000 },
];

const seedDesignations = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

  // Clear existing designations
  await Designation.deleteMany({});
  console.log("Cleared existing designations");

  // Insert new designations (with salary)
  const result = await Designation.insertMany(designations);
  console.log(`Seeded ${result.length} designations with salary`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

seedDesignations();
