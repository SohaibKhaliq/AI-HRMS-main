import toast from "react-hot-toast";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axios/axiosInstance";

// Get Leave Types
export const getLeaveTypes = createAsyncThunk(
  "leaveType/getLeaveTypes",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/leave-types`);
      return data.leaveTypes;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to fetch leave types"
      );
    }
  }
);

// Create Leave Type
export const createLeaveType = createAsyncThunk(
  "leaveType/createLeaveType",
  async (leaveTypeData, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.post(`/leave-types`, leaveTypeData);
      toast.success(data.message);
      const result = await dispatch(getLeaveTypes());
      return result.payload;
    } catch (error) {
      toast.error(error.response?.data.message || "Failed to create leave type");
      return rejectWithValue(
        error.response?.data.message || "Failed to create leave type"
      );
    }
  }
);

// Update Leave Type
export const updateLeaveType = createAsyncThunk(
  "leaveType/updateLeaveType",
  async ({ id, data: leaveTypeData }, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.patch(`/leave-types/${id}`, leaveTypeData);
      toast.success(data.message);
      const result = await dispatch(getLeaveTypes());
      return result.payload;
    } catch (error) {
      toast.error(error.response?.data.message || "Failed to update leave type");
      return rejectWithValue(
        error.response?.data.message || "Failed to update leave type"
      );
    }
  }
);

// Delete Leave Type
export const deleteLeaveType = createAsyncThunk(
  "leaveType/deleteLeaveType",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.delete(`/leave-types/${id}`);
      toast.success(data.message);
      const result = await dispatch(getLeaveTypes());
      return result.payload;
    } catch (error) {
      toast.error(error.response?.data.message || "Failed to delete leave type");
      return rejectWithValue(
        error.response?.data.message || "Failed to delete leave type"
      );
    }
  }
);
