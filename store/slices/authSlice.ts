import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "@/lib/api/config";

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isChecked: boolean; // Track if we've checked auth status
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isChecked: false,
  error: null,
};

// Login
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        const data = await res.json();
        return rejectWithValue(data.detail || "Invalid credentials");
      }

      // After login, fetch user info
      const userRes = await fetch(`${API_BASE_URL}/auth/me/`, {
        credentials: "include",
      });

      if (!userRes.ok) {
        return rejectWithValue("Failed to fetch user");
      }

      return await userRes.json();
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

// Logout
export const logout = createAsyncThunk("auth/logout", async () => {
  await fetch(`${API_BASE_URL}/auth/logout/`, {
    method: "POST",
    credentials: "include",
  });
  return null;
});

// Check if user is logged in (on page refresh)
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me/`, {
        credentials: "include",
      });

      if (!res.ok) {
        return rejectWithValue("Not authenticated");
      }

      return await res.json();
    } catch {
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
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isChecked = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isChecked = true;
      });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isChecked = true;
    });

    // Fetch Current User
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isChecked = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isChecked = true; // Important: mark as checked even on failure
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
