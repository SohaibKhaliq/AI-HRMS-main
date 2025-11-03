import { createSlice } from "@reduxjs/toolkit";
import { getShifts, createShift, updateShift, deleteShift } from "../services/shift.service";

const initialState = {
  shifts: [],
  loading: false,
  error: null,
};

const shiftSlice = createSlice({
  name: "shift",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getShifts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getShifts.fulfilled, (state, action) => {
        state.shifts = action.payload;
        state.loading = false;
      })
      .addCase(getShifts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createShift.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createShift.fulfilled, (state, action) => {
        if (action.payload && Array.isArray(action.payload)) {
          state.shifts = action.payload;
        }
        state.loading = false;
      })
      .addCase(createShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateShift.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateShift.fulfilled, (state, action) => {
        if (action.payload && Array.isArray(action.payload)) {
          state.shifts = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteShift.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteShift.fulfilled, (state, action) => {
        if (action.payload && Array.isArray(action.payload)) {
          state.shifts = action.payload;
        }
        state.loading = false;
      })
      .addCase(deleteShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default shiftSlice.reducer;
