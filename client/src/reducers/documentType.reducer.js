import { createSlice } from "@reduxjs/toolkit";
import { getDocumentTypes, createDocumentType, updateDocumentType, deleteDocumentType } from "../services/documentType.service";

const initialState = {
  documentTypes: [],
  loading: false,
  error: null,
};

const documentTypeSlice = createSlice({
  name: "documentType",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getDocumentTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDocumentTypes.fulfilled, (state, action) => {
        state.documentTypes = action.payload;
        state.loading = false;
      })
      .addCase(getDocumentTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createDocumentType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDocumentType.fulfilled, (state, action) => {
        if (action.payload) state.documentTypes = [...state.documentTypes, action.payload];
        state.loading = false;
      })
      .addCase(createDocumentType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateDocumentType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDocumentType.fulfilled, (state, action) => {
        if (action.payload) {
          const idx = state.documentTypes.findIndex(d => d._id === action.payload._id);
          if (idx !== -1) state.documentTypes[idx] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateDocumentType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteDocumentType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDocumentType.fulfilled, (state, action) => {
        if (action.payload) state.documentTypes = state.documentTypes.filter(d => d._id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteDocumentType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default documentTypeSlice.reducer;
