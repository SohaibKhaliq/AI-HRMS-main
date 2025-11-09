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
  allTimeEntries: [],
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
        const payload = action.payload || {};
        // server returns { timeEntry } — fall back to data for older endpoints
        state.activeEntry = payload.timeEntry ?? payload.data ?? payload;
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
        const payload = action.payload || {};
        state.activeEntry = null;
        const updated = payload.timeEntry ?? payload.data ?? payload;
        // Update in myEntries if exists
        const index = state.myEntries.findIndex(
          (e) => e._id === (updated && updated._id)
        );
        if (index !== -1 && updated) {
          state.myEntries[index] = updated;
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
        const payload = action.payload || {};
        state.activeEntry = payload.timeEntry ?? payload.data ?? payload;
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
        const payload = action.payload || {};
        state.activeEntry = payload.timeEntry ?? payload.data ?? payload;
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
        const payload = action.payload || {};
        state.activeEntry = payload.timeEntry ?? payload.data ?? payload;
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
        const payload = action.payload || {};
        state.myEntries =
          payload.timeEntries ?? payload.data ?? payload.timeEntries ?? [];
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
        const payload = action.payload || {};
        state.allTimeEntries = payload.timeEntries ?? payload.data ?? payload;
      })
      .addCase(getAllTimeEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Approve time entry
      .addCase(approveTimeEntry.fulfilled, (state, action) => {
        const index = state.allTimeEntries.findIndex(
          (e) => e._id === action.payload.data._id
        );
        if (index !== -1) {
          state.allTimeEntries[index] = action.payload.data;
        }
      })

      // Reject time entry
      .addCase(rejectTimeEntry.fulfilled, (state, action) => {
        const index = state.allTimeEntries.findIndex(
          (e) => e._id === action.payload.data._id
        );
        if (index !== -1) {
          state.allTimeEntries[index] = action.payload.data;
        }
      });
  },
});

export const { clearError } = timeEntrySlice.actions;
export default timeEntrySlice.reducer;
