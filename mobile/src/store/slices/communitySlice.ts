import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../config/api';
import {
  Community,
  CommunityPost,
  CommunityMember,
  CreateCommunityPayload,
  CreatePostPayload,
  ApiResponse,
} from '../../types';

interface CommunityState {
  myCommunities: Community[];
  discoverCommunities: Community[];
  selectedCommunity: Community | null;
  posts: CommunityPost[];
  members: CommunityMember[];
  loading: boolean;
  postsLoading: boolean;
  createLoading: boolean;
  error: string | null;
}

const initialState: CommunityState = {
  myCommunities: [],
  discoverCommunities: [],
  selectedCommunity: null,
  posts: [],
  members: [],
  loading: false,
  postsLoading: false,
  createLoading: false,
  error: null,
};

export const createCommunity = createAsyncThunk<
  Community,
  CreateCommunityPayload,
  { rejectValue: string }
>('communities/create', async (payload, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<ApiResponse<Community>>(
      '/communities',
      payload
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to create community'
    );
  }
});

export const fetchMyCommunities = createAsyncThunk<
  Community[],
  void,
  { rejectValue: string }
>('communities/fetchMy', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<ApiResponse<Community[]>>(
      '/communities/my'
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch communities'
    );
  }
});

export const fetchDiscoverCommunities = createAsyncThunk<
  Community[],
  void,
  { rejectValue: string }
>('communities/fetchDiscover', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<ApiResponse<Community[]>>(
      '/communities/discover'
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to discover communities'
    );
  }
});

export const joinCommunity = createAsyncThunk<
  CommunityMember,
  string,
  { rejectValue: string }
>('communities/join', async (communityId, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<ApiResponse<CommunityMember>>(
      `/communities/${communityId}/join`
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to join community'
    );
  }
});

export const fetchPosts = createAsyncThunk<
  CommunityPost[],
  string,
  { rejectValue: string }
>('communities/fetchPosts', async (communityId, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<ApiResponse<CommunityPost[]>>(
      `/communities/${communityId}/posts`
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch posts'
    );
  }
});

export const createPost = createAsyncThunk<
  CommunityPost,
  CreatePostPayload,
  { rejectValue: string }
>('communities/createPost', async (payload, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<ApiResponse<CommunityPost>>(
      `/communities/${payload.communityId}/posts`,
      { content: payload.content, images: payload.images }
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to create post'
    );
  }
});

export const likePost = createAsyncThunk<
  { postId: string; liked: boolean },
  { communityId: string; postId: string },
  { rejectValue: string }
>('communities/likePost', async ({ communityId, postId }, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<ApiResponse<{ liked: boolean }>>(
      `/communities/${communityId}/posts/${postId}/like`
    );
    return { postId, liked: response.data.data.liked };
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to like post'
    );
  }
});

export const fetchMembers = createAsyncThunk<
  CommunityMember[],
  string,
  { rejectValue: string }
>('communities/fetchMembers', async (communityId, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<ApiResponse<CommunityMember[]>>(
      `/communities/${communityId}/members`
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch members'
    );
  }
});

export const getCommunityById = createAsyncThunk<
  Community,
  string,
  { rejectValue: string }
>('communities/getById', async (communityId, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<ApiResponse<Community>>(
      `/communities/${communityId}`
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch community'
    );
  }
});

const communitySlice = createSlice({
  name: 'communities',
  initialState,
  reducers: {
    clearSelectedCommunity(state) {
      state.selectedCommunity = null;
      state.posts = [];
      state.members = [];
    },
    clearCommunityError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Community
      .addCase(createCommunity.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createCommunity.fulfilled, (state, action: PayloadAction<Community>) => {
        state.createLoading = false;
        state.myCommunities.unshift(action.payload);
        state.selectedCommunity = action.payload;
      })
      .addCase(createCommunity.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload || 'Failed to create community';
      })
      // Fetch My
      .addCase(fetchMyCommunities.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyCommunities.fulfilled, (state, action: PayloadAction<Community[]>) => {
        state.loading = false;
        state.myCommunities = action.payload;
      })
      .addCase(fetchMyCommunities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch communities';
      })
      // Discover
      .addCase(fetchDiscoverCommunities.fulfilled, (state, action) => {
        state.discoverCommunities = action.payload;
      })
      // Join
      .addCase(joinCommunity.fulfilled, (state, action) => {
        state.members.push(action.payload);
        if (state.selectedCommunity) {
          state.selectedCommunity.memberCount += 1;
        }
      })
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        state.postsLoading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action: PayloadAction<CommunityPost[]>) => {
        state.postsLoading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.postsLoading = false;
        state.error = action.payload || 'Failed to fetch posts';
      })
      // Create Post
      .addCase(createPost.fulfilled, (state, action: PayloadAction<CommunityPost>) => {
        state.posts.unshift(action.payload);
        if (state.selectedCommunity) {
          state.selectedCommunity.postCount += 1;
        }
      })
      // Like Post
      .addCase(likePost.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p.id === action.payload.postId);
        if (post) {
          post.isLikedByMe = action.payload.liked;
          post.likeCount += action.payload.liked ? 1 : -1;
        }
      })
      // Fetch Members
      .addCase(fetchMembers.fulfilled, (state, action: PayloadAction<CommunityMember[]>) => {
        state.members = action.payload;
      })
      // Get By ID
      .addCase(getCommunityById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCommunityById.fulfilled, (state, action: PayloadAction<Community>) => {
        state.loading = false;
        state.selectedCommunity = action.payload;
      })
      .addCase(getCommunityById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch community';
      });
  },
});

export const { clearSelectedCommunity, clearCommunityError } =
  communitySlice.actions;
export default communitySlice.reducer;
