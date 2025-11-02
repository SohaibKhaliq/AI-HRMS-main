import toast from "react-hot-toast";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axios/axiosInstance";

// Generic helpers
const listThunk = (name, path) =>
  createAsyncThunk(`jobmeta/${name}/list`, async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/recruitment/${path}`);
      return data.items || data[name] || data[path] || [];
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to fetch ${name}`);
      return rejectWithValue(error.response?.data?.message || `Failed to fetch ${name}`);
    }
  });

const createThunk = (name, path, listAction) =>
  createAsyncThunk(`jobmeta/${name}/create`, async (payload, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.post(`/recruitment/${path}`, payload);
      toast.success(data.message || `Created successfully`);
      // Refresh the list after creation
      if (listAction) {
        dispatch(listAction());
      }
      return data.item || data[name.slice(0, -1)] || data;
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to create ${name.slice(0, -1)}`);
      return rejectWithValue(error.response?.data?.message || `Failed to create ${name.slice(0, -1)}`);
    }
  });

const updateThunk = (name, path, listAction) =>
  createAsyncThunk(`jobmeta/${name}/update`, async ({ id, payload }, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.patch(`/recruitment/${path}/${id}`, payload);
      toast.success(data.message || `Updated successfully`);
      // Refresh the list after update
      if (listAction) {
        dispatch(listAction());
      }
      return data.item || data[name.slice(0, -1)] || data;
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to update ${name.slice(0, -1)}`);
      return rejectWithValue(error.response?.data?.message || `Failed to update ${name.slice(0, -1)}`);
    }
  });

const removeThunk = (name, path, listAction) =>
  createAsyncThunk(`jobmeta/${name}/remove`, async (id, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.delete(`/recruitment/${path}/${id}`);
      toast.success(data.message || `Deleted successfully`);
      // Refresh the list after deletion
      if (listAction) {
        dispatch(listAction());
      }
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to delete ${name.slice(0, -1)}`);
      return rejectWithValue(error.response?.data?.message || `Failed to delete ${name.slice(0, -1)}`);
    }
  });

// Create list actions first
export const getJobCategories = listThunk("categories", "categories");
export const getJobTypes = listThunk("types", "types");
export const getJobLocations = listThunk("locations", "locations");

// Create mutation actions with list references
export const createJobCategory = createThunk("categories", "categories", getJobCategories);
export const updateJobCategory = updateThunk("categories", "categories", getJobCategories);
export const deleteJobCategory = removeThunk("categories", "categories", getJobCategories);

export const createJobType = createThunk("types", "types", getJobTypes);
export const updateJobType = updateThunk("types", "types", getJobTypes);
export const deleteJobType = removeThunk("types", "types", getJobTypes);

export const createJobLocation = createThunk("locations", "locations", getJobLocations);
export const updateJobLocation = updateThunk("locations", "locations", getJobLocations);
export const deleteJobLocation = removeThunk("locations", "locations", getJobLocations);
