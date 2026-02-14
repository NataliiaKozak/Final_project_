import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isAxiosError } from 'axios';
import { $api } from '../../api/api';

import type { ApiError } from '../../interfaces/api.interface';

interface LikesState {
  byPostId: Record<string, boolean>;    // локальный флаг "я лайкнул этот пост"
  byCommentId: Record<string, boolean>; // локальный флаг "я лайкнул этот комментарий"
  loadingByPostId: Record<string, boolean>;
  loadingByCommentId: Record<string, boolean>;
  error: string | null;
}

const initialState: LikesState = {
  byPostId: {},
  byCommentId: {},
  loadingByPostId: {},
  loadingByCommentId: {},
  error: null,
};

/* ===================== THUNKS (роуты бэка) ===================== */

// POST /likes/post/:postId  (toggle like)
export const toggleLikePost = createAsyncThunk<
  { postId: string; liked: boolean; likesCount: number },
  string,
  { rejectValue: string }
>('likes/toggleLikePost', async (postId, { rejectWithValue }) => {
  try {
    const { data } = await $api.post<{ liked: boolean; likesCount: number }>(`/likes/post/${postId}`);
    return { postId, liked: data.liked, likesCount: data.likesCount };
  } catch (err: unknown) {
    if (isAxiosError<ApiError>(err)) {
      return rejectWithValue(err.response?.data?.message ?? 'Ошибка изменения лайка поста');
    }
    return rejectWithValue('Ошибка изменения лайка поста');
  }
});

// POST /likes/comment/:commentId  (toggle like)
export const toggleLikeComment = createAsyncThunk<
  { commentId: string; liked: boolean; likesCount: number },
  string,
  { rejectValue: string }
>('likes/toggleLikeComment', async (commentId, { rejectWithValue }) => {
  try {
    const { data } = await $api.post<{ liked: boolean; likesCount: number }>(`/likes/comment/${commentId}`);
    return { commentId, liked: data.liked, likesCount: data.likesCount };
  } catch (err: unknown) {
    if (isAxiosError<ApiError>(err)) {
      return rejectWithValue(err.response?.data?.message ?? 'Ошибка изменения лайка комментария');
    }
    return rejectWithValue('Ошибка изменения лайка комментария');
  }
});

/* ===================== SLICE ===================== */

const likesSlice = createSlice({
  name: 'likes',
  initialState,
  reducers: {
    // если нужно очистить при логауте
    clearLikes(state) {
      state.byPostId = {};
      state.byCommentId = {};
      state.loadingByPostId = {};
      state.loadingByCommentId = {};
      state.error = null;
    },
    // опционально: принудительно выставить флаг 
    // (если UI знает текущее состояние) - задать нужное значение, когда оно известно точно.
    setPostLiked(state, { payload }: PayloadAction<{ postId: string; liked: boolean }>) {
      state.byPostId[payload.postId] = payload.liked;
    },
    setCommentLiked(state, { payload }: PayloadAction<{ commentId: string; liked: boolean }>) {
      state.byCommentId[payload.commentId] = payload.liked;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(toggleLikePost.pending, (state, action) => {
        state.loadingByPostId[action.meta.arg] = true;
        state.error = null;
      })
      .addCase(toggleLikePost.fulfilled, (state, { payload }) => {
        state.loadingByPostId[payload.postId] = false;
        state.byPostId[payload.postId] = payload.liked;
      })
      .addCase(toggleLikePost.rejected, (state, action) => {
        state.loadingByPostId[action.meta.arg] = false;
        state.error = action.payload ?? 'Ошибка изменения лайка поста';
      })

      .addCase(toggleLikeComment.pending, (state, action) => {
        state.loadingByCommentId[action.meta.arg] = true;
        state.error = null;
      })
      .addCase(toggleLikeComment.fulfilled, (state, { payload }) => {
        state.loadingByCommentId[payload.commentId] = false;
        state.byCommentId[payload.commentId] = payload.liked;
      })
      .addCase(toggleLikeComment.rejected, (state, action) => {
        state.loadingByCommentId[action.meta.arg] = false;
        state.error = action.payload ?? 'Ошибка изменения лайка комментария';
      });
  },
});

export const { clearLikes, setPostLiked, setCommentLiked } = likesSlice.actions;
export default likesSlice.reducer;


