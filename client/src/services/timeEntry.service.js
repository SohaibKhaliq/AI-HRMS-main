import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "./api";

// Clock in
export const clockIn = createAsyncThunk(
  "timeEntry/clockIn",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/time-entries/clock-in", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to clock in"
      );
    }
  }
);

// Clock out
export const clockOut = createAsyncThunk(
  "timeEntry/clockOut",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/time-entries/clock-out", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to clock out"
      );
    }
  }
);

// Start break
export const startBreak = createAsyncThunk(
  "timeEntry/startBreak",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post("/time-entries/break/start");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to start break"
      );
    }
  }
);

// End break
export const endBreak = createAsyncThunk(
  "timeEntry/endBreak",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post("/time-entries/break/end");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to end break"
      );
    }
  }
);

// Get active time entry
export const getActiveTimeEntry = createAsyncThunk(
  "timeEntry/getActive",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/time-entries/active");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch active time entry"
      );
    }
  }
);

// Get my time entries
export const getMyTimeEntries = createAsyncThunk(
  "timeEntry/getMy",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      
      const response = await api.get(`/time-entries/my?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch time entries"
      );
    }
  }
);

// Get all time entries (admin)
export const getAllTimeEntries = createAsyncThunk(
  "timeEntry/getAll",
  async ({ employee, startDate, endDate, status }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (employee) params.append("employee", employee);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (status) params.append("status", status);
      
      const response = await api.get(`/time-entries?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch time entries"
      );
    }
  }
);

// Approve time entry (admin)
export const approveTimeEntry = createAsyncThunk(
  "timeEntry/approve",
  async ({ id, notes }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/time-entries/${id}/approve`, { notes });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to approve time entry"
      );
    }
  }
);

// Reject time entry (admin)
export const rejectTimeEntry = createAsyncThunk(
  "timeEntry/reject",
  async ({ id, notes }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/time-entries/${id}/reject`, { notes });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reject time entry"
      );
    }
  }
);
