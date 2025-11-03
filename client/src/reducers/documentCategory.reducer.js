import { createSlice } from "@reduxjs/toolkit";
import {
  getDocumentCategories,
  createDocumentCategory,
  updateDocumentCategory,
  deleteDocumentCategory,
} from "../services/documentCategory.service";

const initialState = {
  categories: [],
  loading: false,
  error: null,
};

const documentCategorySlice = createSlice({
  name: "documentCategory",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all categories
      .addCase(getDocumentCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDocumentCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(getDocumentCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create category
      .addCase(createDocumentCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDocumentCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
      })
      .addCase(createDocumentCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update category
      .addCase(updateDocumentCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDocumentCategory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.categories.findIndex((cat) => cat._id === action.payload._id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(updateDocumentCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete category
      .addCase(deleteDocumentCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDocumentCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.filter((cat) => cat._id !== action.payload);
      })
      .addCase(deleteDocumentCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = documentCategorySlice.actions;
export default documentCategorySlice.reducer;
