import toast from "react-hot-toast";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axios/axiosInstance";

// Fetch Designations
export const getDesignations = createAsyncThunk(
  "designation/getDesignations",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/designations`);
      return data.designations;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to fetch designations"
      );
    }
  }
);

// Create Designation
export const createDesignation = createAsyncThunk(
  "designation/createDesignation",
  async (designation, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.post(`/designations`, designation);
      toast.success(data.message);
      await dispatch(getDesignations());
      // do not return the created entity to avoid duplicate insertion in reducer
      return;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to create designation"
      );
    }
  }
);

// Update Designation
export const updateDesignation = createAsyncThunk(
  "designation/updateDesignation",
  async ({ id, designation }, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.patch(`/designations/${id}`, designation);
      toast.success(data.message);
      await dispatch(getDesignations());
      // list refreshed; don't return payload to avoid reducer double-update
      return;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to update designation"
      );
    }
  }
);

// Delete Designation
export const deleteDesignation = createAsyncThunk(
  "designation/deleteDesignation",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.delete(`/designations/${id}`);
      toast.success(data.message);
      await dispatch(getDesignations());
      // list refreshed; don't return id to reducer
      return;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to delete designation"
      );
    }
  }
);
