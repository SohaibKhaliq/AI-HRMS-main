import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authentication from "../reducers/authentication.reducer";
import role from "../reducers/role.reducer";
import employee from "../reducers/employee.reducer";
import department from "../reducers/department.reducer";
import designation from "../reducers/designation.reducer";
import documentType from "../reducers/documentType.reducer";
import promotion from "../reducers/promotion.reducer";
import resignation from "../reducers/resignation.reducer";
import termination from "../reducers/termination.reducer";
import insight from "../reducers/inshights.reducer";
import attendance from "../reducers/attendance.reducer";
import leave from "../reducers/leave.reducer";
import feedback from "../reducers/feedback.reducer";
import complaint from "../reducers/complaint.reducer";
import update from "../reducers/update.reducer";
import performance from "../reducers/performance.reducer";
import payroll from "../reducers/payroll.reducer";
import recruitment from "../reducers/recruitment.reducer";

// Combine reducers
const rootReducer = combineReducers({
  role,
  update,
  leave,
  insight,
  payroll,
  employee,
  feedback,
  complaint,
  department,
  designation,
  documentType,
  promotion,
  resignation,
  termination,
  attendance,
  performance,
  recruitment,
  authentication,
});

// Configure the store
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: import.meta.env.VITE_ENV !== "production",
});

export default store;
