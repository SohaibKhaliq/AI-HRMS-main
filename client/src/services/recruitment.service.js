import axios from "axios";
import { getToken } from "../utils";
import toast from "react-hot-toast";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axios/axiosInstance";

// Create Job
export const createJob = createAsyncThunk(
  "recruitment/createJob",
  async (job, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/recruitment", job);
      toast.success(data.message);
      return data.job;
    } catch (error) {
      toast.error(error.response.data.message);
      return rejectWithValue(
        error.response?.data.message || "Failed to create job"
      );
    }
  }
);

// Update Job
export const updateJob = createAsyncThunk(
  "recruitment/updateJob",
  async ({ id, job }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(
        `/recruitment/${id}/status`,
        job
      );
      toast.success(data.message);
      return data.job;
    } catch (error) {
      toast.error(error.response.data.message);
      return rejectWithValue(
        error.response?.data.message || "Failed to update jobs"
      );
    }
  }
);

// Create Job Application
export const createJobApplication = createAsyncThunk(
  "recruitment/createJobApplication",
  async ({ jobId, application }, { rejectWithValue }) => {
    try {
      // Public endpoint: using axios directly for multipart/form-data
      const baseURL = import.meta.env.VITE_URL || "http://localhost:3000";
      const { data } = await axios.post(
        `${baseURL}/api/recruitment/${jobId}/apply`,
        application,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(data.message);
      return data.application;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create application");
      return rejectWithValue(
        error.response?.data.message || "Failed to create application"
      );
    }
  }
);

// Update Application
export const updateApplication = createAsyncThunk(
  "recruitment/updateApplication",
  async ({ jobId, applicantId, application }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(
        `/recruitment/${jobId}/applicants/${applicantId}/status`,
        application
      );
      toast.success(data.message);
      return data.applicant;
    } catch (error) {
      toast.error(error.response.data.message);
      return rejectWithValue(
        error.response?.data.message || "Failed to update application"
      );
    }
  }
);

// Fetch Job Openings
export const getJobOpenings = createAsyncThunk(
  "recruitment/getJobPenings",
  async ({ status, deadline }, { rejectWithValue }) => {
    const queryParams = new URLSearchParams({
      status: status || "",
      deadline: deadline || "",
    }).toString();

    try {
      const { data } = await axiosInstance.get(`/recruitment?${queryParams}`);
      return data.jobs;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to fetch job openings"
      );
    }
  }
);

// Fetch Applicants
export const getJobApplicants = createAsyncThunk(
  "recruitment/getJobApplicants",
  async ({ status, jobId }, { rejectWithValue }) => {
    const queryParams = new URLSearchParams({
      status: status || "",
    }).toString();

    try {
      const { data } = await axiosInstance.get(
        `/recruitment/${jobId}/applicants?${queryParams}`
      );
      return data.applicants;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "Failed to fetch applicntst"
      );
    }
  }
);

// Create Job
export const inviteForInterview = createAsyncThunk(
  "recruitment/inviteForInterview",
  async ({ jobId, interviewDetails, applicationId }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        `/recruitment/${jobId}/applicants/${applicationId}/invite`,
        interviewDetails
      );
      toast.success(data.message);
      return data.applicant;
    } catch (error) {
      toast.error(error.response.data.message);
      return rejectWithValue(
        error.response?.data.message || "Failed to invite for interview"
      );
    }
  }
);
