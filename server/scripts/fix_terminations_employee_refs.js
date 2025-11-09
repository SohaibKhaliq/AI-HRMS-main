import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Termination from "../src/models/termination.model.js";
import Employee from "../src/models/employee.model.js";

async function main() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/ai-hrms";
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to DB");

  const terminations = await Termination.find().lean();
  console.log(`Found ${terminations.length} terminations`);

  let fixed = 0;
  for (const t of terminations) {
    const current = t.employee;
    if (!current) continue;

    // If employee is an object with an _id (populated-like), set to that id
    if (typeof current === "object" && current._id) {
      const id = current._id;
      await Termination.updateOne({ _id: t._id }, { $set: { employee: id } });
      console.log(`Patched termination ${t._id}: set employee -> ${id}`);
      fixed++;
      continue;
    }

    // If employee is an object with employeeId/email, try to resolve
    if (typeof current === "object" && (current.employeeId || current.email)) {
      const emp = await Employee.findOne({
        ...(current.employeeId ? { employeeId: current.employeeId } : {}),
        ...(current.email ? { email: current.email } : {}),
      }).select("_id");
      if (emp) {
        await Termination.updateOne(
          { _id: t._id },
          { $set: { employee: emp._id } }
        );
        console.log(
          `Resolved termination ${t._id}: employeeId/email -> ${emp._id}`
        );
        fixed++;
      }
    }

    // If employee is a non-ObjectId string that looks like JSON, try parse
    if (typeof current === "string") {
      try {
        const parsed = JSON.parse(current);
        if (parsed && parsed._id) {
          await Termination.updateOne(
            { _id: t._id },
            { $set: { employee: parsed._id } }
          );
          console.log(
            `Parsed and patched termination ${t._id}: employee -> ${parsed._id}`
          );
          fixed++;
        }
      } catch (e) {
        // ignore
      }
    }
  }

  console.log(`Fixed ${fixed} termination records`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
