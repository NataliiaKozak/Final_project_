import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isAxiosError } from 'axios';
import { $api } from '../../api/api';

type ApiError = { message?: string };

interface LikesState {
  byPostId: Record<string, boolean>;    // локальный флаг "я лайкнул этот пост"
  byCommentId: Record<string, boolean>; // локальный флаг "я лайкнул этот комментарий"
  loading: boolean;
  error: string | null;
}

const initialState: LikesState = {
  byPostId: {},
  byCommentId: {},
  loading: false,
  error: null,
};

/* ===================== THUNKS (роуты бэка) ===================== */

// POST /likes/post/:postId  (toggle like)
export const toggleLikePost = createAsyncThunk<
  { postId: string },
  string,
  { rejectValue: string }
>('likes/toggleLikePost', async (postId, { rejectWithValue }) => {
  try {
    await $api.post(`/likes/post/${postId}`);
    return { postId };
  } catch (err: unknown) {
    if (isAxiosError<ApiError>(err)) {
      return rejectWithValue(err.response?.data?.message ?? 'Ошибка изменения лайка поста');
    }
    return rejectWithValue('Ошибка изменения лайка поста');
  }
});

// POST /likes/comment/:commentId  (toggle like)
export const toggleLikeComment = createAsyncThunk<
  { commentId: string },
  string,
  { rejectValue: string }
>('likes/toggleLikeComment', async (commentId, { rejectWithValue }) => {
  try {
    await $api.post(`/likes/comment/${commentId}`);
    return { commentId };
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
      state.error = null;
      state.loading = false;
    },
    // опционально: принудительно выставить флаг (если UI знает текущее состояние)
    setPostLiked(state, { payload }: PayloadAction<{ postId: string; liked: boolean }>) {
      state.byPostId[payload.postId] = payload.liked;
    },
    setCommentLiked(state, { payload }: PayloadAction<{ commentId: string; liked: boolean }>) {
      state.byCommentId[payload.commentId] = payload.liked;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(toggleLikePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleLikePost.fulfilled, (state, { payload }) => {
        state.loading = false;
        // оптимистичный flip локального флага
        const prev = !!state.byPostId[payload.postId];
        state.byPostId[payload.postId] = !prev;
        // ВАЖНО: counts не трогаем — если нужно, рефетч поста/ленты в UI.
      })
      .addCase(toggleLikePost.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Ошибка изменения лайка поста';
      })

      .addCase(toggleLikeComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleLikeComment.fulfilled, (state, { payload }) => {
        state.loading = false;
        const prev = !!state.byCommentId[payload.commentId];
        state.byCommentId[payload.commentId] = !prev;
      })
      .addCase(toggleLikeComment.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Ошибка изменения лайка комментария';
      });
  },
});

export const { clearLikes, setPostLiked, setCommentLiked } = likesSlice.actions;
export default likesSlice.reducer;


// рефетч — заново грузим с бэка;
// оптимистичный flip — моментально меняем UI (true/false) до ответа;
// принудительно выставить — задаём нужное значение, когда оно известно точно.