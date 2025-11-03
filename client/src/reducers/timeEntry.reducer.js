import { createSlice } from "@reduxjs/toolkit";
import {
  clockIn,
  clockOut,
  startBreak,
  endBreak,
  getActiveTimeEntry,
  getMyTimeEntries,
  getAllTimeEntries,
  approveTimeEntry,
  rejectTimeEntry,
} from "../services/timeEntry.service";

const initialState = {
  activeEntry: null,
  myEntries: [],
  allEntries: [],
  loading: false,
  error: null,
};

const timeEntrySlice = createSlice({
  name: "timeEntry",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Clock in
      .addCase(clockIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clockIn.fulfilled, (state, action) => {
        state.loading = false;
        state.activeEntry = action.payload.data;
      })
      .addCase(clockIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Clock out
      .addCase(clockOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clockOut.fulfilled, (state, action) => {
        state.loading = false;
        state.activeEntry = null;
        // Update in myEntries if exists
        const index = state.myEntries.findIndex(e => e._id === action.payload.data._id);
        if (index !== -1) {
          state.myEntries[index] = action.payload.data;
        }
      })
      .addCase(clockOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Start break
      .addCase(startBreak.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startBreak.fulfilled, (state, action) => {
        state.loading = false;
        state.activeEntry = action.payload.data;
      })
      .addCase(startBreak.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // End break
      .addCase(endBreak.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(endBreak.fulfilled, (state, action) => {
        state.loading = false;
        state.activeEntry = action.payload.data;
      })
      .addCase(endBreak.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get active time entry
      .addCase(getActiveTimeEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActiveTimeEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.activeEntry = action.payload.data;
      })
      .addCase(getActiveTimeEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.activeEntry = null;
      })
      
      // Get my time entries
      .addCase(getMyTimeEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyTimeEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.myEntries = action.payload.data;
      })
      .addCase(getMyTimeEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get all time entries (admin)
      .addCase(getAllTimeEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllTimeEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.allEntries = action.payload.data;
      })
      .addCase(getAllTimeEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Approve time entry
      .addCase(approveTimeEntry.fulfilled, (state, action) => {
        const index = state.allEntries.findIndex(e => e._id === action.payload.data._id);
        if (index !== -1) {
          state.allEntries[index] = action.payload.data;
        }
      })
      
      // Reject time entry
      .addCase(rejectTimeEntry.fulfilled, (state, action) => {
        const index = state.allEntries.findIndex(e => e._id === action.payload.data._id);
        if (index !== -1) {
          state.allEntries[index] = action.payload.data;
        }
      });
  },
});

export const { clearError } = timeEntrySlice.actions;
export default timeEntrySlice.reducer;
