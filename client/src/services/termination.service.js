import toast from "react-hot-toast";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axios/axiosInstance";

// Fetch Terminations
export const getTerminations = createAsyncThunk(
  "termination/getTerminations",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/terminations`);
      return data.terminations;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to fetch terminations"
      );
    }
  }
);

// Create Termination
export const createTermination = createAsyncThunk(
  "termination/createTermination",
  async (termination, { rejectWithValue, dispatch }) => {
    try {
      const config = {};
      if (termination instanceof FormData) {
        config.headers = { "Content-Type": "multipart/form-data" };
      }
      const { data } = await axiosInstance.post(`/terminations`, termination, config);
      toast.success(data.message);
      const result = await dispatch(getTerminations());
      return result.payload;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to create termination"
      );
    }
  }
);

// Update Termination
export const updateTermination = createAsyncThunk(
  "termination/updateTermination",
  async ({ id, data: terminationData }, { rejectWithValue, dispatch }) => {
    try {
      const config = {};
      if (terminationData instanceof FormData) {
        config.headers = { "Content-Type": "multipart/form-data" };
      }
      const { data } = await axiosInstance.patch(`/terminations/${id}`, terminationData, config);
      toast.success(data.message);
      const result = await dispatch(getTerminations());
      return result.payload;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to update termination"
      );
    }
  }
);

// Delete Termination
export const deleteTermination = createAsyncThunk(
  "termination/deleteTermination",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.delete(`/terminations/${id}`);
      toast.success(data.message);
      const result = await dispatch(getTerminations());
      return result.payload;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to delete termination"
      );
    }
  }
);
