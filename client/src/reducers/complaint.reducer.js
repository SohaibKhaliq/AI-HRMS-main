import { createSlice } from "@reduxjs/toolkit";
import {
  createComplaint,
  getComplaints,
  respondToComplaintRequest,
} from "../services/complaint.service";

const initialState = {
  complaints: [],
  loading: false,
  error: null,
  pagination: null,
  fetch: true,
};

const complaintsSlice = createSlice({
  name: "complaints",
  initialState,
  reducers: {
    setFetchFlag: (state, action) => {
      state.fetch = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Handle getComplaints action
    builder
      .addCase(getComplaints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getComplaints.fulfilled, (state, action) => {
        state.fetch = false;
        state.loading = false;
        state.complaints = action.payload.complaint;
        state.pagination = action.payload.pagination;
      })
      .addCase(getComplaints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(respondToComplaintRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(respondToComplaintRequest.fulfilled, (state, action) => {
        state.loading = false;

        const updatedComplaint = action.payload;

        // Replace the updated complaint in the list if present, otherwise push it
        const idx = state.complaints.findIndex((c) => c._id === updatedComplaint._id);
        if (idx !== -1) state.complaints[idx] = updatedComplaint;
        else state.complaints.push(updatedComplaint);
      })

      .addCase(respondToComplaintRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Handle createComplaint action
    builder
      .addCase(createComplaint.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createComplaint.fulfilled, (state, action) => {
        state.loading = false;
        state.complaints.push(action.payload);
      })
      .addCase(createComplaint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFetchFlag } = complaintsSlice.actions;
export default complaintsSlice.reducer;
