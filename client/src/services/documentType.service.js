import toast from "react-hot-toast";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axios/axiosInstance";

// Fetch Document Types
export const getDocumentTypes = createAsyncThunk(
  "documentType/getDocumentTypes",
  async (status = null, { rejectWithValue }) => {
    try {
      const url = status
        ? `/document-types?status=${encodeURIComponent(status)}`
        : `/document-types`;
      const { data } = await axiosInstance.get(url);
      return data.documentTypes;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to fetch document types"
      );
    }
  }
);

// Create Document Type
export const createDocumentType = createAsyncThunk(
  "documentType/createDocumentType",
  async (docType, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.post(`/document-types`, docType);
      toast.success(data.message);
      await dispatch(getDocumentTypes());
      return;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to create document type"
      );
    }
  }
);

// Update Document Type
export const updateDocumentType = createAsyncThunk(
  "documentType/updateDocumentType",
  async ({ id, docType }, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.patch(
        `/document-types/${id}`,
        docType
      );
      toast.success(data.message);
      await dispatch(getDocumentTypes());
      return;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to update document type"
      );
    }
  }
);

// Delete Document Type
export const deleteDocumentType = createAsyncThunk(
  "documentType/deleteDocumentType",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.delete(`/document-types/${id}`);
      toast.success(data.message);
      await dispatch(getDocumentTypes());
      return;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to delete document type"
      );
    }
  }
);
