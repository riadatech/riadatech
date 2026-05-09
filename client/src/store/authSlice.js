import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import httpClient from "../api/httpClient";

const AUTH_STORAGE_KEY = "riadatach-auth-user";

function readStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    return null;
  }
}

function persistUser(user) {
  if (typeof window === "undefined") {
    return;
  }

  if (user) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await httpClient.post("/api/auth/register", payload);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Registration could not be completed."
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await httpClient.post("/api/auth/login", payload);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Login could not be completed."
      );
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  try {
    await httpClient.post("/api/auth/logout");
  } catch (error) {
    // Client state is still cleared even if the optional logout endpoint is unavailable.
  }

  return null;
});

const initialUser = readStoredUser();

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: initialUser,
    isAuthenticated: Boolean(initialUser),
    status: "idle",
    error: "",
  },
  reducers: {
    clearAuthError(state) {
      state.error = "";
      if (state.status === "failed") {
        state.status = "idle";
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = "";
        persistUser(action.payload);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Registration failed.";
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = "";
        persistUser(action.payload);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Login failed.";
      })
      .addCase(logoutUser.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = "idle";
        state.user = null;
        state.isAuthenticated = false;
        state.error = "";
        persistUser(null);
      })
      .addCase(logoutUser.rejected, (state) => {
        state.status = "idle";
        state.user = null;
        state.isAuthenticated = false;
        state.error = "";
        persistUser(null);
      });
  },
});

export const { clearAuthError } = authSlice.actions;

export default authSlice.reducer;
