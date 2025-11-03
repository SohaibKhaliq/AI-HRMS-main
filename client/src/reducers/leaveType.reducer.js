import { createSlice } from "@reduxjs/toolkit";
import { getLeaveTypes, createLeaveType, updateLeaveType, deleteLeaveType } from "../services/leaveType.service";

const initialState = {
  leaveTypes: [],
  loading: false,
  error: null,
};

const leaveTypeSlice = createSlice({
  name: "leaveType",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getLeaveTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLeaveTypes.fulfilled, (state, action) => {
        state.leaveTypes = action.payload;
        state.loading = false;
      })
      .addCase(getLeaveTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createLeaveType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLeaveType.fulfilled, (state, action) => {
        if (action.payload && Array.isArray(action.payload)) {
          state.leaveTypes = action.payload;
        }
        state.loading = false;
      })
      .addCase(createLeaveType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateLeaveType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLeaveType.fulfilled, (state, action) => {
        if (action.payload && Array.isArray(action.payload)) {
          state.leaveTypes = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateLeaveType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteLeaveType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLeaveType.fulfilled, (state, action) => {
        if (action.payload && Array.isArray(action.payload)) {
          state.leaveTypes = action.payload;
        }
        state.loading = false;
      })
      .addCase(deleteLeaveType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default leaveTypeSlice.reducer;
