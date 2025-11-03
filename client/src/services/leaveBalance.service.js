import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../axios/axiosInstance';

// Get my leave balances (employee)
export const getMyLeaveBalances = createAsyncThunk(
  'leaveBalance/getMyLeaveBalances',
  async ({ year }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/leave-balances/my?year=${year}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leave balances');
    }
  }
);

// Get all leave balances (admin)
export const getAllLeaveBalances = createAsyncThunk(
  'leaveBalance/getAllLeaveBalances',
  async ({ employee, year, leaveType }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (employee) params.append('employee', employee);
      if (year) params.append('year', year);
      if (leaveType) params.append('leaveType', leaveType);
      
      const response = await axiosInstance.get(`/leave-balances?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leave balances');
    }
  }
);

// Initialize leave balance (admin)
export const initializeLeaveBalance = createAsyncThunk(
  'leaveBalance/initializeLeaveBalance',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/leave-balances/initialize', data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to initialize leave balance');
    }
  }
);

// Adjust leave balance (admin)
export const adjustLeaveBalance = createAsyncThunk(
  'leaveBalance/adjustLeaveBalance',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/leave-balances/adjust', data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to adjust leave balance');
    }
  }
);

// Carry forward balances (admin)
export const carryForwardBalances = createAsyncThunk(
  'leaveBalance/carryForwardBalances',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/leave-balances/carry-forward', data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to carry forward balances');
    }
  }
);

// Get balance by employee and year (admin)
export const getBalanceByEmployeeAndYear = createAsyncThunk(
  'leaveBalance/getBalanceByEmployeeAndYear',
  async ({ employee, year }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/leave-balances?employee=${employee}&year=${year}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employee balance');
    }
  }
);

export default {
  getMyLeaveBalances,
  getAllLeaveBalances,
  initializeLeaveBalance,
  adjustLeaveBalance,
  carryForwardBalances,
  getBalanceByEmployeeAndYear,
};
