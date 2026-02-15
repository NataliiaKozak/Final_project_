import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { isAxiosError } from 'axios';
import { $api } from '../../api/api';
import type { IPost, PostPreview } from '../../interfaces/post.interface';

import type { ApiError } from '../../interfaces/api.interface';

interface PostsState {
  posts: IPost[]; // лента: GET /posts
  explore: PostPreview[];
  otherUserPosts: IPost[];
  loading: boolean;
  error: string | null;
}

const initialState: PostsState = {
  posts: [],
  explore: [],
  otherUserPosts: [],
  loading: false,
  error: null,
};

// GET /posts → лента (paginated)
export const getAllPosts = createAsyncThunk<
  { posts: IPost[]; total: number; page: number; pages: number },
  { page?: number; limit?: number } | void,
  { rejectValue: string }
>(
  'allPosts',
  async (params, { rejectWithValue }) => {
    try {
      const page = (params && 'page' in params) ? params.page : 1;
      const limit = (params && 'limit' in params) ? params.limit : 20;
      const { data } = await $api.get<{ posts: IPost[]; total: number; page: number; pages: number }>(
        `/posts?page=${page}&limit=${limit}`
      );
      return data;
    } catch (err) {
      if (isAxiosError<ApiError>(err)) {
        return rejectWithValue(err.response?.data?.message ?? 'Failed to load posts');
      }
      return rejectWithValue('Failed to load posts');
    }
  }
);

//  GET /posts/explore  → explore
export const getAllPublicPosts = createAsyncThunk<PostPreview[], void, { rejectValue: string }>(
  'allPublicPosts',
  async (_: void, { rejectWithValue }) => {
    try {
      const { data } = await $api.get<PostPreview[]>('/posts/explore');
      return data;
    } catch (err) {
      if (isAxiosError<ApiError>(err)) {
        return rejectWithValue(err.response?.data?.message ?? 'Failed to load explore');
      }
      return rejectWithValue('Failed to load explore');
    }
  }
);


//  GET /posts/user/:userId
export const getOtherUserPosts = createAsyncThunk<IPost[], string, { rejectValue: string }>(
  'posts/getOtherUserPosts',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await $api.get<IPost[]>(`/posts/user/${userId}`);
      return data;
    } catch (err) {
      if (isAxiosError<ApiError>(err)) {
        return rejectWithValue(err.response?.data?.message ?? 'Failed to load user posts');
      }
      return rejectWithValue('Failed to load user posts');
    }
  }
);

// Лайк поста
// POST /likes/post/:postId
// Возвратим postId + likesCount (если бэк вернёт), иначе только postId. у тебя на бэке токен, тело не требуется
export const likePost = createAsyncThunk<
  { postId: string; likesCount?: number },
  { postId: string },
  { rejectValue: string }
>('posts/likePost', async ({ postId }, { rejectWithValue }) => {
  try {
    const { data } = await $api.post<{ message: string; like?: unknown; likes_count?: number }>(
      `/likes/post/${postId}`
    );
    return { postId, likesCount: data.likes_count };
  } catch (err) {
    if (isAxiosError<ApiError>(err)) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to toggle like');
    }
    return rejectWithValue('Failed to toggle like');
  }
});

// Обновить пост
// PUT /posts/:postId с FormData (image? + description?)
export const updatePost = createAsyncThunk<
  IPost,
  { postId: string; updatedData: { description?: string; imageFile?: File | Blob | null } },
  { rejectValue: string }
>('posts/updatePost', async ({ postId, updatedData }, { rejectWithValue }) => {
  try {
    const form = new FormData();
    if (updatedData.description !== undefined) form.append('description', updatedData.description);
    if (updatedData.imageFile) form.append('image', updatedData.imageFile);

    const { data } = await $api.put<IPost>(`/posts/${postId}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (err) {
    if (isAxiosError<ApiError>(err)) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to update post');
    }
    return rejectWithValue('Failed to update post');
  }
});

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // getAllPosts
      .addCase(getAllPosts.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(getAllPosts.fulfilled, (state, action) => {
        state.loading = false; state.posts = action.payload.posts;
      })
      .addCase(getAllPosts.rejected, (state, action) => {
        state.loading = false; state.error = action.payload ?? 'Error loading posts';
      })

      // getAllPublicPosts (explore)
      .addCase(getAllPublicPosts.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(getAllPublicPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.explore = action.payload;
      })
      .addCase(getAllPublicPosts.rejected, (state, action) => {
        state.loading = false; state.error = action.payload ?? 'Error loading explore posts';
      })

      // getOtherUserPosts
      .addCase(getOtherUserPosts.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(getOtherUserPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.otherUserPosts = action.payload;
      })
      .addCase(getOtherUserPosts.rejected, (state, action) => {
        state.loading = false; state.error = action.payload ?? 'Error loading user posts';
      })

      // likePost — аккуратно: меняем счётчик только если сервер его вернул
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, likesCount } = action.payload;
        if (likesCount === undefined) return; // сервер не прислал — не трогаем локально
        const post = state.posts.find((p) => p._id === postId);
        if (post) post.likesCount = likesCount;
      })

      // updatePost
      .addCase(updatePost.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const idx = state.posts.findIndex((p) => p._id === updated._id);
        if (idx !== -1) state.posts[idx] = updated;
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading = false; state.error = action.payload ?? 'Error updating post';
      });
  },
});

export default postsSlice.reducer;
