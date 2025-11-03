import toast from "react-hot-toast";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axios/axiosInstance";

// Fetch Shifts
export const getShifts = createAsyncThunk(
  "shift/getShifts",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/shifts`);
      return data.shifts;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to fetch shifts"
      );
    }
  }
);

// Create Shift
export const createShift = createAsyncThunk(
  "shift/createShift",
  async (shiftData, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.post(`/shifts`, shiftData);
      toast.success(data.message);
      const result = await dispatch(getShifts());
      return result.payload;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to create shift"
      );
    }
  }
);

// Update Shift
export const updateShift = createAsyncThunk(
  "shift/updateShift",
  async ({ id, data: shiftData }, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.patch(`/shifts/${id}`, shiftData);
      toast.success(data.message);
      const result = await dispatch(getShifts());
      return result.payload;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to update shift"
      );
    }
  }
);

// Delete Shift
export const deleteShift = createAsyncThunk(
  "shift/deleteShift",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.delete(`/shifts/${id}`);
      toast.success(data.message);
      const result = await dispatch(getShifts());
      return result.payload;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to delete shift"
      );
    }
  }
);
