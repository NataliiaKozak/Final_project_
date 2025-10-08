import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { isAxiosError } from 'axios';
import { $api } from '../../api/api';
import type { IComment } from '../../interfaces/comment.interface';

type ApiError = { message?: string };

interface CommentsState {
  comments: IComment[];
  loading: boolean;
  error: string | null;
}

const initialState: CommentsState = {
  comments: [],
  loading: false,
  error: null,
};

/* ===================== THUNKS ===================== */

// GET /comments/post/:postId
export const fetchComments = createAsyncThunk<IComment[], string, { rejectValue: string }>(
  'comments/fetchComments',
  async (postId, { rejectWithValue }) => {
    try {
      const { data } = await $api.get<IComment[]>(`/comments/post/${postId}`);
      return data;
    } catch (err: unknown) {
      if (isAxiosError<ApiError>(err)) {
        return rejectWithValue(err.response?.data?.message ?? 'Error fetching comments');
      }
      return rejectWithValue('Error fetching comments');
    }
  }
);

// POST /comments/:postId   (body: { text })
export const addComment = createAsyncThunk<IComment, { postId: string; text: string }, { rejectValue: string }>(
  'comments/addComment',
  async ({ postId, text }, { rejectWithValue }) => {
    try {
      // контроллер возвращает { message, comment }
      const { data } = await $api.post<{ message: string; comment: IComment }>(`/comments/${postId}`, { text });
      return data.comment;
    } catch (err: unknown) {
      if (isAxiosError<ApiError>(err)) {
        return rejectWithValue(err.response?.data?.message ?? 'Error adding comment');
      }
      return rejectWithValue('Error adding comment');
    }
  }
);

// POST /likes/comment/:commentId   (toggle like)
// Бэк не возвращает обновлённый комментарий → локально ничего не меняем.
export const likeComment = createAsyncThunk<void, { commentId: string }, { rejectValue: string }>(
  'comments/likeComment',
  async ({ commentId }, { rejectWithValue }) => {
    try {
      await $api.post(`/likes/comment/${commentId}`);
    } catch (err: unknown) {
      if (isAxiosError<ApiError>(err)) {
        return rejectWithValue(err.response?.data?.message ?? 'Error liking comment');
      }
      return rejectWithValue('Error liking comment');
    }
  }
);

// DELETE /comments/:commentId
export const deleteComment = createAsyncThunk<{ commentId: string; message: string }, string, { rejectValue: string }>(
  'comments/deleteComment',
  async (commentId, { rejectWithValue }) => {
    try {
      const { data } = await $api.delete<{ message: string }>(`/comments/${commentId}`);
      return { commentId, message: data.message };
    } catch (err: unknown) {
      if (isAxiosError<ApiError>(err)) {
        return rejectWithValue(err.response?.data?.message ?? 'Error deleting comment');
      }
      return rejectWithValue('Error deleting comment');
    }
  }
);

/* ===================== SLICE ===================== */

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    setComments: (state, action: PayloadAction<IComment[]>) => {
      state.comments = action.payload;
    },
    // при закрытии модалки можно очищать список:
    // clearComments: (state) => { state.comments = []; state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // fetchComments
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Error fetching comments';
      })

      // addComment
      .addCase(addComment.pending, (state) => {
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.comments.push(action.payload);
      })
      .addCase(addComment.rejected, (state, action) => {
        state.error = action.payload ?? 'Error adding comment';
      })

      // likeComment — локально не меняем комментарий
      .addCase(likeComment.rejected, (state, action) => {
        state.error = action.payload ?? 'Error liking comment';
      })

      // deleteComment — удаляем из state по id
      .addCase(deleteComment.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.comments = state.comments.filter((c) => c._id !== action.payload.commentId);
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.error = action.payload ?? 'Error deleting comment';
      });
  },
});

export const { setComments } = commentsSlice.actions;
// export const { setComments, clearComments } = commentsSlice.actions;

export default commentsSlice.reducer;