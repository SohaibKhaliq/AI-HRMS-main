import Resignation from "../models/resignation.model.js";
import Employee from "../models/employee.model.js";
import { sendFullNotification } from "./notification.service.js";
import { formatDate } from "../utils/index.js";

/**
 * Finds resignations that are Approved and whose lastWorkingDay is before today,
 * marks them as Completed and notifies the employee.
 */
export const runResignationCompletionJob = async () => {
  try {
    const now = new Date();
    // find approved resignations with lastWorkingDay before today
    const due = await Resignation.find({
      status: "Approved",
      lastWorkingDay: { $lt: new Date(now.toDateString()) },
    }).lean();

    if (!due || due.length === 0) return { updated: 0 };

    let updatedCount = 0;
    for (const r of due) {
      try {
        const updated = await Resignation.findByIdAndUpdate(
          r._id,
          { status: "Completed" },
          { new: true }
        ).populate(
          "employee",
          "name firstName lastName employeeId email profilePicture"
        );

        if (updated) {
          updatedCount++;
          // notify employee
          try {
            const emp = await Employee.findById(updated.employee._id);
            if (emp) {
              sendFullNotification({
                employee: emp,
                title: "Resignation Completed",
                message: "Your resignation process has been completed.",
                type: "resignation",
                priority: "high",
                link: "/resignation",
                emailSubject: "Resignation Completed",
                emailTemplate: "resignationCompleted",
                emailData: {
                  lastWorkingDay: formatDate(updated.lastWorkingDay),
                },
              }).catch((e) =>
                console.warn(
                  "Non-fatal: resignation completion notification failed:",
                  e && e.message ? e.message : e
                )
              );
            }
          } catch (notifyErr) {
            console.warn(
              "Failed to notify employee for completed resignation:",
              notifyErr && notifyErr.message ? notifyErr.message : notifyErr
            );
          }
        }
      } catch (err) {
        console.error(
          "Error updating resignation to Completed:",
          err && err.message ? err.message : err
        );
      }
    }

    return { updated: updatedCount };
  } catch (err) {
    console.error(
      "Resignation completion job failed:",
      err && err.message ? err.message : err
    );
    return { updated: 0, error: err };
  }
};

// Convenience function to schedule a daily run (returns the interval id)
export const scheduleDailyResignationCompletionJob = (
  intervalMs = 24 * 60 * 60 * 1000
) => {
  // Run immediately once
  runResignationCompletionJob().catch((e) =>
    console.warn("Initial resignation completion run failed:", e)
  );
  // then schedule daily
  return setInterval(() => {
    runResignationCompletionJob().catch((e) =>
      console.warn("Scheduled resignation completion run failed:", e)
    );
  }, intervalMs);
};
