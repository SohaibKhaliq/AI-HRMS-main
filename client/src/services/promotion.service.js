import toast from "react-hot-toast";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axios/axiosInstance";

// Fetch Promotions
export const getPromotions = createAsyncThunk(
  "promotion/getPromotions",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/promotions`);
      return data.promotions;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to fetch promotions"
      );
    }
  }
);

// Create Promotion
export const createPromotion = createAsyncThunk(
  "promotion/createPromotion",
  async (promotion, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.post(`/promotions`, promotion);
      toast.success(data.message);
      await dispatch(getPromotions());
      return;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to create promotion"
      );
    }
  }
);

// Update Promotion
export const updatePromotion = createAsyncThunk(
  "promotion/updatePromotion",
  async ({ id, promotion }, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.patch(`/promotions/${id}`, promotion);
      toast.success(data.message);
      await dispatch(getPromotions());
      return;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to update promotion"
      );
    }
  }
);

// Delete Promotion
export const deletePromotion = createAsyncThunk(
  "promotion/deletePromotion",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.delete(`/promotions/${id}`);
      toast.success(data.message);
      await dispatch(getPromotions());
      return;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to delete promotion"
      );
    }
  }
);
