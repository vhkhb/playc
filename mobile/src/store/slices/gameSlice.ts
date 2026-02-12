import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../config/api';
import {
  Game,
  GameParticipant,
  HostGamePayload,
  ApiResponse,
  SportType,
} from '../../types';

interface GameState {
  upcomingGames: Game[];
  myHostedGames: Game[];
  myJoinedGames: Game[];
  selectedGame: Game | null;
  loading: boolean;
  createLoading: boolean;
  error: string | null;
}

const initialState: GameState = {
  upcomingGames: [],
  myHostedGames: [],
  myJoinedGames: [],
  selectedGame: null,
  loading: false,
  createLoading: false,
  error: null,
};

export const hostGame = createAsyncThunk<
  Game,
  HostGamePayload,
  { rejectValue: string }
>('games/host', async (payload, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<ApiResponse<Game>>('/games', payload);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to host game'
    );
  }
});

export const joinGame = createAsyncThunk<
  GameParticipant,
  string,
  { rejectValue: string }
>('games/join', async (gameId, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<ApiResponse<GameParticipant>>(
      `/games/${gameId}/join`
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to join game'
    );
  }
});

export const invitePlayers = createAsyncThunk<
  GameParticipant[],
  { gameId: string; userIds: string[] },
  { rejectValue: string }
>('games/invite', async ({ gameId, userIds }, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<ApiResponse<GameParticipant[]>>(
      `/games/${gameId}/invite`,
      { userIds }
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to invite players'
    );
  }
});

export const fetchUpcomingGames = createAsyncThunk<
  Game[],
  { sportType?: SportType; latitude?: number; longitude?: number } | void,
  { rejectValue: string }
>('games/fetchUpcoming', async (params, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<ApiResponse<Game[]>>(
      '/games/upcoming',
      { params: params || {} }
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch upcoming games'
    );
  }
});

export const fetchMyHostedGames = createAsyncThunk<
  Game[],
  void,
  { rejectValue: string }
>('games/fetchMyHosted', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<ApiResponse<Game[]>>(
      '/games/my-hosted'
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch hosted games'
    );
  }
});

export const fetchMyJoinedGames = createAsyncThunk<
  Game[],
  void,
  { rejectValue: string }
>('games/fetchMyJoined', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<ApiResponse<Game[]>>(
      '/games/my-joined'
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch joined games'
    );
  }
});

export const getGameById = createAsyncThunk<
  Game,
  string,
  { rejectValue: string }
>('games/getById', async (gameId, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<ApiResponse<Game>>(
      `/games/${gameId}`
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch game details'
    );
  }
});

const gameSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    clearSelectedGame(state) {
      state.selectedGame = null;
    },
    clearGameError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Host Game
      .addCase(hostGame.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(hostGame.fulfilled, (state, action: PayloadAction<Game>) => {
        state.createLoading = false;
        state.selectedGame = action.payload;
        state.myHostedGames.unshift(action.payload);
      })
      .addCase(hostGame.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload || 'Failed to host game';
      })
      // Join Game
      .addCase(joinGame.pending, (state) => {
        state.loading = true;
      })
      .addCase(joinGame.fulfilled, (state, action) => {
        state.loading = false;
        if (state.selectedGame) {
          state.selectedGame.participants.push(action.payload);
          state.selectedGame.currentPlayers += 1;
        }
      })
      .addCase(joinGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to join game';
      })
      // Invite Players
      .addCase(invitePlayers.fulfilled, (state, action) => {
        if (state.selectedGame) {
          state.selectedGame.participants.push(...action.payload);
        }
      })
      // Fetch Upcoming
      .addCase(fetchUpcomingGames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpcomingGames.fulfilled, (state, action: PayloadAction<Game[]>) => {
        state.loading = false;
        state.upcomingGames = action.payload;
      })
      .addCase(fetchUpcomingGames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch games';
      })
      // My Hosted
      .addCase(fetchMyHostedGames.fulfilled, (state, action: PayloadAction<Game[]>) => {
        state.myHostedGames = action.payload;
      })
      // My Joined
      .addCase(fetchMyJoinedGames.fulfilled, (state, action: PayloadAction<Game[]>) => {
        state.myJoinedGames = action.payload;
      })
      // Get By ID
      .addCase(getGameById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getGameById.fulfilled, (state, action: PayloadAction<Game>) => {
        state.loading = false;
        state.selectedGame = action.payload;
      })
      .addCase(getGameById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch game';
      });
  },
});

export const { clearSelectedGame, clearGameError } = gameSlice.actions;
export default gameSlice.reducer;
