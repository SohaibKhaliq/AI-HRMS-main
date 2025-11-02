import toast from "react-hot-toast";
import axiosInstance from "../axios/axiosInstance";
import { createAsyncThunk } from "@reduxjs/toolkit";

// Fetch Holidays
export const getHolidays = createAsyncThunk(
  "holidays/getHolidays",
  async ({ category, type, currentPage, limit = 10 }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        category: category || "",
        type: type || "",
        page: currentPage,
        limit: limit || "",
      }).toString();

      const { data } = await axiosInstance.get(`/holidays?${queryParams}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to fetch holidays"
      );
    }
  }
);

// Create Holiday
export const createHoliday = createAsyncThunk(
  "holidays/createHoliday",
  async (holiday, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/holidays", holiday);
      toast.success(data.message);
      return data.holiday;
    } catch (error) {
      toast.error(error.response?.data.message);
      return rejectWithValue(
        error.response?.data.message || "Failed to create holiday"
      );
    }
  }
);

// Get Holiday by ID
export const getHolidayById = createAsyncThunk(
  "holidays/getHolidayById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/holidays/${id}`);
      return data.holiday;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to fetch holiday"
      );
    }
  }
);

// Update Holiday
export const updateHoliday = createAsyncThunk(
  "holidays/updateHoliday",
  async ({ id, holiday }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`/holidays/${id}`, holiday);
      toast.success(data.message);
      return data.holiday;
    } catch (error) {
      toast.error(error.response?.data.message);
      return rejectWithValue(
        error.response?.data.message || "Failed to update holiday"
      );
    }
  }
);

// Delete Holiday
export const deleteHoliday = createAsyncThunk(
  "holidays/deleteHoliday",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete(`/holidays/${id}`);
      toast.success(data.message);
      return id;
    } catch (error) {
      toast.error(error.response?.data.message);
      return rejectWithValue(
        error.response?.data.message || "Failed to delete holiday"
      );
    }
  }
);
