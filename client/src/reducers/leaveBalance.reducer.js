import { createSlice } from '@reduxjs/toolkit';
import {
  getMyLeaveBalances,
  getAllLeaveBalances,
  initializeLeaveBalance,
  adjustLeaveBalance,
  carryForwardBalances,
  getBalanceByEmployeeAndYear,
} from '../services/leaveBalance.service';

const initialState = {
  myBalances: [],
  allBalances: [],
  loading: false,
  error: null,
};

const leaveBalanceSlice = createSlice({
  name: 'leaveBalance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get my leave balances
    builder
      .addCase(getMyLeaveBalances.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyLeaveBalances.fulfilled, (state, action) => {
        state.loading = false;
        state.myBalances = action.payload;
      })
      .addCase(getMyLeaveBalances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get all leave balances
    builder
      .addCase(getAllLeaveBalances.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllLeaveBalances.fulfilled, (state, action) => {
        state.loading = false;
        state.allBalances = action.payload;
      })
      .addCase(getAllLeaveBalances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Initialize leave balance
    builder
      .addCase(initializeLeaveBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeLeaveBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.allBalances.push(...action.payload);
      })
      .addCase(initializeLeaveBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Adjust leave balance
    builder
      .addCase(adjustLeaveBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adjustLeaveBalance.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.allBalances.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
          state.allBalances[index] = action.payload;
        }
      })
      .addCase(adjustLeaveBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Carry forward balances
    builder
      .addCase(carryForwardBalances.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(carryForwardBalances.fulfilled, (state, action) => {
        state.loading = false;
        state.allBalances.push(...action.payload);
      })
      .addCase(carryForwardBalances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get balance by employee and year
    builder
      .addCase(getBalanceByEmployeeAndYear.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBalanceByEmployeeAndYear.fulfilled, (state, action) => {
        state.loading = false;
        state.allBalances = action.payload;
      })
      .addCase(getBalanceByEmployeeAndYear.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = leaveBalanceSlice.actions;
export default leaveBalanceSlice.reducer;
