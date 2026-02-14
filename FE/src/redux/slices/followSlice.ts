import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isAxiosError } from 'axios';
import { $api } from '../../api/api';
import type { IFollowItem } from '../../interfaces/follow.interface';

import type { ApiError } from '../../interfaces/api.interface';

interface IFollowState {
  followers: IFollowItem[]; // кто подписан на userId
  following: IFollowItem[]; // на кого подписан userId
  loading: boolean;
  error: string | null;
}

const initialState: IFollowState = {
  followers: [],
  following: [],
  loading: false,
  error: null,
};

/* ===================== THUNKS (роуты бэка) ===================== */

// GET /follows/:userId/followers
export const getFollowersMe = createAsyncThunk<
  IFollowItem[],
  string,
  { rejectValue: string }
>('follow/getFollowersMe', async (userId, { rejectWithValue }) => {
  try {
    const { data } = await $api.get<IFollowItem[]>(`/follows/${userId}/followers`);
    return data;
  } catch (err) {
    if (isAxiosError<ApiError>(err)) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to load followers');
    }
    return rejectWithValue('Failed to load followers');
  }
});

// GET /follows/:userId/following
export const getFollowingMe = createAsyncThunk<
  IFollowItem[],
  string,
  { rejectValue: string }
>('follow/getFollowingMe', async (userId, { rejectWithValue }) => {
  try {
    const { data } = await $api.get<IFollowItem[]>(`/follows/${userId}/following`);
    return data;
  } catch (err) {
    if (isAxiosError<ApiError>(err)) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to load following');
    }
    return rejectWithValue('Failed to load following');
  }
});

// POST /follows/:userId/follow
export const followUser = createAsyncThunk<
  { message: string },
  string,
  { rejectValue: string }
>('follow/followUser', async (userId, { rejectWithValue }) => {
  try {
    const { data } = await $api.post<{ message: string }>(`/follows/${userId}/follow`);
    return data;
  } catch (err) {
    if (isAxiosError<ApiError>(err)) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to follow');
    }
    return rejectWithValue('Failed to follow');
  }
});

// DELETE /follows/:userId/unfollow
export const unfollowUser = createAsyncThunk<
  { message: string },
  string,
  { rejectValue: string }
>('follow/unfollowUser', async (userId, { rejectWithValue }) => {
  try {
    const { data } = await $api.delete<{ message: string }>(`/follows/${userId}/unfollow`);
    return data;
  } catch (err) {
    if (isAxiosError<ApiError>(err)) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to unfollow');
    }
    return rejectWithValue('Failed to unfollow');
  }
});

/* ===================== SLICE ===================== */

const followSlice = createSlice({
  name: 'follow',
  initialState,
  reducers: {
    // если нужно очищать при смене пользователя/логауте
    clearFollow(state) {
      state.followers = [];
      state.following = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // followers
      .addCase(getFollowersMe.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(getFollowersMe.fulfilled, (state, action: PayloadAction<IFollowItem[]>) => {
        state.loading = false; state.followers = action.payload;
      })
      .addCase(getFollowersMe.rejected, (state, action) => {
        state.loading = false; state.error = action.payload ?? 'Failed to load followers';
      })

      // following
      .addCase(getFollowingMe.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(getFollowingMe.fulfilled, (state, action: PayloadAction<IFollowItem[]>) => {
        state.loading = false; state.following = action.payload;
      })
      .addCase(getFollowingMe.rejected, (state, action) => {
        state.loading = false; state.error = action.payload ?? 'Failed to load following';
      })

      // follow / unfollow — данных списка в ответе нет → локально не трогаем;
      // в компонентах после успеха вызываем getFollowersMe/getFollowingMe заново.
      .addCase(followUser.pending, (state) => { state.error = null; })
      .addCase(followUser.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to follow';
      })
      .addCase(unfollowUser.pending, (state) => { state.error = null; })
      .addCase(unfollowUser.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to unfollow';
      });
  },
});

export const { clearFollow } = followSlice.actions;
export default followSlice.reducer;