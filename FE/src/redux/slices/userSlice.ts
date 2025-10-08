import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isAxiosError } from 'axios';
import { $api } from '../../api/api';
import type { IUser } from '../../interfaces/user.interface';

type ApiError = { message?: string };

interface UserState {
  user: IUser[]; // список пользователей
  currentUser: IUser | null; // открытый профиль
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: [],
  currentUser: null,
  loading: false,
  error: null,
};

// GET /users/:id
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
        err.response?.data?.message ?? 'Ошибка загрузки профиля'
      );
    }
    return rejectWithValue('Ошибка загрузки профиля');
  }
});

// Переименованная санка: поиск пользователей (без аргумента, дефолтный query)
export const searchUsers = createAsyncThunk<
  IUser[],
  void,
  { rejectValue: string }
>('user/searchUsers', async (_: void, { rejectWithValue }) => {
  try {
    const { data } = await $api.get<
      Array<Pick<IUser, '_id' | 'username' | 'fullName' | 'profileImage'>>
    >(
      '/search',
      { params: { query: 'a' } } // дефолт, чтобы не падать на 400
    );
    const mapped: IUser[] = data.map(
      (u) =>
        ({
          _id: u._id,
          username: u.username,
          email: '', // из поиска не приходит
          fullName: u.fullName,
          profileImage: u.profileImage,
        } as IUser)
    );
    return mapped;
  } catch (err: unknown) {
    if (isAxiosError<ApiError>(err)) {
      return rejectWithValue(
        err.response?.data?.message ?? 'Ошибка загрузки пользователей'
      );
    }
    return rejectWithValue('Ошибка загрузки пользователей');
  }
});

// GET /follows/:userId/followers → обновляем только счётчик
export const getFollow = createAsyncThunk<
  Array<Pick<IUser, '_id' | 'username' | 'fullName' | 'profileImage'>>,
  string,
  { rejectValue: string }
>('user/getFollow', async (userId, { rejectWithValue }) => {
  try {
    const { data } = await $api.get<
      Array<Pick<IUser, '_id' | 'username' | 'fullName' | 'profileImage'>>
    >(`/follows/${userId}/followers`);
    return data;
  } catch (err: unknown) {
    if (isAxiosError<ApiError>(err)) {
      return rejectWithValue(
        err.response?.data?.message ?? 'Ошибка загрузки подписчиков'
      );
    }
    return rejectWithValue('Ошибка загрузки подписчиков');
  }
});

// GET /follows/:userId/following → обновляем только счётчик
export const getFollowing = createAsyncThunk<
  Array<Pick<IUser, '_id' | 'username' | 'fullName' | 'profileImage'>>,
  string,
  { rejectValue: string }
>('user/getFollowing', async (userId, { rejectWithValue }) => {
  try {
    const { data } = await $api.get<
      Array<Pick<IUser, '_id' | 'username' | 'fullName' | 'profileImage'>>
    >(`/follows/${userId}/following`);
    return data;
  } catch (err: unknown) {
    if (isAxiosError<ApiError>(err)) {
      return rejectWithValue(
        err.response?.data?.message ?? 'Ошибка загрузки подписок'
      );
    }
    return rejectWithValue('Ошибка загрузки подписок');
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    changeTimeInLastMessage: (
      state,
      { payload }: PayloadAction<{ userId: string; lastMessage: string }>
    ) => {
      state.user = state.user.map((u) =>
        u._id === payload.userId
          ? ({ ...u, lastMessage: payload.lastMessage } as IUser)
          : u
      );
      if (state.currentUser && state.currentUser._id === payload.userId) {
        (state.currentUser as IUser & { lastMessage?: string }).lastMessage =
          payload.lastMessage;
      }
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
      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload || null;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Error loading user';
      })

      // searchUsers
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Error loading users';
      })

      // followers
      .addCase(getFollow.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFollow.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (state.currentUser) {
          state.currentUser.followersCount = payload.length;
        }
      })
      .addCase(getFollow.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Error loading followers';
      })

      // following
      .addCase(getFollowing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFollowing.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (state.currentUser) {
          state.currentUser.followingCount = payload.length;
        }
      })
      .addCase(getFollowing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Error loading following';
      });
  },
});

export const { changeTimeInLastMessage } = userSlice.actions;
export default userSlice.reducer;
