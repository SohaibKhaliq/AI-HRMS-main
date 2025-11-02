import { createSlice } from "@reduxjs/toolkit";
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
} from "../services/notification.service";

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get my notifications
      .addCase(getMyNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications || [];
        state.unreadCount = action.payload.unreadCount || 0;
      })
      .addCase(getMyNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get unread count
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })

      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notificationId = action.payload._id;
        const notification = state.notifications.find(
          (n) => n._id === notificationId
        );
        if (notification) {
          notification.read = true;
          notification.readAt = new Date().toISOString();
        }
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      });
  },
});

export const { clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
