import toast from "react-hot-toast";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axios/axiosInstance";

// Generate payrolls for a specific month (admin)
export const generatePayrollForMonth = createAsyncThunk(
  "payroll/generateForMonth",
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`/payrolls/generate-month`, {
        month,
        year,
      });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to generate payrolls for month"
      );
    }
  }
);

// Fetch Payroll
export const getAllPayrolls = createAsyncThunk(
  "payroll/getAllPayrolls",
  async ({ currentPage, month, year, isPaid }, { rejectWithValue }) => {
    try {
      const params = {};
      if (month !== undefined && month !== null && month !== "")
        params.month = month;
      if (year !== undefined && year !== null && year !== "")
        params.year = year;
      // only include isPaid when explicitly provided ('' means all)
      if (isPaid !== undefined && isPaid !== "") params.isPaid = isPaid;
      params.page = currentPage;

      const queryParams = new URLSearchParams(params).toString();

      const { data } = await axiosInstance.get(`/payrolls?${queryParams}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to fetch payroll"
      );
    }
  }
);

// Mark Payroll Pais
export const markAsPaid = createAsyncThunk(
  "payroll/markAsPaid",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`/payrolls/${id}/pay`);
      toast.success(data.message);
      return data.payroll;
    } catch (error) {
      toast.error(error.response.data.message);
      return rejectWithValue(
        error.response?.data.message || "Failed to mark payroll"
      );
    }
  }
);

// Update Payroll
export const updatePayroll = createAsyncThunk(
  "payroll/updatePayroll",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`/payrolls/${id}`, formData);
      toast.success(data.message);
      return data.payroll;
    } catch (error) {
      toast.error(error.response.data.message);
      return rejectWithValue(
        error.response?.data.message || "Failed to update payroll"
      );
    }
  }
);
