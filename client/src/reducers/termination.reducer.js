import { createSlice } from "@reduxjs/toolkit";
import {
  getTerminations,
  createTermination,
  updateTermination,
  deleteTermination,
} from "../services/termination.service";

const initialState = {
  terminations: [],
  loading: false,
  error: null,
};

const terminationSlice = createSlice({
  name: "termination",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTerminations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTerminations.fulfilled, (state, action) => {
        state.terminations = action.payload;
        state.loading = false;
      })
      .addCase(getTerminations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createTermination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTermination.fulfilled, (state, action) => {
        // Create service now returns all terminations after creation
        if (action.payload && Array.isArray(action.payload)) {
          state.terminations = action.payload;
        }
        state.loading = false;
      })
      .addCase(createTermination.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateTermination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTermination.fulfilled, (state, action) => {
        // Update service now returns all terminations after update
        if (action.payload && Array.isArray(action.payload)) {
          state.terminations = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateTermination.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteTermination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTermination.fulfilled, (state, action) => {
        // Delete service now returns all terminations after deletion
        if (action.payload && Array.isArray(action.payload)) {
          state.terminations = action.payload;
        }
        state.loading = false;
      })
      .addCase(deleteTermination.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default terminationSlice.reducer;
