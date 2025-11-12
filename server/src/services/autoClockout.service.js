import TimeEntry from "../models/timeEntry.model.js";
import Employee from "../models/employee.model.js";
import { sendFullNotification } from "./notification.service.js";
import { myCache } from "../utils/index.js";

// Parse HH:mm into { hours, minutes }
const parseHHMM = (hhmm) => {
  if (!hhmm || typeof hhmm !== "string") return null;
  const [h, m] = hhmm.split(":");
  const hours = parseInt(h, 10);
  const minutes = parseInt(m, 10);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return { hours, minutes };
};

const autoClockOutOnce = async (opts = {}) => {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const graceMinutes = parseInt(
    process.env.AUTO_CLOCKOUT_GRACE_MINUTES || "15",
    10
  );

  // Find active time entries for today (clockOut == null)
  const activeEntries = await TimeEntry.find({
    date: { $gte: today },
    clockOut: null,
  }).lean();

  if (!activeEntries || activeEntries.length === 0) return { processed: 0 };

  let processed = 0;

  for (const entry of activeEntries) {
    try {
      const empId = entry.employee;
      if (!empId) continue;

      const employee = await Employee.findById(empId).populate("shift").lean();
      if (!employee) continue;

      const shift = employee.shift;
      if (!shift || !shift.startTime || !shift.endTime) continue;

      const startParsed = parseHHMM(shift.startTime);
      const endParsed = parseHHMM(shift.endTime);
      if (!startParsed || !endParsed) continue;

      // Build shift end datetime for the entry date
      const entryDate = new Date(entry.date);
      const shiftEnd = new Date(entryDate);
      shiftEnd.setHours(endParsed.hours, endParsed.minutes, 0, 0);

      // Handle overnight shifts where end <= start => end is next day
      if (
        endParsed.hours < startParsed.hours ||
        (endParsed.hours === startParsed.hours &&
          endParsed.minutes <= startParsed.minutes)
      ) {
        shiftEnd.setDate(shiftEnd.getDate() + 1);
      }

      // Apply grace window
      const graceMs = (graceMinutes || 0) * 60 * 1000;
      const cutoff = new Date(shiftEnd.getTime() + graceMs);

      if (now >= cutoff) {
        // Auto close this time entry using shiftEnd as clockOut (or now if earlier/later)
        const saveClockOut = shiftEnd > now ? now : shiftEnd;

        await TimeEntry.findByIdAndUpdate(
          entry._id,
          {
            clockOut: saveClockOut,
            notes: (entry.notes || "") + "\n[Auto] Clocked out at shift end.",
            autoClosed: true,
          },
          { new: true }
        );

        // Clear cache for employee
        try {
          myCache.del(`timeEntries-${empId}`);
        } catch (e) {
          // ignore
        }

        // Notify employee (best-effort)
        try {
          await sendFullNotification({
            employee,
            title: "Auto Clock-Out",
            message: `You were automatically clocked out at ${new Date(
              saveClockOut
            ).toLocaleTimeString()} as your scheduled shift ended. Please contact HR if this is incorrect.`,
            type: "time-tracking",
            priority: "medium",
            link: "/time-tracking",
            emailSubject: "Auto Clock-Out Notice",
            emailTemplate: "attendanceAlert",
            emailData: { timeEntry: entry },
          });
        } catch (notifErr) {
          // don't fail
          console.warn(
            "AutoClockOut: failed to notify employee",
            notifErr && notifErr.message ? notifErr.message : notifErr
          );
        }

        processed += 1;
      }
    } catch (err) {
      console.warn(
        "AutoClockOut: failed to process entry",
        entry && entry._id,
        err && err.message ? err.message : err
      );
    }
  }

  return { processed };
};

const scheduleAutoClockOut = (intervalMs = 5 * 60 * 1000) => {
  // Run immediately then schedule
  (async () => {
    try {
      const res = await autoClockOutOnce();
      console.log(`AutoClockOut: initial run processed=${res.processed}`);
    } catch (e) {
      console.warn(
        "AutoClockOut initial run failed:",
        e && e.message ? e.message : e
      );
    }
  })();

  setInterval(async () => {
    try {
      const res = await autoClockOutOnce();
      if (res.processed)
        console.log(`AutoClockOut: processed=${res.processed}`);
    } catch (e) {
      console.warn(
        "AutoClockOut: scheduled run failed:",
        e && e.message ? e.message : e
      );
    }
  }, intervalMs);
};

export { autoClockOutOnce, scheduleAutoClockOut };
