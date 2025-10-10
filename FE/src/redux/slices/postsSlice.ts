import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { isAxiosError } from 'axios';
import { $api } from '../../api/api';
import type { IPost, PostPreview } from '../../interfaces/post.interface';

type ApiError = { message?: string };

interface PostsState {
  posts: IPost[]; // лента: GET /posts
  loading: boolean;
  error: string | null;
}

const initialState: PostsState = {
  posts: [],
  loading: false,
  error: null,
};

// GET /posts → лента
export const getAllPosts = createAsyncThunk<IPost[], void, { rejectValue: string }>(
  'allPosts',
  async (_: void, { rejectWithValue }) => {
    try {
      const { data } = await $api.get<IPost[]>('/posts');
      return data;
    } catch (err) {
      if (isAxiosError<ApiError>(err)) {
        return rejectWithValue(err.response?.data?.message ?? 'Ошибка загрузки постов');
      }
      return rejectWithValue('Ошибка загрузки постов');
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
        return rejectWithValue(err.response?.data?.message ?? 'Ошибка загрузки Explore');
      }
      return rejectWithValue('Ошибка загрузки Explore');
    }
  }
);


//  GET /posts/user/:userId
export const getOtherUserPosts = createAsyncThunk<PostPreview[], string, { rejectValue: string }>(
  'posts/getOtherUserPosts',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await $api.get<PostPreview[]>(`/posts/user/${userId}`);
      return data;
    } catch (err) {
      if (isAxiosError<ApiError>(err)) {
        return rejectWithValue(err.response?.data?.message ?? 'Ошибка загрузки постов пользователя');
      }
      return rejectWithValue('Ошибка загрузки постов пользователя');
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
    return { postId, likesCount: (data as any).likes_count }; // если контроллер начнет возвращать счётчик
  } catch (err) {
    if (isAxiosError<ApiError>(err)) {
      return rejectWithValue(err.response?.data?.message ?? 'Ошибка изменения лайка');
    }
    return rejectWithValue('Ошибка изменения лайка');
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
      return rejectWithValue(err.response?.data?.message ?? 'Ошибка обновления поста');
    }
    return rejectWithValue('Ошибка обновления поста');
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
        state.loading = false; state.posts = action.payload;
      })
      .addCase(getAllPosts.rejected, (state, action) => {
        state.loading = false; state.error = action.payload ?? 'Error loading posts';
      })

      // getAllPublicPosts (explore)
      .addCase(getAllPublicPosts.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(getAllPublicPosts.fulfilled, (_state, _action) => {
            // при необходимости сделаем отдельное поле state.explore: PostPreview[]
      })
      .addCase(getAllPublicPosts.rejected, (state, action) => {
        state.loading = false; state.error = action.payload ?? 'Error loading explore posts';
      })

      // getOtherUserPosts
      .addCase(getOtherUserPosts.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(getOtherUserPosts.fulfilled, (_state, _action) => {
        // аналогично: это превью, лучше хранить отдельно. 
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
