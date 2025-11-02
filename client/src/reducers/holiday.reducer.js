import { createSlice } from "@reduxjs/toolkit";
import {
  createHoliday,
  getHolidays,
  getHolidayById,
  updateHoliday,
  deleteHoliday,
} from "../services/holiday.service";

const initialState = {
  holidays: [],
  selectedHoliday: null,
  loading: false,
  error: null,
  pagination: null,
  fetch: true,
};

const holidaysSlice = createSlice({
  name: "holidays",
  initialState,
  reducers: {
    setFetchFlag: (state, action) => {
      state.fetch = action.payload;
    },
    clearSelectedHoliday: (state) => {
      state.selectedHoliday = null;
    },
  },
  extraReducers: (builder) => {
    // Handle getHolidays action
    builder
      .addCase(getHolidays.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getHolidays.fulfilled, (state, action) => {
        state.fetch = false;
        state.loading = false;
        state.holidays = action.payload.holidays;
        state.pagination = action.payload.pagination;
      })
      .addCase(getHolidays.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Handle getHolidayById action
    builder
      .addCase(getHolidayById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getHolidayById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedHoliday = action.payload;
      })
      .addCase(getHolidayById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Handle createHoliday action
    builder
      .addCase(createHoliday.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHoliday.fulfilled, (state, action) => {
        state.loading = false;
        state.holidays.push(action.payload);
        state.fetch = true;
      })
      .addCase(createHoliday.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Handle updateHoliday action
    builder
      .addCase(updateHoliday.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHoliday.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.holidays.findIndex(
          (holiday) => holiday._id === action.payload._id
        );
        if (index !== -1) {
          state.holidays[index] = action.payload;
        }
        state.fetch = true;
      })
      .addCase(updateHoliday.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Handle deleteHoliday action
    builder
      .addCase(deleteHoliday.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteHoliday.fulfilled, (state, action) => {
        state.loading = false;
        state.holidays = state.holidays.filter(
          (holiday) => holiday._id !== action.payload
        );
        state.fetch = true;
      })
      .addCase(deleteHoliday.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFetchFlag, clearSelectedHoliday } = holidaysSlice.actions;
export default holidaysSlice.reducer;
