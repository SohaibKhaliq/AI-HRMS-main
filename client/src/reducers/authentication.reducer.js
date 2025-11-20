import { createSlice } from "@reduxjs/toolkit";
import {
  login,
  verifyOtp,
  logout,
  logoutAll,
  resetPassword,
  updatePassword,
  forgetPassword,
} from "../services/authentication.service";

function remember() {
  return localStorage.getItem("remember") === "true";
}

const initialState = {
  user: remember()
    ? JSON.parse(localStorage.getItem("loggedInUser"))
    : JSON.parse(sessionStorage.getItem("loggedInUser")) || null,
  loading: false,
  loginError: null,
  otpStep: {
    required: false,
    employeeId: null,
    authority: null,
  },
  forgetPasswordError: null,
  updatePasswordError: null,
  resetPasswordError: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateProfileState: (state, action) => {
      state.loading = false;
      state.user = action.payload;

      if (remember()) {
        localStorage.setItem("loggedInUser", JSON.stringify(action.payload));
      } else {
        sessionStorage.setItem("loggedInUser", JSON.stringify(action.payload));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Handling login
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        // On startLogin success we will get employeeId and message
        state.loading = false;
        // When the backend returns an employee object, treat it like a full login
        if (action.payload && action.payload._id) {
          state.user = action.payload;
        } else {
          state.otpStep.required = true;
          state.otpStep.employeeId = action.payload?.employeeId || null;
          state.otpStep.authority = action.payload?.authority || null;
        }
        state.loginError = null;
      })
            // Verify OTP
            .addCase(verifyOtp.pending, (state) => {
              state.loading = true;
            })
            .addCase(verifyOtp.fulfilled, (state, action) => {
              state.loading = false;
              state.user = action.payload;
              state.otpStep.required = false;
              state.otpStep.employeeId = null;
              state.loginError = null;
            })
            .addCase(verifyOtp.rejected, (state, action) => {
              state.loading = false;
              state.loginError = action.payload;
            })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.loginError = action.payload;
        state.otpStep.required = false;
        state.otpStep.employeeId = null;
        state.otpStep.authority = null;
      })

      // Handling Forget Password
      .addCase(forgetPassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(forgetPassword.fulfilled, (state) => {
        state.loading = false;
        state.forgetPasswordError = null;
      })
      .addCase(forgetPassword.rejected, (state, action) => {
        state.loading = false;
        state.forgetPasswordError = action.payload;
      })

      // Handling updatePassword
      .addCase(updatePassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.loading = false;
        state.updatePasswordError = null;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false;
        state.updatePasswordError = action.payload;
      })

      // Handling resetPassword
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.resetPasswordError = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.resetPasswordError = action.payload;
      })

      // Handling logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;

        if (remember()) {
          localStorage.removeItem("session");
          localStorage.removeItem("loggedInUser");
          localStorage.removeItem("remember");
        } else {
          sessionStorage.removeItem("session");
          sessionStorage.removeItem("loggedInUser");
        }
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handling logoutAll
      .addCase(logoutAll.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutAll.fulfilled, (state) => {
        state.loading = false;
        state.user = null;

        if (remember()) {
          localStorage.removeItem("session");
          localStorage.removeItem("loggedInUser");
          localStorage.removeItem("remember");
        } else {
          sessionStorage.removeItem("session");
          sessionStorage.removeItem("loggedInUser");
        }

        localStorage.setItem("logout", Date.now());
      })
      .addCase(logoutAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default authSlice.reducer;
export const { updateProfileState } = authSlice.actions;
