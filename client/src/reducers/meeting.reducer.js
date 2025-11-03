import { createSlice } from "@reduxjs/toolkit";
import { 
  getAllMeetings, 
  getMyMeetings, 
  createMeeting, 
  updateMeeting, 
  deleteMeeting,
  updateMeetingStatus 
} from "../services/meeting.service";

const initialState = {
  meetings: [],
  myMeetings: [],
  loading: false,
  error: null,
};

const meetingSlice = createSlice({
  name: "meeting",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get All Meetings (Admin)
      .addCase(getAllMeetings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllMeetings.fulfilled, (state, action) => {
        state.meetings = action.payload;
        state.loading = false;
      })
      .addCase(getAllMeetings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get My Meetings (Employee)
      .addCase(getMyMeetings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyMeetings.fulfilled, (state, action) => {
        state.myMeetings = action.payload;
        state.loading = false;
      })
      .addCase(getMyMeetings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Meeting
      .addCase(createMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMeeting.fulfilled, (state, action) => {
        if (action.payload && Array.isArray(action.payload)) {
          state.meetings = action.payload;
        }
        state.loading = false;
      })
      .addCase(createMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Meeting
      .addCase(updateMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMeeting.fulfilled, (state, action) => {
        if (action.payload && Array.isArray(action.payload)) {
          state.meetings = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Meeting
      .addCase(deleteMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMeeting.fulfilled, (state, action) => {
        if (action.payload && Array.isArray(action.payload)) {
          state.meetings = action.payload;
        }
        state.loading = false;
      })
      .addCase(deleteMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Meeting Status (RSVP)
      .addCase(updateMeetingStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMeetingStatus.fulfilled, (state, action) => {
        if (action.payload && Array.isArray(action.payload)) {
          state.myMeetings = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateMeetingStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default meetingSlice.reducer;
