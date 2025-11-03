import { createSlice } from "@reduxjs/toolkit";
import {
  getMyDocuments,
  getAllEmployeeDocuments,
  uploadEmployeeDocument,
  verifyDocument,
  rejectDocument,
  deleteEmployeeDocument,
} from "../services/employeeDocument.service";

const initialState = {
  myDocuments: [],
  allDocuments: [],
  loading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
  totalDocuments: 0,
};

const employeeDocumentSlice = createSlice({
  name: "employeeDocument",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get my documents
      .addCase(getMyDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.myDocuments = action.payload.documents || [];
        state.totalPages = action.payload.totalPages || 1;
        state.currentPage = action.payload.currentPage || 1;
        state.totalDocuments = action.payload.total || (action.payload.documents?.length || 0);
      })
      .addCase(getMyDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Get all documents
      .addCase(getAllEmployeeDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllEmployeeDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.allDocuments = action.payload.documents || [];
        state.totalPages = action.payload.totalPages || 1;
        state.currentPage = action.payload.currentPage || 1;
        state.totalDocuments = action.payload.total || (action.payload.documents?.length || 0);
      })
      .addCase(getAllEmployeeDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Upload document
      .addCase(uploadEmployeeDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadEmployeeDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.allDocuments = [action.payload.document, ...state.allDocuments];
      })
      .addCase(uploadEmployeeDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Verify document
      .addCase(verifyDocument.fulfilled, (state, action) => {
        const index = state.allDocuments.findIndex(doc => doc._id === action.payload.document._id);
        if (index !== -1) {
          state.allDocuments[index] = action.payload.document;
        }
        const myIndex = state.myDocuments.findIndex(doc => doc._id === action.payload.document._id);
        if (myIndex !== -1) {
          state.myDocuments[myIndex] = action.payload.document;
        }
      })

      // Reject document
      .addCase(rejectDocument.fulfilled, (state, action) => {
        const index = state.allDocuments.findIndex(doc => doc._id === action.payload.document._id);
        if (index !== -1) {
          state.allDocuments[index] = action.payload.document;
        }
        const myIndex = state.myDocuments.findIndex(doc => doc._id === action.payload.document._id);
        if (myIndex !== -1) {
          state.myDocuments[myIndex] = action.payload.document;
        }
      })

      // Delete document
      .addCase(deleteEmployeeDocument.fulfilled, (state, action) => {
        state.allDocuments = state.allDocuments.filter(
          doc => doc._id !== action.meta.arg
        );
        state.myDocuments = state.myDocuments.filter(
          doc => doc._id !== action.meta.arg
        );
      });
  },
});

export const { clearError } = employeeDocumentSlice.actions;
export default employeeDocumentSlice.reducer;
