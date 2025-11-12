import mongoose from "mongoose";
import dotenv from "dotenv";
import TimeEntry from "../src/models/timeEntry.model.js";

dotenv.config();

const markAutoClosed = async () => {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not set in environment");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find entries with notes containing [Auto] but without autoClosed flag
    const query = { notes: /\[Auto\]/i, autoClosed: { $ne: true } };
    const update = { $set: { autoClosed: true } };

    const res = await TimeEntry.updateMany(query, update);
    console.log(`Matched: ${res.matchedCount}, Modified: ${res.modifiedCount}`);

    await mongoose.disconnect();
    console.log("Done");
    process.exit(0);
  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  markAutoClosed();
}
