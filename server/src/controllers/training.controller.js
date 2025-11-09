import Training from "../models/training.model.js";
import Employee from "../models/employee.model.js";
import {
  createBulkNotifications,
  sendEmailNotification,
} from "../services/notification.service.js";
import { sendNotificationToUser } from "../socket/index.js";

export async function createTraining(req, res) {
  try {
    const data = req.body || {};

    // Basic validation
    if (!data.title || String(data.title).trim().length === 0)
      return res
        .status(400)
        .json({ success: false, message: "Title is required" });

    // Attach createdBy from authenticated user
    if (req.user && req.user.id) data.createdBy = req.user.id;

    // Normalize participants: accept array or comma-separated string
    let participants = [];
    if (Array.isArray(data.participants)) participants = data.participants;
    else if (
      typeof data.participants === "string" &&
      data.participants.trim()
    ) {
      participants = data.participants
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // Verify participants exist (silently ignore invalid ids)
    if (participants.length) {
      const existing = await Employee.find({
        _id: { $in: participants },
      }).select("_id");
      participants = existing.map((e) => String(e._id));
    }

    const payload = {
      title: data.title,
      description: data.description,
      createdBy: data.createdBy,
      participants,
      status: data.status || "Draft",
      scheduledAt: data.scheduledAt,
    };

    const training = await Training.create(payload);
    const trainingPop = await Training.findById(training._id).populate(
      "participants createdBy",
      "_id name email employeeId"
    );

    // Send in-app notifications to participants and emit socket events
    try {
      const recipientIds = (trainingPop.participants || []).map((p) =>
        String(p._id || p)
      );

      if (recipientIds.length) {
        const notificationData = {
          title: `New Training: ${trainingPop.title}`,
          message: `You have been added to a training: ${trainingPop.title}`,
          type: "training",
          priority: "medium",
          link: `/trainings/${trainingPop._id}`,
          metadata: { trainingId: String(trainingPop._id) },
        };

        const created = await createBulkNotifications(
          recipientIds,
          notificationData
        );

        // Emit socket notification for each created notification
        created.forEach((n) => {
          try {
            sendNotificationToUser(String(n.recipient), "notification", {
              _id: n._id,
              title: n.title,
              message: n.message,
              type: n.type,
              priority: n.priority,
              link: n.link,
              createdAt: n.createdAt,
            });
          } catch (socketErr) {
            // ignore socket errors
          }
        });
      }
    } catch (notifyErr) {
      console.error("Failed to send notifications for training:", notifyErr);
    }

    res.json({ success: true, training: trainingPop });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to create training",
    });
  }
}

export async function getTraining(req, res) {
  try {
    const { id } = req.params;
    const training = await Training.findById(id).populate(
      "participants createdBy"
    );
    if (!training)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, training });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch training",
    });
  }
}

export async function getAllTrainings(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNumber = Math.max(parseInt(page), 1);
    const limitNumber = Math.max(parseInt(limit), 1);
    const skip = (pageNumber - 1) * limitNumber;

    const trainings = await Training.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate("participants createdBy", "_id name email employeeId")
      .lean();

    const total = await Training.countDocuments({});

    return res.json({
      success: true,
      trainings,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
        total,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch trainings",
    });
  }
}
