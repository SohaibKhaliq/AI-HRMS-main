import toast from "react-hot-toast";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axios/axiosInstance";

// Fetch Resignations
export const getResignations = createAsyncThunk(
  "resignation/getResignations",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/resignations`);
      return data.resignations;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to fetch resignations"
      );
    }
  }
);

// Create Resignation
export const createResignation = createAsyncThunk(
  "resignation/createResignation",
  async (resignation, { rejectWithValue, dispatch }) => {
    try {
      const config = {};
      if (resignation instanceof FormData) {
        config.headers = { "Content-Type": "multipart/form-data" };
      }
      const { data } = await axiosInstance.post(`/resignations`, resignation, config);
      toast.success(data.message);
      const result = await dispatch(getResignations());
      return result.payload;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to create resignation"
      );
    }
  }
);

// Update Resignation
export const updateResignation = createAsyncThunk(
  "resignation/updateResignation",
  async ({ id, data: resignationData }, { rejectWithValue, dispatch }) => {
    try {
      const config = {};
      if (resignationData instanceof FormData) {
        config.headers = { "Content-Type": "multipart/form-data" };
      }
      const { data } = await axiosInstance.patch(`/resignations/${id}`, resignationData, config);
      toast.success(data.message);
      const result = await dispatch(getResignations());
      return result.payload;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to update resignation"
      );
    }
  }
);

// Delete Resignation
export const deleteResignation = createAsyncThunk(
  "resignation/deleteResignation",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.delete(`/resignations/${id}`);
      toast.success(data.message);
      const result = await dispatch(getResignations());
      return result.payload;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to delete resignation"
      );
    }
  }
);
