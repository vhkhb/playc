import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../config/api';
import {
  Venue,
  Slot,
  Review,
  ApiResponse,
  SearchVenuesPayload,
} from '../../types';

interface VenueState {
  venues: Venue[];
  nearbyVenues: Venue[];
  featuredVenues: Venue[];
  selectedVenue: Venue | null;
  venueSlots: Slot[];
  venueReviews: Review[];
  searchQuery: string;
  loading: boolean;
  slotsLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
}

const initialState: VenueState = {
  venues: [],
  nearbyVenues: [],
  featuredVenues: [],
  selectedVenue: null,
  venueSlots: [],
  venueReviews: [],
  searchQuery: '',
  loading: false,
  slotsLoading: false,
  error: null,
  pagination: {
    page: 1,
    totalPages: 1,
    total: 0,
  },
};

export const fetchNearbyVenues = createAsyncThunk<
  { venues: Venue[] },
  { latitude: number; longitude: number; radius?: number },
  { rejectValue: string }
>('venues/fetchNearby', async (params, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<ApiResponse<Venue[]>>('/venues/nearby', {
      params: {
        latitude: params.latitude,
        longitude: params.longitude,
        radius: params.radius || 10,
      },
    });
    return { venues: response.data.data };
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch nearby venues'
    );
  }
});

export const fetchFeaturedVenues = createAsyncThunk<
  Venue[],
  void,
  { rejectValue: string }
>('venues/fetchFeatured', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<ApiResponse<Venue[]>>(
      '/venues/featured'
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch featured venues'
    );
  }
});

export const searchVenues = createAsyncThunk<
  { venues: Venue[]; pagination: { page: number; totalPages: number; total: number } },
  SearchVenuesPayload,
  { rejectValue: string }
>('venues/search', async (params, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<ApiResponse<Venue[]>>('/venues/search', {
      params,
    });
    return {
      venues: response.data.data,
      pagination: response.data.pagination || { page: 1, totalPages: 1, total: 0 },
    };
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to search venues'
    );
  }
});

export const getVenueById = createAsyncThunk<
  Venue,
  string,
  { rejectValue: string }
>('venues/getById', async (venueId, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<ApiResponse<Venue>>(
      `/venues/${venueId}`
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch venue details'
    );
  }
});

export const fetchVenueSlots = createAsyncThunk<
  Slot[],
  { venueId: string; date: string },
  { rejectValue: string }
>('venues/fetchSlots', async ({ venueId, date }, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<ApiResponse<Slot[]>>(
      `/venues/${venueId}/slots`,
      { params: { date } }
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch venue slots'
    );
  }
});

export const fetchVenueReviews = createAsyncThunk<
  Review[],
  string,
  { rejectValue: string }
>('venues/fetchReviews', async (venueId, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<ApiResponse<Review[]>>(
      `/venues/${venueId}/reviews`
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch reviews'
    );
  }
});

const venueSlice = createSlice({
  name: 'venues',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    clearSelectedVenue(state) {
      state.selectedVenue = null;
      state.venueSlots = [];
      state.venueReviews = [];
    },
    clearVenueError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Nearby
      .addCase(fetchNearbyVenues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNearbyVenues.fulfilled, (state, action) => {
        state.loading = false;
        state.nearbyVenues = action.payload.venues;
      })
      .addCase(fetchNearbyVenues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch nearby venues';
      })
      // Fetch Featured
      .addCase(fetchFeaturedVenues.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFeaturedVenues.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredVenues = action.payload;
      })
      .addCase(fetchFeaturedVenues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch featured venues';
      })
      // Search
      .addCase(searchVenues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchVenues.fulfilled, (state, action) => {
        state.loading = false;
        state.venues = action.payload.venues;
        state.pagination = action.payload.pagination;
      })
      .addCase(searchVenues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Search failed';
      })
      // Get By ID
      .addCase(getVenueById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVenueById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedVenue = action.payload;
      })
      .addCase(getVenueById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch venue';
      })
      // Fetch Slots
      .addCase(fetchVenueSlots.pending, (state) => {
        state.slotsLoading = true;
      })
      .addCase(fetchVenueSlots.fulfilled, (state, action) => {
        state.slotsLoading = false;
        state.venueSlots = action.payload;
      })
      .addCase(fetchVenueSlots.rejected, (state, action) => {
        state.slotsLoading = false;
        state.error = action.payload || 'Failed to fetch slots';
      })
      // Fetch Reviews
      .addCase(fetchVenueReviews.fulfilled, (state, action) => {
        state.venueReviews = action.payload;
      });
  },
});

export const { setSearchQuery, clearSelectedVenue, clearVenueError } =
  venueSlice.actions;
export default venueSlice.reducer;
