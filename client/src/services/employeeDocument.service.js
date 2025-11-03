import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axios/axiosInstance";

// Get my documents (employee)
export const getMyDocuments = createAsyncThunk(
  "employeeDocument/getMyDocuments",
  async ({ category, status, page, limit }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (status) params.append("status", status);
      if (page) params.append("page", page);
      if (limit) params.append("limit", limit);

      const response = await axiosInstance.get(`/employee-documents/my?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get all employee documents (admin)
export const getAllEmployeeDocuments = createAsyncThunk(
  "employeeDocument/getAllEmployeeDocuments",
  async ({ employee, category, status, page, limit }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (employee) params.append("employee", employee);
      if (category) params.append("category", category);
      if (status) params.append("status", status);
      if (page) params.append("page", page);
      if (limit) params.append("limit", limit);

      const response = await axiosInstance.get(`/employee-documents?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Upload document (admin)
export const uploadEmployeeDocument = createAsyncThunk(
  "employeeDocument/uploadEmployeeDocument",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/employee-documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Verify document (admin)
export const verifyDocument = createAsyncThunk(
  "employeeDocument/verifyDocument",
  async ({ documentId, remarks }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/employee-documents/${documentId}/verify`, {
        remarks,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Reject document (admin)
export const rejectDocument = createAsyncThunk(
  "employeeDocument/rejectDocument",
  async ({ documentId, remarks }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/employee-documents/${documentId}/reject`, {
        remarks,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete document (admin)
export const deleteEmployeeDocument = createAsyncThunk(
  "employeeDocument/deleteEmployeeDocument",
  async (documentId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/employee-documents/${documentId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
