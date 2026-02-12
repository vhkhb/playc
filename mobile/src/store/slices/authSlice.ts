import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient, { setAuthToken, removeAuthToken, getAuthToken } from '../../config/api';
import { User, LoginPayload, RegisterPayload, LoginResponse, ApiResponse } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  registerSuccess: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  registerSuccess: false,
};

export const login = createAsyncThunk<
  LoginResponse,
  LoginPayload,
  { rejectValue: string }
>('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      payload
    );
    const { user, token } = response.data.data;
    await setAuthToken(token);
    return { user, token };
  } catch (error: any) {
    const message =
      error.response?.data?.message || 'Login failed. Please try again.';
    return rejectWithValue(message);
  }
});

export const register = createAsyncThunk<
  LoginResponse,
  RegisterPayload,
  { rejectValue: string }
>('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/register',
      payload
    );
    const { user, token } = response.data.data;
    await setAuthToken(token);
    return { user, token };
  } catch (error: any) {
    const message =
      error.response?.data?.message || 'Registration failed. Please try again.';
    return rejectWithValue(message);
  }
});

export const loadUser = createAsyncThunk<
  LoginResponse,
  void,
  { rejectValue: string }
>('auth/loadUser', async (_, { rejectWithValue }) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      return rejectWithValue('No token found');
    }
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return { user: response.data.data, token };
  } catch (error: any) {
    await removeAuthToken();
    const message =
      error.response?.data?.message || 'Failed to load user data.';
    return rejectWithValue(message);
  }
});

export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.post('/auth/logout');
      await removeAuthToken();
    } catch (error: any) {
      await removeAuthToken();
      return rejectWithValue('Logout failed');
    }
  }
);

export const forgotPassword = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('auth/forgotPassword', async (email, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<ApiResponse<null>>(
      '/auth/forgot-password',
      { email }
    );
    return response.data.message || 'Password reset email sent.';
  } catch (error: any) {
    const message =
      error.response?.data?.message || 'Failed to send reset email.';
    return rejectWithValue(message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearRegisterSuccess(state) {
      state.registerSuccess = false;
    },
    resetAuth() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
        state.isAuthenticated = false;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.registerSuccess = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed';
      })
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loadUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, clearRegisterSuccess, resetAuth } = authSlice.actions;
export default authSlice.reducer;
