import { createSlice } from "@reduxjs/toolkit";
import { getResignations, createResignation, updateResignation, deleteResignation } from "../services/resignation.service";

const initialState = {
  resignations: [],
  loading: false,
  error: null,
};

const resignationSlice = createSlice({
  name: "resignation",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getResignations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getResignations.fulfilled, (state, action) => {
        state.resignations = action.payload;
        state.loading = false;
      })
      .addCase(getResignations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createResignation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createResignation.fulfilled, (state, action) => {
        if (action.payload) state.resignations = [...state.resignations, action.payload];
        state.loading = false;
      })
      .addCase(createResignation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateResignation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateResignation.fulfilled, (state, action) => {
        if (action.payload) {
          const idx = state.resignations.findIndex(r => r._id === action.payload._id);
          if (idx !== -1) state.resignations[idx] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateResignation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteResignation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteResignation.fulfilled, (state, action) => {
        if (action.payload) state.resignations = state.resignations.filter(r => r._id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteResignation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default resignationSlice.reducer;
