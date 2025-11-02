import toast from "react-hot-toast";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axios/axiosInstance";

// Generic helpers
const listThunk = (name, path) =>
  createAsyncThunk(`${name}/list`, async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/recruitment/${path}`);
      return data.items || data[name] || data[path] || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || `Failed to fetch ${name}`);
    }
  });

const createThunk = (name, path) =>
  createAsyncThunk(`${name}/create`, async (payload, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.post(`/recruitment/${path}`, payload);
      toast.success(data.message || `Created ${name.slice(0, -1)}`);
      await dispatch(thunks[name].list());
      return data.item || data[name.slice(0, -1)] || data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || `Failed to create ${name.slice(0, -1)}`);
    }
  });

const updateThunk = (name, path) =>
  createAsyncThunk(`${name}/update`, async ({ id, payload }, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.patch(`/recruitment/${path}/${id}`, payload);
      toast.success(data.message || `Updated ${name.slice(0, -1)}`);
      await dispatch(thunks[name].list());
      return data.item || data[name.slice(0, -1)] || data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || `Failed to update ${name.slice(0, -1)}`);
    }
  });

const removeThunk = (name, path) =>
  createAsyncThunk(`${name}/remove`, async (id, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.delete(`/recruitment/${path}/${id}`);
      toast.success(data.message || `Deleted ${name.slice(0, -1)}`);
      await dispatch(thunks[name].list());
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || `Failed to delete ${name.slice(0, -1)}`);
    }
  });

// Define thunks for categories, types, locations
export const thunks = {
  categories: {
    list: listThunk("categories", "categories"),
    create: createThunk("categories", "categories"),
    update: updateThunk("categories", "categories"),
    remove: removeThunk("categories", "categories"),
  },
  types: {
    list: listThunk("types", "types"),
    create: createThunk("types", "types"),
    update: updateThunk("types", "types"),
    remove: removeThunk("types", "types"),
  },
  locations: {
    list: listThunk("locations", "locations"),
    create: createThunk("locations", "locations"),
    update: updateThunk("locations", "locations"),
    remove: removeThunk("locations", "locations"),
  },
};

export const {
  categories: { list: getJobCategories, create: createJobCategory, update: updateJobCategory, remove: deleteJobCategory },
  types: { list: getJobTypes, create: createJobType, update: updateJobType, remove: deleteJobType },
  locations: { list: getJobLocations, create: createJobLocation, update: updateJobLocation, remove: deleteJobLocation },
} = thunks;
