import { createSlice } from "@reduxjs/toolkit";
import { getPromotions, createPromotion, updatePromotion, deletePromotion } from "../services/promotion.service";

const initialState = {
  promotions: [],
  loading: false,
  error: null,
};

const promotionSlice = createSlice({
  name: "promotion",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPromotions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPromotions.fulfilled, (state, action) => {
        state.promotions = action.payload;
        state.loading = false;
      })
      .addCase(getPromotions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createPromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPromotion.fulfilled, (state, action) => {
        if (action.payload) state.promotions = [...state.promotions, action.payload];
        state.loading = false;
      })
      .addCase(createPromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updatePromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePromotion.fulfilled, (state, action) => {
        if (action.payload) {
          const idx = state.promotions.findIndex(p => p._id === action.payload._id);
          if (idx !== -1) state.promotions[idx] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updatePromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deletePromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePromotion.fulfilled, (state, action) => {
        if (action.payload) state.promotions = state.promotions.filter(p => p._id !== action.payload);
        state.loading = false;
      })
      .addCase(deletePromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default promotionSlice.reducer;
