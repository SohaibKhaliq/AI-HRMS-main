import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axios/axiosInstance";

// Get my notifications
export const getMyNotifications = createAsyncThunk(
  "notification/getMyNotifications",
  async (limit = 50, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/notifications/my?limit=${limit}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to fetch notifications"
      );
    }
  }
);

// Get unread count
export const getUnreadCount = createAsyncThunk(
  "notification/getUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/notifications/unread-count");
      return data.count;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to fetch unread count"
      );
    }
  }
);

// Mark notification as read
export const markAsRead = createAsyncThunk(
  "notification/markAsRead",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`/notifications/${id}/read`);
      return data.notification;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to mark notification as read"
      );
    }
  }
);
