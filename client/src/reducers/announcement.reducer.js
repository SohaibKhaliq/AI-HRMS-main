import { createSlice } from "@reduxjs/toolkit";
import {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
} from "../services/announcement.service";

const initialState = {
  announcements: [],
  selectedAnnouncement: null,
  loading: false,
  error: null,
  pagination: null,
  fetch: true,
};

const announcementsSlice = createSlice({
  name: "announcements",
  initialState,
  reducers: {
    setFetchFlag: (state, action) => {
      state.fetch = action.payload;
    },
    clearSelectedAnnouncement: (state) => {
      state.selectedAnnouncement = null;
    },
  },
  extraReducers: (builder) => {
    // Handle getAnnouncements action
    builder
      .addCase(getAnnouncements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAnnouncements.fulfilled, (state, action) => {
        state.fetch = false;
        state.loading = false;
        state.announcements = action.payload.announcements;
        state.pagination = action.payload.pagination;
      })
      .addCase(getAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Handle getAnnouncementById action
    builder
      .addCase(getAnnouncementById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAnnouncementById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAnnouncement = action.payload;
      })
      .addCase(getAnnouncementById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Handle createAnnouncement action
    builder
      .addCase(createAnnouncement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.loading = false;
        state.announcements.push(action.payload);
        state.fetch = true;
      })
      .addCase(createAnnouncement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Handle updateAnnouncement action
    builder
      .addCase(updateAnnouncement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAnnouncement.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.announcements.findIndex(
          (announcement) => announcement._id === action.payload._id
        );
        if (index !== -1) {
          state.announcements[index] = action.payload;
        }
        state.fetch = true;
      })
      .addCase(updateAnnouncement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Handle deleteAnnouncement action
    builder
      .addCase(deleteAnnouncement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        state.loading = false;
        state.announcements = state.announcements.filter(
          (announcement) => announcement._id !== action.payload
        );
        state.fetch = true;
      })
      .addCase(deleteAnnouncement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFetchFlag, clearSelectedAnnouncement } = announcementsSlice.actions;
export default announcementsSlice.reducer;