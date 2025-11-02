import { createSlice } from "@reduxjs/toolkit";
import {
  getJobCategories,
  createJobCategory,
  updateJobCategory,
  deleteJobCategory,
  getJobTypes,
  createJobType,
  updateJobType,
  deleteJobType,
  getJobLocations,
  createJobLocation,
  updateJobLocation,
  deleteJobLocation,
} from "../services/jobmeta.service";

const initialListState = { items: [], loading: false, error: null };

const initialState = {
  categories: { ...initialListState },
  types: { ...initialListState },
  locations: { ...initialListState },
};

const setPending = (slice) => {
  slice.loading = true;
  slice.error = null;
};
const setRejected = (slice, action) => {
  slice.loading = false;
  slice.error = action.payload;
};

const jobmetaSlice = createSlice({
  name: "jobmeta",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Categories
    builder
      .addCase(getJobCategories.pending, (state) => setPending(state.categories))
      .addCase(getJobCategories.fulfilled, (state, action) => {
        state.categories.items = action.payload;
        state.categories.loading = false;
      })
      .addCase(getJobCategories.rejected, (state, action) => setRejected(state.categories, action))
      .addCase(createJobCategory.pending, (state) => setPending(state.categories))
      .addCase(createJobCategory.fulfilled, (state) => {
        state.categories.loading = false;
      })
      .addCase(createJobCategory.rejected, (state, action) => setRejected(state.categories, action))
      .addCase(updateJobCategory.pending, (state) => setPending(state.categories))
      .addCase(updateJobCategory.fulfilled, (state) => {
        state.categories.loading = false;
      })
      .addCase(updateJobCategory.rejected, (state, action) => setRejected(state.categories, action))
      .addCase(deleteJobCategory.pending, (state) => setPending(state.categories))
      .addCase(deleteJobCategory.fulfilled, (state) => {
        state.categories.loading = false;
      })
      .addCase(deleteJobCategory.rejected, (state, action) => setRejected(state.categories, action));

    // Types
    builder
      .addCase(getJobTypes.pending, (state) => setPending(state.types))
      .addCase(getJobTypes.fulfilled, (state, action) => {
        state.types.items = action.payload;
        state.types.loading = false;
      })
      .addCase(getJobTypes.rejected, (state, action) => setRejected(state.types, action))
      .addCase(createJobType.pending, (state) => setPending(state.types))
      .addCase(createJobType.fulfilled, (state) => {
        state.types.loading = false;
      })
      .addCase(createJobType.rejected, (state, action) => setRejected(state.types, action))
      .addCase(updateJobType.pending, (state) => setPending(state.types))
      .addCase(updateJobType.fulfilled, (state) => {
        state.types.loading = false;
      })
      .addCase(updateJobType.rejected, (state, action) => setRejected(state.types, action))
      .addCase(deleteJobType.pending, (state) => setPending(state.types))
      .addCase(deleteJobType.fulfilled, (state) => {
        state.types.loading = false;
      })
      .addCase(deleteJobType.rejected, (state, action) => setRejected(state.types, action));

    // Locations
    builder
      .addCase(getJobLocations.pending, (state) => setPending(state.locations))
      .addCase(getJobLocations.fulfilled, (state, action) => {
        state.locations.items = action.payload;
        state.locations.loading = false;
      })
      .addCase(getJobLocations.rejected, (state, action) => setRejected(state.locations, action))
      .addCase(createJobLocation.pending, (state) => setPending(state.locations))
      .addCase(createJobLocation.fulfilled, (state) => {
        state.locations.loading = false;
      })
      .addCase(createJobLocation.rejected, (state, action) => setRejected(state.locations, action))
      .addCase(updateJobLocation.pending, (state) => setPending(state.locations))
      .addCase(updateJobLocation.fulfilled, (state) => {
        state.locations.loading = false;
      })
      .addCase(updateJobLocation.rejected, (state, action) => setRejected(state.locations, action))
      .addCase(deleteJobLocation.pending, (state) => setPending(state.locations))
      .addCase(deleteJobLocation.fulfilled, (state) => {
        state.locations.loading = false;
      })
      .addCase(deleteJobLocation.rejected, (state, action) => setRejected(state.locations, action));
  },
});

export default jobmetaSlice.reducer;
