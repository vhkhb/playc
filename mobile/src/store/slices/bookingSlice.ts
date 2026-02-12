import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../config/api';
import { Booking, CreateBookingPayload, ApiResponse } from '../../types';

interface BookingState {
  myBookings: Booking[];
  upcomingBookings: Booking[];
  pastBookings: Booking[];
  cancelledBookings: Booking[];
  selectedBooking: Booking | null;
  loading: boolean;
  createLoading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  myBookings: [],
  upcomingBookings: [],
  pastBookings: [],
  cancelledBookings: [],
  selectedBooking: null,
  loading: false,
  createLoading: false,
  error: null,
};

export const createBooking = createAsyncThunk<
  Booking,
  CreateBookingPayload,
  { rejectValue: string }
>('bookings/create', async (payload, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<ApiResponse<Booking>>(
      '/bookings',
      payload
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to create booking'
    );
  }
});

export const fetchMyBookings = createAsyncThunk<
  Booking[],
  { status?: string } | void,
  { rejectValue: string }
>('bookings/fetchMy', async (params, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<ApiResponse<Booking[]>>(
      '/bookings/my',
      { params: params || {} }
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch bookings'
    );
  }
});

export const getBookingById = createAsyncThunk<
  Booking,
  string,
  { rejectValue: string }
>('bookings/getById', async (bookingId, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<ApiResponse<Booking>>(
      `/bookings/${bookingId}`
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch booking details'
    );
  }
});

export const cancelBooking = createAsyncThunk<
  Booking,
  { bookingId: string; reason: string },
  { rejectValue: string }
>('bookings/cancel', async ({ bookingId, reason }, { rejectWithValue }) => {
  try {
    const response = await apiClient.put<ApiResponse<Booking>>(
      `/bookings/${bookingId}/cancel`,
      { reason }
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to cancel booking'
    );
  }
});

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearSelectedBooking(state) {
      state.selectedBooking = null;
    },
    clearBookingError(state) {
      state.error = null;
    },
    categorizeBookings(state) {
      const now = new Date();
      state.upcomingBookings = state.myBookings.filter(
        (b) =>
          (b.status === 'confirmed' || b.status === 'pending') &&
          new Date(b.slot?.date || '') >= now
      );
      state.pastBookings = state.myBookings.filter(
        (b) =>
          b.status === 'completed' ||
          (b.status === 'confirmed' && new Date(b.slot?.date || '') < now)
      );
      state.cancelledBookings = state.myBookings.filter(
        (b) => b.status === 'cancelled'
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Booking
      .addCase(createBooking.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.createLoading = false;
        state.selectedBooking = action.payload;
        state.myBookings.unshift(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload || 'Failed to create booking';
      })
      // Fetch My Bookings
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
        state.loading = false;
        state.myBookings = action.payload;
        const now = new Date();
        state.upcomingBookings = action.payload.filter(
          (b) =>
            (b.status === 'confirmed' || b.status === 'pending') &&
            new Date(b.slot?.date || '') >= now
        );
        state.pastBookings = action.payload.filter(
          (b) =>
            b.status === 'completed' ||
            (b.status === 'confirmed' && new Date(b.slot?.date || '') < now)
        );
        state.cancelledBookings = action.payload.filter(
          (b) => b.status === 'cancelled'
        );
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch bookings';
      })
      // Get By ID
      .addCase(getBookingById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBookingById.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.loading = false;
        state.selectedBooking = action.payload;
      })
      .addCase(getBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch booking';
      })
      // Cancel Booking
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelBooking.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.loading = false;
        const index = state.myBookings.findIndex(
          (b) => b.id === action.payload.id
        );
        if (index !== -1) {
          state.myBookings[index] = action.payload;
        }
        if (state.selectedBooking?.id === action.payload.id) {
          state.selectedBooking = action.payload;
        }
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to cancel booking';
      });
  },
});

export const { clearSelectedBooking, clearBookingError, categorizeBookings } =
  bookingSlice.actions;
export default bookingSlice.reducer;
