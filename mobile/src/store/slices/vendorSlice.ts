import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../config/api';
import {
  Venue,
  Slot,
  Booking,
  ExtraService,
  CreateVenuePayload,
  CreateSlotPayload,
  CreateExtraServicePayload,
  ApiResponse,
} from '../../types';

interface VendorState {
  myVenues: Venue[];
  selectedVenue: Venue | null;
  slots: Slot[];
  vendorBookings: Booking[];
  services: ExtraService[];
  dashboardStats: {
    totalBookings: number;
    todayBookings: number;
    totalRevenue: number;
    monthRevenue: number;
    activeVenues: number;
    averageRating: number;
  } | null;
  loading: boolean;
  createLoading: boolean;
  error: string | null;
}

const initialState: VendorState = {
  myVenues: [],
  selectedVenue: null,
  slots: [],
  vendorBookings: [],
  services: [],
  dashboardStats: null,
  loading: false,
  createLoading: false,
  error: null,
};

export const fetchVendorDashboard = createAsyncThunk<
  VendorState['dashboardStats'],
  void,
  { rejectValue: string }
>('vendor/fetchDashboard', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<
      ApiResponse<NonNullable<VendorState['dashboardStats']>>
    >('/vendor/dashboard');
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch dashboard'
    );
  }
});

export const fetchMyVenues = createAsyncThunk<
  Venue[],
  void,
  { rejectValue: string }
>('vendor/fetchMyVenues', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<ApiResponse<Venue[]>>(
      '/vendor/venues'
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch venues'
    );
  }
});

export const createVenue = createAsyncThunk<
  Venue,
  CreateVenuePayload,
  { rejectValue: string }
>('vendor/createVenue', async (payload, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<ApiResponse<Venue>>(
      '/vendor/venues',
      payload
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to create venue'
    );
  }
});

export const updateVenue = createAsyncThunk<
  Venue,
  { venueId: string; data: Partial<CreateVenuePayload> },
  { rejectValue: string }
>('vendor/updateVenue', async ({ venueId, data }, { rejectWithValue }) => {
  try {
    const response = await apiClient.put<ApiResponse<Venue>>(
      `/vendor/venues/${venueId}`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to update venue'
    );
  }
});

export const deleteVenue = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('vendor/deleteVenue', async (venueId, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/vendor/venues/${venueId}`);
    return venueId;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to delete venue'
    );
  }
});

export const fetchVenueSlots = createAsyncThunk<
  Slot[],
  { venueId: string; date?: string },
  { rejectValue: string }
>('vendor/fetchSlots', async ({ venueId, date }, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<ApiResponse<Slot[]>>(
      `/vendor/venues/${venueId}/slots`,
      { params: { date } }
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch slots'
    );
  }
});

export const createSlot = createAsyncThunk<
  Slot,
  CreateSlotPayload,
  { rejectValue: string }
>('vendor/createSlot', async (payload, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<ApiResponse<Slot>>(
      `/vendor/venues/${payload.venueId}/slots`,
      payload
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to create slot'
    );
  }
});

export const updateSlot = createAsyncThunk<
  Slot,
  { slotId: string; data: Partial<CreateSlotPayload> },
  { rejectValue: string }
>('vendor/updateSlot', async ({ slotId, data }, { rejectWithValue }) => {
  try {
    const response = await apiClient.put<ApiResponse<Slot>>(
      `/vendor/slots/${slotId}`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to update slot'
    );
  }
});

export const deleteSlot = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('vendor/deleteSlot', async (slotId, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/vendor/slots/${slotId}`);
    return slotId;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to delete slot'
    );
  }
});

export const fetchVendorBookings = createAsyncThunk<
  Booking[],
  { venueId?: string; status?: string; date?: string } | void,
  { rejectValue: string }
>('vendor/fetchBookings', async (params, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<ApiResponse<Booking[]>>(
      '/vendor/bookings',
      { params: params || {} }
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch bookings'
    );
  }
});

export const confirmBooking = createAsyncThunk<
  Booking,
  string,
  { rejectValue: string }
>('vendor/confirmBooking', async (bookingId, { rejectWithValue }) => {
  try {
    const response = await apiClient.put<ApiResponse<Booking>>(
      `/vendor/bookings/${bookingId}/confirm`
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to confirm booking'
    );
  }
});

export const cancelVendorBooking = createAsyncThunk<
  Booking,
  { bookingId: string; reason: string },
  { rejectValue: string }
>('vendor/cancelBooking', async ({ bookingId, reason }, { rejectWithValue }) => {
  try {
    const response = await apiClient.put<ApiResponse<Booking>>(
      `/vendor/bookings/${bookingId}/cancel`,
      { reason }
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to cancel booking'
    );
  }
});

export const fetchVenueServices = createAsyncThunk<
  ExtraService[],
  string,
  { rejectValue: string }
>('vendor/fetchServices', async (venueId, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<ApiResponse<ExtraService[]>>(
      `/vendor/venues/${venueId}/services`
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch services'
    );
  }
});

export const createService = createAsyncThunk<
  ExtraService,
  CreateExtraServicePayload,
  { rejectValue: string }
>('vendor/createService', async (payload, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<ApiResponse<ExtraService>>(
      `/vendor/venues/${payload.venueId}/services`,
      payload
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to create service'
    );
  }
});

export const updateService = createAsyncThunk<
  ExtraService,
  { serviceId: string; data: Partial<CreateExtraServicePayload> },
  { rejectValue: string }
>('vendor/updateService', async ({ serviceId, data }, { rejectWithValue }) => {
  try {
    const response = await apiClient.put<ApiResponse<ExtraService>>(
      `/vendor/services/${serviceId}`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to update service'
    );
  }
});

export const deleteService = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('vendor/deleteService', async (serviceId, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/vendor/services/${serviceId}`);
    return serviceId;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to delete service'
    );
  }
});

const vendorSlice = createSlice({
  name: 'vendor',
  initialState,
  reducers: {
    clearVendorError(state) {
      state.error = null;
    },
    setSelectedVenue(state, action: PayloadAction<Venue | null>) {
      state.selectedVenue = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard
      .addCase(fetchVendorDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVendorDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchVendorDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch dashboard';
      })
      // My Venues
      .addCase(fetchMyVenues.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyVenues.fulfilled, (state, action) => {
        state.loading = false;
        state.myVenues = action.payload;
      })
      .addCase(fetchMyVenues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch venues';
      })
      // Create Venue
      .addCase(createVenue.pending, (state) => {
        state.createLoading = true;
      })
      .addCase(createVenue.fulfilled, (state, action) => {
        state.createLoading = false;
        state.myVenues.unshift(action.payload);
      })
      .addCase(createVenue.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload || 'Failed to create venue';
      })
      // Update Venue
      .addCase(updateVenue.fulfilled, (state, action) => {
        const index = state.myVenues.findIndex((v) => v.id === action.payload.id);
        if (index !== -1) state.myVenues[index] = action.payload;
        if (state.selectedVenue?.id === action.payload.id) {
          state.selectedVenue = action.payload;
        }
      })
      // Delete Venue
      .addCase(deleteVenue.fulfilled, (state, action) => {
        state.myVenues = state.myVenues.filter((v) => v.id !== action.payload);
      })
      // Slots
      .addCase(fetchVenueSlots.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVenueSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.slots = action.payload;
      })
      .addCase(fetchVenueSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch slots';
      })
      .addCase(createSlot.fulfilled, (state, action) => {
        state.slots.push(action.payload);
      })
      .addCase(updateSlot.fulfilled, (state, action) => {
        const index = state.slots.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) state.slots[index] = action.payload;
      })
      .addCase(deleteSlot.fulfilled, (state, action) => {
        state.slots = state.slots.filter((s) => s.id !== action.payload);
      })
      // Bookings
      .addCase(fetchVendorBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVendorBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.vendorBookings = action.payload;
      })
      .addCase(fetchVendorBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch bookings';
      })
      .addCase(confirmBooking.fulfilled, (state, action) => {
        const index = state.vendorBookings.findIndex(
          (b) => b.id === action.payload.id
        );
        if (index !== -1) state.vendorBookings[index] = action.payload;
      })
      .addCase(cancelVendorBooking.fulfilled, (state, action) => {
        const index = state.vendorBookings.findIndex(
          (b) => b.id === action.payload.id
        );
        if (index !== -1) state.vendorBookings[index] = action.payload;
      })
      // Services
      .addCase(fetchVenueServices.fulfilled, (state, action) => {
        state.services = action.payload;
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.services.push(action.payload);
      })
      .addCase(updateService.fulfilled, (state, action) => {
        const index = state.services.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) state.services[index] = action.payload;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.services = state.services.filter((s) => s.id !== action.payload);
      });
  },
});

export const { clearVendorError, setSelectedVenue } = vendorSlice.actions;
export default vendorSlice.reducer;
