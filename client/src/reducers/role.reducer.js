import { createSlice } from "@reduxjs/toolkit";
import {
  createRole,
  getRoles,
  updateRole,
  deleteRole,
} from "../services/role.service";

const initialState = {
  roles: [],
  loading: false,
  error: null,
};

const roleSlice = createSlice({
  name: "role",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // helper to extract a readable message from rejected action payloads
    const extractErrorMessage = (payload, defaultMsg) => {
      if (!payload) return defaultMsg || "Something went wrong";
      if (typeof payload === "string") return payload;
      if (payload.message) return payload.message;
      if (payload.error) return payload.error;
      try {
        return JSON.stringify(payload);
      } catch {
        return defaultMsg || "Something went wrong";
      }
    };
    builder
      // Handling the getRoles action
      .addCase(getRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRoles.fulfilled, (state, action) => {
        state.roles = action.payload;
        state.loading = false;
      })
      .addCase(getRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = extractErrorMessage(
          action.payload,
          action.error?.message || "Failed to fetch roles"
        );
      })

      // Handling the updateDepartment action
      .addCase(updateRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        const updatedRoles = [...state.roles];
        console.log(action.payload);
        const findIndex = updatedRoles.findIndex(
          (role) => role._id === action.payload._id
        );
        if (findIndex !== -1) {
          updatedRoles[findIndex] = action.payload;
          state.roles = updatedRoles;
        }
        state.loading = false;
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.loading = false;
        state.error = extractErrorMessage(
          action.payload,
          action.error?.message || "Failed to update role"
        );
      })

      // Handling the createRole action
      .addCase(createRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.roles = [...state.roles, action.payload];
        state.loading = false;
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loading = false;
        state.error = extractErrorMessage(
          action.payload,
          action.error?.message || "Failed to create role"
        );
      });

    // deleteRole
    builder
      .addCase(deleteRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.roles = state.roles.filter((r) => r._id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.loading = false;
        state.error = extractErrorMessage(
          action.payload,
          action.error?.message || "Failed to delete role"
        );
      });
  },
});

export default roleSlice.reducer;
