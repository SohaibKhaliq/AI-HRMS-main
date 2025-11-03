import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axios/axiosInstance";

// Get all document categories
export const getDocumentCategories = createAsyncThunk(
  "documentCategory/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/document-categories");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch document categories"
      );
    }
  }
);

// Create document category
export const createDocumentCategory = createAsyncThunk(
  "documentCategory/create",
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/document-categories", categoryData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create document category"
      );
    }
  }
);

// Update document category
export const updateDocumentCategory = createAsyncThunk(
  "documentCategory/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/document-categories/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update document category"
      );
    }
  }
);

// Delete document category
export const deleteDocumentCategory = createAsyncThunk(
  "documentCategory/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/document-categories/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete document category"
      );
    }
  }
);
