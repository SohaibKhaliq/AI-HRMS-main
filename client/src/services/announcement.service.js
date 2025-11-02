import toast from "react-hot-toast";
import axiosInstance from "../axios/axiosInstance";
import { createAsyncThunk } from "@reduxjs/toolkit";

// Fetch Announcements
export const getAnnouncements = createAsyncThunk(
  "announcements/getAnnouncements",
  async ({ category, priority, currentPage, limit = 10 }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        category: category || "",
        priority: priority || "",
        page: currentPage,
        limit: limit || "",
      }).toString();

      const { data } = await axiosInstance.get(`/announcements?${queryParams}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to fetch announcements"
      );
    }
  }
);

// Create Announcement
export const createAnnouncement = createAsyncThunk(
  "announcements/createAnnouncement",
  async (announcement, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/announcements", announcement);
      toast.success(data.message);
      return data.announcement;
    } catch (error) {
      toast.error(error.response?.data.message);
      return rejectWithValue(
        error.response?.data.message || "Failed to create announcement"
      );
    }
  }
);

// Get Announcement by ID
export const getAnnouncementById = createAsyncThunk(
  "announcements/getAnnouncementById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/announcements/${id}`);
      return data.announcement;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to fetch announcement"
      );
    }
  }
);

// Update Announcement
export const updateAnnouncement = createAsyncThunk(
  "announcements/updateAnnouncement",
  async ({ id, announcement }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`/announcements/${id}`, announcement);
      toast.success(data.message);
      return data.announcement;
    } catch (error) {
      toast.error(error.response?.data.message);
      return rejectWithValue(
        error.response?.data.message || "Failed to update announcement"
      );
    }
  }
);

// Delete Announcement
export const deleteAnnouncement = createAsyncThunk(
  "announcements/deleteAnnouncement",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete(`/announcements/${id}`);
      toast.success(data.message);
      return id;
    } catch (error) {
      toast.error(error.response?.data.message);
      return rejectWithValue(
        error.response?.data.message || "Failed to delete announcement"
      );
    }
  }
);