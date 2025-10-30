import toast from "react-hot-toast";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axios/axiosInstance";

// Fetch Departments
export const getDepartments = createAsyncThunk(
  "department/getDepartments",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/departments`);
      return data.department;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to fetch departments"
      );
    }
  }
);

// Fetch Head
export const getAllEmployeesForHead = createAsyncThunk(
  "department/getAllEmployeesForHead",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/departments/head`);
      return data.employees;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to fetch heads"
      );
    }
  }
);

// Update Department
export const updateDepartment = createAsyncThunk(
  "department/updateDepartment",
  async ({ id, department }, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.patch(
        `/departments/${id}`,
        department
      );
      toast.success(data.message);
      // refresh departments list to ensure createdAt and other server-side changes are reflected
      dispatch(getDepartments());
      return data.department;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to update department"
      );
    }
  }
);

// Create Department
export const createDepartment = createAsyncThunk(
  "department/createDepartment",
  async (department, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.post(`/departments`, department);
      toast.success(data.message);
      // refresh full list
      dispatch(getDepartments());
      return data.department;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to create department"
      );
    }
  }
);

// Delete Department
export const deleteDepartment = createAsyncThunk(
  "department/deleteDepartment",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.delete(`/departments/${id}`);
      toast.success(data.message);
      // refresh list
      dispatch(getDepartments());
      // return the deleted id so reducer can remove it from state
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to delete department"
      );
    }
  }
);
