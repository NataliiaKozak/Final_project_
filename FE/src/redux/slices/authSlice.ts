import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { IUser } from '../../interfaces/user.interface';

export type AuthUser = Pick<
  IUser,
  '_id' | 'username' | 'email' | 'fullName' | 'profileImage'
> & {
  bio?: string;
  website?: string;
  postsCount?: number;
  // followersCount?: number;
  // followingCount?: number;
};

interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  user: localStorage.getItem('user')
    ? (JSON.parse(localStorage.getItem('user')!) as AuthUser)
    : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{ token: string; user: AuthUser }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;

      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.token = null;
      state.user = null;

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('likedPosts'); 
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;

// import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// import { isAxiosError } from 'axios';
// import { $api } from '../../api/api';
// import type { IUser } from '../../interfaces/user.interface';

// // Пользователь, который возвращают /auth/register и /auth/login
// type AuthUser = Pick<IUser, '_id' | 'username' | 'email' | 'fullName' | 'profileImage'>;

// type ApiError = { message?: string };

// interface AuthState {
//   token: string | null;
//   user: AuthUser | null;
//   loading: boolean;
//   error: string | null;
// }

// const safeParse = <T,>(raw: string | null): T | null => {
//   if (!raw) return null;
//   try { return JSON.parse(raw) as T; } catch { return null; }
// };

// const initialState: AuthState = {
//   token: localStorage.getItem('token'),
//   user: safeParse<AuthUser>(localStorage.getItem('user')),
//   loading: false,
//   error: null,
// };

// /* ===================== THUNKS ===================== */

// // POST /auth/register -> { token, user }
// export const registerUser = createAsyncThunk<
//   { token: string; user: AuthUser },
//   { username: string; email: string; password: string; fullName: string },
//   { rejectValue: string }
// >('auth/registerUser', async (payload, { rejectWithValue }) => {
//   try {
//     const { data } = await $api.post<{ token: string; user: AuthUser }>('/auth/register', payload);
//     return data;
//   } catch (err) {
//     if (isAxiosError<ApiError>(err)) {
//       return rejectWithValue(err.response?.data?.message ?? 'Ошибка регистрации');
//     }
//     return rejectWithValue('Ошибка регистрации');
//   }
// });

// // POST /auth/login -> { token, user }
// export const loginUser = createAsyncThunk<
//   { token: string; user: AuthUser },
//   { emailOrUsername: string; password: string },
//   { rejectValue: string }
// >('auth/loginUser', async (payload, { rejectWithValue }) => {
//   try {
//     const { data } = await $api.post<{ token: string; user: AuthUser }>('/auth/login', payload);
//     return data;
//   } catch (err) {
//     if (isAxiosError<ApiError>(err)) {
//       return rejectWithValue(err.response?.data?.message ?? 'Ошибка входа');
//     }
//     return rejectWithValue('Ошибка входа');
//   }
// });

// // POST /auth/forgot-password -> { message } (в DEV также { token })
// export const requestPasswordReset = createAsyncThunk<
//   { message: string; token?: string },
//   { email: string },
//   { rejectValue: string }
// >('auth/requestPasswordReset', async ({ email }, { rejectWithValue }) => {
//   try {
//     const { data } = await $api.post<{ message: string; token?: string }>(
//       '/auth/forgot-password',
//       { email }
//     );
//     return data;
//   } catch (err) {
//     if (isAxiosError<ApiError>(err)) {
//       return rejectWithValue(err.response?.data?.message ?? 'Ошибка запроса сброса');
//     }
//     return rejectWithValue('Ошибка запроса сброса');
//   }
// });

// // POST /auth/reset-password -> { message }
// export const resetPassword = createAsyncThunk<
//   { message: string },
//   { token: string; newPassword: string },
//   { rejectValue: string }
// >('auth/resetPassword', async (payload, { rejectWithValue }) => {
//   try {
//     const { data } = await $api.post<{ message: string }>('/auth/reset-password', payload);
//     return data;
//   } catch (err) {
//     if (isAxiosError<ApiError>(err)) {
//       return rejectWithValue(err.response?.data?.message ?? 'Ошибка сброса пароля');
//     }
//     return rejectWithValue('Ошибка сброса пароля');
//   }
// });

// /* ===================== SLICE ===================== */

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     // синхронная установка как в чужом проекте
//     setUser: (state, action: PayloadAction<{ token: string; user: AuthUser }>) => {
//       state.token = action.payload.token;
//       state.user = action.payload.user;
//       localStorage.setItem('user', JSON.stringify(action.payload.user));
//       localStorage.setItem('token', action.payload.token);
//     },
//     logout: (state) => {
//       state.token = null;
//       state.user = null;
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       localStorage.removeItem('likedPosts'); // если используется
//     },
//   },
//   extraReducers: (b) => {
//     b
//       // register
//       .addCase(registerUser.pending, (s) => { s.loading = true; s.error = null; })
//       .addCase(registerUser.fulfilled, (s, { payload }) => {
//         s.loading = false;
//         s.token = payload.token;
//         s.user = payload.user;
//         localStorage.setItem('token', payload.token);
//         localStorage.setItem('user', JSON.stringify(payload.user));
//       })
//       .addCase(registerUser.rejected, (s, { payload }) => {
//         s.loading = false; s.error = payload ?? 'Ошибка регистрации';
//       })

//       // login
//       .addCase(loginUser.pending, (s) => { s.loading = true; s.error = null; })
//       .addCase(loginUser.fulfilled, (s, { payload }) => {
//         s.loading = false;
//         s.token = payload.token;
//         s.user = payload.user;
//         localStorage.setItem('token', payload.token);
//         localStorage.setItem('user', JSON.stringify(payload.user));
//       })
//       .addCase(loginUser.rejected, (s, { payload }) => {
//         s.loading = false; s.error = payload ?? 'Ошибка входа';
//       })

//       // forgot/reset
//       .addCase(requestPasswordReset.pending, (s) => { s.loading = true; s.error = null; })
//       .addCase(requestPasswordReset.fulfilled, (s) => { s.loading = false; })
//       .addCase(requestPasswordReset.rejected, (s, { payload }) => {
//         s.loading = false; s.error = payload ?? 'Ошибка запроса сброса';
//       })

//       .addCase(resetPassword.pending, (s) => { s.loading = true; s.error = null; })
//       .addCase(resetPassword.fulfilled, (s) => { s.loading = false; })
//       .addCase(resetPassword.rejected, (s, { payload }) => {
//         s.loading = false; s.error = payload ?? 'Ошибка сброса пароля';
//       });
//   },
// });

// export const { setUser, logout } = authSlice.actions;
// export default authSlice.reducer;
