import { catchErrors, myCache } from "../utils/index.js";
import Meeting from "../models/meeting.model.js";
import Employee from "../models/employee.model.js";
import { sendFullNotification } from "../services/notification.service.js";

const createMeeting = catchErrors(async (req, res) => {
  const {
    title,
    description,
    startTime,
    endTime,
    location,
    meetingLink,
    participants,
    agenda,
    isRecurring,
    recurrencePattern,
    recurrenceEndDate,
  } = req.body;

  const organizerId = req.employee._id;

  if (!title || !startTime || !endTime) {
    throw new Error("Title, start time, and end time are required");
  }

  // Format participants
  const formattedParticipants = (participants || []).map((p) => ({
    employee: typeof p === "string" ? p : p.employee,
    status: "pending",
    attendance: "not_marked",
  }));

  const meeting = await Meeting.create({
    title,
    description: description || "",
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    location: location || "",
    meetingLink: meetingLink || "",
    organizer: organizerId,
    participants: formattedParticipants,
    agenda: agenda || "",
    isRecurring: isRecurring || false,
    recurrencePattern: recurrencePattern || "none",
    recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate) : null,
  });

  // Populate meeting details
  const populated = await Meeting.findById(meeting._id)
    .populate("organizer", "name email")
    .populate("participants.employee", "name email");

  // Send notifications to all participants
  if (formattedParticipants.length > 0) {
    const participantIds = formattedParticipants.map((p) => p.employee);
    const participantEmployees = await Employee.find({
      _id: { $in: participantIds },
    });

    for (const emp of participantEmployees) {
      try {
        await sendFullNotification({
          employee: emp,
          title: "New Meeting Invitation",
          message: `You have been invited to "${title}" on ${new Date(
            startTime
          ).toLocaleDateString()}`,
          type: "meeting",
          priority: "medium",
          link: "/meetings",
          metadata: { meetingId: meeting._id },
          emailSubject: `Meeting Invitation: ${title}`,
          emailTemplate: "meetingInvite",
          emailData: {
            meetingTitle: title,
            meetingDate: new Date(startTime).toLocaleDateString(),
            meetingTime: new Date(startTime).toLocaleTimeString(),
            location: location || "TBA",
            meetingLink: meetingLink || "",
            organizer: req.employee.name,
            agenda: agenda || "",
          },
        });
      } catch (error) {
        console.error(`Error sending notification to ${emp.email}:`, error);
      }
    }
  }

  myCache.del("meetings");

  return res.status(201).json({
    success: true,
    message: "Meeting created successfully",
    meeting: populated,
  });
});

const getAllMeetings = catchErrors(async (req, res) => {
  const { status, startDate, endDate } = req.query;
  const query = {};

  if (status) {
    query.status = status;
  }

  if (startDate || endDate) {
    query.startTime = {};
    if (startDate) query.startTime.$gte = new Date(startDate);
    if (endDate) query.startTime.$lte = new Date(endDate);
  }

  const meetings = await Meeting.find(query)
    .populate("organizer", "name email profilePicture")
    .populate("participants.employee", "name email profilePicture")
    .sort({ startTime: 1 })
    .lean();

  return res.status(200).json({
    success: true,
    message: "Meetings fetched successfully",
    meetings,
  });
});

const getMyMeetings = catchErrors(async (req, res) => {
  const employeeId = req.employee._id;
  const { status, startDate, endDate } = req.query;
  const query = {
    $or: [{ organizer: employeeId }, { "participants.employee": employeeId }],
  };

  if (status) {
    query.status = status;
  }

  if (startDate || endDate) {
    query.startTime = {};
    if (startDate) query.startTime.$gte = new Date(startDate);
    if (endDate) query.startTime.$lte = new Date(endDate);
  }

  const meetings = await Meeting.find(query)
    .populate("organizer", "name email profilePicture")
    .populate("participants.employee", "name email profilePicture")
    .sort({ startTime: 1 })
    .lean();

  return res.status(200).json({
    success: true,
    message: "Your meetings fetched successfully",
    meetings,
  });
});

const getMeetingById = catchErrors(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new Error("Meeting ID is required");

  const meeting = await Meeting.findById(id)
    .populate("organizer", "name email profilePicture")
    .populate("participants.employee", "name email profilePicture");

  if (!meeting) throw new Error("Meeting not found");

  return res.status(200).json({
    success: true,
    message: "Meeting fetched successfully",
    meeting,
  });
});

const updateMeeting = catchErrors(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!id) throw new Error("Meeting ID is required");

  if (updateData.startTime) updateData.startTime = new Date(updateData.startTime);
  if (updateData.endTime) updateData.endTime = new Date(updateData.endTime);
  if (updateData.recurrenceEndDate)
    updateData.recurrenceEndDate = new Date(updateData.recurrenceEndDate);

  const meeting = await Meeting.findByIdAndUpdate(id, updateData, { new: true })
    .populate("organizer", "name email profilePicture")
    .populate("participants.employee", "name email profilePicture");

  if (!meeting) throw new Error("Meeting not found");

  myCache.del("meetings");

  return res.status(200).json({
    success: true,
    message: "Meeting updated successfully",
    meeting,
  });
});

const updateParticipantStatus = catchErrors(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const employeeId = req.employee._id;

  if (!id) throw new Error("Meeting ID is required");
  if (!status) throw new Error("Status is required");

  const meeting = await Meeting.findById(id);
  if (!meeting) throw new Error("Meeting not found");

  const participant = meeting.participants.find(
    (p) => p.employee.toString() === employeeId.toString()
  );

  if (!participant) {
    throw new Error("You are not a participant in this meeting");
  }

  participant.status = status;
  await meeting.save();

  return res.status(200).json({
    success: true,
    message: `Meeting ${status} successfully`,
    meeting,
  });
});

const deleteMeeting = catchErrors(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new Error("Meeting ID is required");

  const meeting = await Meeting.findByIdAndDelete(id);
  if (!meeting) throw new Error("Meeting not found");

  myCache.del("meetings");

  return res.status(200).json({
    success: true,
    message: "Meeting deleted successfully",
  });
});

export {
  createMeeting,
  getAllMeetings,
  getMyMeetings,
  getMeetingById,
  updateMeeting,
  updateParticipantStatus,
  deleteMeeting,
};
