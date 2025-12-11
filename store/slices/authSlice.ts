import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient, ApiError } from "@/lib/api/client";

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isChecked: boolean;
  error: string | null;
  isConnecting: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isChecked: false,
  error: null,
  isConnecting: false,
};

// Register
export const register = createAsyncThunk(
  "auth/register",
  async (userData: {
    username: string;
    email: string;
    password: string;
    password2: string;
    first_name?: string;
    last_name?: string;
  }, { rejectWithValue }) => {
    try {
      // Step 1: Register the user
      await apiClient.post("/auth/register/", userData, { skipCredentials: true });

      // Step 2: Auto-login after registration
      // Note: Don't skip credentials for login - we need cookies to be set
      try {
        await apiClient.post("/auth/login/", {
          username: userData.username,
          password: userData.password,
        }, { skipCredentials: false });

        // Small delay to ensure cookies are set (especially for iOS)
        await new Promise(resolve => setTimeout(resolve, 100));

        const user = await apiClient.get<User>("/auth/me/");
        return user;
      } catch (loginError) {
        // Registration succeeded but login failed
        if (loginError instanceof ApiError) {
          // Check if it's a cookie/authentication issue (common on iOS)
          if (loginError.status === 401 && loginError.message.toLowerCase().includes("credentials were not provided")) {
            return rejectWithValue(
              "Account created successfully, but automatic login failed. This may be due to cookie restrictions on your device. Please try logging in manually."
            );
          }
          return rejectWithValue(
            "Account created successfully, but automatic login failed. Please try logging in manually."
          );
        }
        return rejectWithValue("Account created, but login failed. Please try logging in.");
      }
    } catch (error) {
      // Registration failed
      if (error instanceof ApiError) {
        if (error.code === "NETWORK_ERROR" || error.code === "TIMEOUT") {
          return rejectWithValue(error.message);
        }
        // Handle validation errors from backend
        if (error.status === 400) {
          return rejectWithValue(error.message || "Validation error. Please check your input.");
        }
        if (error.status === 500) {
          return rejectWithValue("Server error during registration. Please try again.");
        }
        return rejectWithValue(error.message || "Registration failed. Please check your information.");
      }
      return rejectWithValue("An unexpected error occurred during registration.");
    }
  }
);

// Login
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: { username: string; password: string }, { rejectWithValue }) => {
    try {
      await apiClient.post("/auth/login/", credentials);

      // Small delay to ensure cookies are set (especially important for iOS Safari)
      await new Promise(resolve => setTimeout(resolve, 100));

      const user = await apiClient.get<User>("/auth/me/");
      return user;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === "NETWORK_ERROR" || error.code === "TIMEOUT") {
          return rejectWithValue(error.message);
        }
        // For 401 errors, check if it's missing credentials or invalid credentials
        if (error.status === 401) {
          // If the error message indicates missing credentials, show that
          if (error.message && error.message.toLowerCase().includes("credentials were not provided")) {
            // Check if we're on iOS (common cookie blocking issue)
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            if (isIOS) {
              return rejectWithValue(
                "Authentication failed. This may be due to cookie restrictions on iOS. Please ensure cookies are enabled in Safari settings and try again."
              );
            }
            return rejectWithValue("Please log in to continue.");
          }
          // Otherwise, it's likely invalid credentials during login
          return rejectWithValue(error.message || "Invalid username or password. Please try again.");
        }
        return rejectWithValue(error.message || "Login failed. Please try again.");
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

// Logout
export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await apiClient.post("/auth/logout/");
  } catch (error) {
    // Ignore logout errors
  }
  return null;
});

// Check if user is logged in (on page refresh)
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const user = await apiClient.get<User>("/auth/me/");
      return user;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401 || error.status === 403) {
          // Check if we're on iOS (common cookie blocking issue)
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          if (isIOS && error.message && error.message.toLowerCase().includes("credentials were not provided")) {
            return rejectWithValue(
              "Authentication failed. This may be due to cookie restrictions on iOS. Please ensure cookies are enabled in Safari settings."
            );
          }
          return rejectWithValue("Not authenticated");
        }
        if (error.code === "NETWORK_ERROR" || error.code === "TIMEOUT") {
          return rejectWithValue(error.message);
        }
        return rejectWithValue(error.message || "Failed to fetch user");
      }
      return rejectWithValue("Network error");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setConnecting: (state, action) => {
      state.isConnecting = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isConnecting = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isChecked = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isConnecting = false;
        state.error = action.payload as string;
        state.isChecked = true;
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isConnecting = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isChecked = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isConnecting = false;
        state.error = action.payload as string;
        state.isChecked = true;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.isConnecting = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isChecked = true;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
        state.isConnecting = false;
        // Even if logout fails, clear auth state
        state.user = null;
        state.isAuthenticated = false;
        state.isChecked = true;
        state.error = null;
      });

    // Fetch Current User
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isConnecting = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isChecked = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isConnecting = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isChecked = true;
        const errorMessage = action.payload as string;
        if (errorMessage && (errorMessage.includes("starting up") || errorMessage.includes("connect"))) {
          state.error = errorMessage;
        }
      });
  },
});

export const { clearError, setConnecting } = authSlice.actions;
export default authSlice.reducer;
