import { createSlice } from "@reduxjs/toolkit";
import { getDesignations, createDesignation, updateDesignation, deleteDesignation } from "../services/designation.service";

const initialState = {
  designations: [],
  loading: false,
  error: null,
};

const designationSlice = createSlice({
  name: "designation",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getDesignations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDesignations.fulfilled, (state, action) => {
        state.designations = action.payload;
        state.loading = false;
      })
      .addCase(getDesignations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createDesignation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDesignation.fulfilled, (state, action) => {
        // If payload is provided (no full-refresh), append; otherwise list was refreshed by thunk
        if (action.payload) state.designations = [...state.designations, action.payload];
        state.loading = false;
      })
      .addCase(createDesignation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateDesignation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDesignation.fulfilled, (state, action) => {
        // If thunk returned updated item, replace it; otherwise getDesignations refreshed the list
        if (action.payload) {
          const idx = state.designations.findIndex(d => d._id === action.payload._id);
          if (idx !== -1) state.designations[idx] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateDesignation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteDesignation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDesignation.fulfilled, (state, action) => {
        // If payload contains deleted id, filter; otherwise list was refreshed by thunk
        if (action.payload) state.designations = state.designations.filter(d => d._id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteDesignation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default designationSlice.reducer;
