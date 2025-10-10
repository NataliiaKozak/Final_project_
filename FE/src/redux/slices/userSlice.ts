import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isAxiosError } from 'axios';
import { $api } from '../../api/api';
import type {
  IUser,
  UpdateProfilePayload,
} from '../../interfaces/user.interface';

type ApiError = { message?: string };

interface UserState {
  user: IUser[]; // список пользователей 
  currentUser: IUser | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: [],
  currentUser: null,
  loading: false,
  error: null,
};

/* ===================== THUNKS (роуты бэка) ===================== */

// GET /users/:id — профиль пользователя (публичный)
export const getUserById = createAsyncThunk<
  IUser,
  string,
  { rejectValue: string }
>('user/getUserById', async (userId, { rejectWithValue }) => {
  try {
    const { data } = await $api.get<IUser>(`/users/${userId}`);
    return data;
  } catch (err: unknown) {
    if (isAxiosError<ApiError>(err)) {
      return rejectWithValue(
        err.response?.data?.message ?? 'Ошибка загрузки пользователя'
      );
    }
    return rejectWithValue('Ошибка загрузки пользователя');
  }
});

// PUT /users  (multipart) — обновление своего профиля
export const updateProfile = createAsyncThunk<
  IUser,
  UpdateProfilePayload,
  { rejectValue: string }
>('user/updateProfile', async (payload, { rejectWithValue }) => {
  try {
    const form = new FormData();
    if (payload.username !== undefined)
      form.append('username', payload.username);
    if (payload.bio !== undefined) form.append('bio', payload.bio);
    if (payload.fullName !== undefined)
      form.append('fullName', payload.fullName);
    if (payload.website !== undefined) form.append('website', payload.website);
    if (payload.profileImageFile)
      form.append('profileImage', payload.profileImageFile);

    const { data } = await $api.put<IUser>('/users', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (err: unknown) {
    if (isAxiosError<ApiError>(err)) {
      return rejectWithValue(
        err.response?.data?.message ?? 'Ошибка обновления профиля'
      );
    }
    return rejectWithValue('Ошибка обновления профиля');
  }
});

// GET /follows/:userId/followers — получаем массив пользователей → считаем followersCount
export const getFollowers = createAsyncThunk<
  number,
  string,
  { rejectValue: string }
>('user/getFollowers', async (userId, { rejectWithValue }) => {
  try {
    const { data } = await $api.get<
      Array<{ _id: string; username: string; profileImage?: string }>
    >(`/follows/${userId}/followers`);
    return data.length;
  } catch (err: unknown) {
    if (isAxiosError<ApiError>(err)) {
      return rejectWithValue(
        err.response?.data?.message ?? 'Ошибка загрузки подписчиков'
      );
    }
    return rejectWithValue('Ошибка загрузки подписчиков');
  }
});

// GET /follows/:userId/following — получаем массив пользователей → считаем followingCount
export const getFollowing = createAsyncThunk<
  number,
  string,
  { rejectValue: string }
>('user/getFollowing', async (userId, { rejectWithValue }) => {
  try {
    const { data } = await $api.get<
      Array<{ _id: string; username: string; profileImage?: string }>
    >(`/follows/${userId}/following`);
    return data.length;
  } catch (err: unknown) {
    if (isAxiosError<ApiError>(err)) {
      return rejectWithValue(
        err.response?.data?.message ?? 'Ошибка загрузки подписок'
      );
    }
    return rejectWithValue('Ошибка загрузки подписок');
  }
});

/* ===================== SLICE ===================== */

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    changeTimeInLastMessage: (
      state,
      action: PayloadAction<{ userId: string; lastMessage: string }>
    ) => {
      state.user = state.user.map((u) =>
        u._id === action.payload.userId
          ? {
              ...u,
               lastMessage:
                action.payload.lastMessage,
            }
          : u
      );
    },
    // опционально: очистка состояния при выходе
    clearUserState: (state) => {
      state.user = [];
      state.currentUser = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getUserById
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentUser = null;
      })
      .addCase(getUserById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.currentUser = payload;
      })
      .addCase(getUserById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Ошибка загрузки пользователя';
      })

      // updateProfile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, { payload }) => {
        state.loading = false;
        // если редактируем свой профиль — обновляем currentUser
        state.currentUser = payload;
      })
      .addCase(updateProfile.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Ошибка обновления профиля';
      })

      // followers count
      .addCase(getFollowers.fulfilled, (state, { payload }) => {
        if (state.currentUser) state.currentUser.followersCount = payload;
      })
      // following count
      .addCase(getFollowing.fulfilled, (state, { payload }) => {
        if (state.currentUser) state.currentUser.followingCount = payload;
      });
  },
});

export const { changeTimeInLastMessage, clearUserState } = userSlice.actions;
export default userSlice.reducer;

