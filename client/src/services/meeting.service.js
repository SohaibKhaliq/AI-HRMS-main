import toast from "react-hot-toast";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axios/axiosInstance";

// Admin: Get all meetings
export const getAllMeetings = createAsyncThunk(
  "meeting/getAllMeetings",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/meetings`);
      return data.meetings;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to fetch meetings"
      );
    }
  }
);

// Employee: Get my meetings
export const getMyMeetings = createAsyncThunk(
  "meeting/getMyMeetings",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/meetings/my`);
      return data.meetings;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to fetch my meetings"
      );
    }
  }
);

// Create Meeting
export const createMeeting = createAsyncThunk(
  "meeting/createMeeting",
  async (meetingData, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.post(`/meetings`, meetingData);
      toast.success(data.message);
      const result = await dispatch(getAllMeetings());
      return result.payload;
    } catch (error) {
      toast.error(error.response?.data.message || "Failed to create meeting");
      return rejectWithValue(
        error.response?.data.message || "Failed to create meeting"
      );
    }
  }
);

// Update Meeting
export const updateMeeting = createAsyncThunk(
  "meeting/updateMeeting",
  async ({ id, data: meetingData }, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.patch(`/meetings/${id}`, meetingData);
      toast.success(data.message);
      const result = await dispatch(getAllMeetings());
      return result.payload;
    } catch (error) {
      toast.error(error.response?.data.message || "Failed to update meeting");
      return rejectWithValue(
        error.response?.data.message || "Failed to update meeting"
      );
    }
  }
);

// Delete Meeting
export const deleteMeeting = createAsyncThunk(
  "meeting/deleteMeeting",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.delete(`/meetings/${id}`);
      toast.success(data.message);
      const result = await dispatch(getAllMeetings());
      return result.payload;
    } catch (error) {
      toast.error(error.response?.data.message || "Failed to delete meeting");
      return rejectWithValue(
        error.response?.data.message || "Failed to delete meeting"
      );
    }
  }
);

// Update Meeting Status (RSVP)
export const updateMeetingStatus = createAsyncThunk(
  "meeting/updateMeetingStatus",
  async ({ id, status }, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.patch(`/meetings/${id}/status`, { status });
      toast.success(data.message);
      const result = await dispatch(getMyMeetings());
      return result.payload;
    } catch (error) {
      toast.error(error.response?.data.message || "Failed to update RSVP");
      return rejectWithValue(
        error.response?.data.message || "Failed to update RSVP"
      );
    }
  }
);
