//1 простой вариант
// import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// interface User {
//   _id: string;
//   username: string;
//   email: string;
//   fullName: string;      // было full_name
//   profileImage: string;  // было profile_image
// }

// interface AuthState {
//   token: string | null;
//   user: User | null;
// }

// const initialState: AuthState = {
//   token: localStorage.getItem('token'),
//   user: localStorage.getItem('user')
//     ? JSON.parse(localStorage.getItem('user')!)
//     : null,
// };

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     // ожидаем payload ровно как отдаёт бэк: { token, user }
//     setUser: (state, action: PayloadAction<{ token: string; user: User }>) => {
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
//       localStorage.removeItem('likedPosts'); // если используешь
//     },
//   },
// });


//пораньше
// import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import type { IUser } from '../../interfaces/user.interface';

// // Бек при login/register возвращает такие поля:
// type AuthUser = Pick<IUser, '_id' | 'username' | 'email' | 'fullName' | 'profileImage'>;

// interface AuthState {
//   token: string | null;
//   user: AuthUser | null;
// }

// // Безопасный парсер JSON без использования `any`
// const parseJSON = <T>(raw: string | null): T | null => {
//   if (!raw) return null;
//   try {
//     return JSON.parse(raw) as T;
//   } catch {
//     return null;
//   }
// };

// // Инициализация из localStorage
// const initialState: AuthState = {
//   token: localStorage.getItem('token'),
//   user: parseJSON<AuthUser>(localStorage.getItem('user')),
// };

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     // payload содержит token и минимальный публичный профиль
//     setUser: (state, action: PayloadAction<{ token: string; user: AuthUser }>) => {
//       const { token, user } = action.payload;
//       state.token = token;
//       state.user = user;

//       localStorage.setItem('token', token);
//       localStorage.setItem('user', JSON.stringify(user));
//     },
//     logout: (state) => {
//       state.token = null;
//       state.user = null;

//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       localStorage.removeItem('likedPosts'); // если используешь
//     },
//   },
// });

// export const { setUser, logout } = authSlice.actions;
// export default authSlice.reducer;




//3
// import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { $api } from '../../api/api';
// import { IUser } from '../../interfaces/user.interface';

// interface AuthState {
//   token: string | null;
//   user: IUser | null;
//   loading: boolean;
//   error: string | null;
// }

// const initialState: AuthState = {
//   token: localStorage.getItem('token'),
//   user: (() => {
//     const raw = localStorage.getItem('user');
//     return raw ? (JSON.parse(raw) as IUser) : null;
//   })(),
//   loading: false,
//   error: null,
// };

// export const register = createAsyncThunk<
//   { token: string; user: IUser },
//   { username: string; email: string; password: string; fullName: string },
//   { rejectValue: string }
// >('auth/register', async (payload, { rejectWithValue }) => {
//   try {
//     const { data } = await $api.post('/auth/register', payload);
//     return data as { token: string; user: IUser };
//   } catch (e: any) {
//     const msg =
//       e?.response?.data?.message ||
//       e?.response?.data?.errors?.email ||
//       e?.response?.data?.errors?.username ||
//       'Registration error';
//     return rejectWithValue(msg);
//   }
// });

// export const login = createAsyncThunk<
//   { token: string; user: IUser },
//   { emailOrUsername: string; password: string },
//   { rejectValue: string }
// >('auth/login', async (payload, { rejectWithValue }) => {
//   try {
//     const { data } = await $api.post('/auth/login', payload);
//     return data as { token: string; user: IUser };
//   } catch (e: any) {
//     const msg = e?.response?.data?.message || 'Invalid credentials';
//     return rejectWithValue(msg);
//   }
// });

// const slice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     setUser(
//       state,
//       action: PayloadAction<{ token: string; user: IUser } | null>
//     ) {
//       if (action.payload) {
//         state.token = action.payload.token;
//         state.user = action.payload.user;
//         localStorage.setItem('token', action.payload.token);
//         localStorage.setItem('user', JSON.stringify(action.payload.user));
//       } else {
//         state.token = null;
//         state.user = null;
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//       }
//     },
//     logout(state) {
//       state.token = null;
//       state.user = null;
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(register.pending, (s) => {
//         s.loading = true;
//         s.error = null;
//       })
//       .addCase(register.fulfilled, (s, { payload }) => {
//         s.loading = false;
//         s.token = payload.token;
//         s.user = payload.user;
//         localStorage.setItem('token', payload.token);
//         localStorage.setItem('user', JSON.stringify(payload.user));
//       })
//       .addCase(register.rejected, (s, { payload }) => {
//         s.loading = false;
//         s.error = payload || 'Registration error';
//       })
//       .addCase(login.pending, (s) => {
//         s.loading = true;
//         s.error = null;
//       })
//       .addCase(login.fulfilled, (s, { payload }) => {
//         s.loading = false;
//         s.token = payload.token;
//         s.user = payload.user;
//         localStorage.setItem('token', payload.token);
//         localStorage.setItem('user', JSON.stringify(payload.user));
//       })
//       .addCase(login.rejected, (s, { payload }) => {
//         s.loading = false;
//         s.error = payload || 'Login error';
//       });
//   },
// });

// export const { setUser, logout } = slice.actions;
// export default slice.reducer;


//4 - более расширенный вариант
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { isAxiosError } from 'axios';
import { $api } from '../../api/api';

// Пользователь, который реально возвращается из /register и /login
export interface AuthUser {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  profileImage: string;
}

type ApiError = { message?: string };

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

// безопасный JSON.parse без any
const parseJSON = <T>(raw: string | null): T | null => {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
};

// Инициализация как в твоём примере (те же ключи)
const initialState: AuthState = {
  token: localStorage.getItem('token'),
  user: parseJSON<AuthUser>(localStorage.getItem('user')),
  loading: false,
  error: null,
};

// --------- Thunks (минимально, только под твои роуты) ---------

// POST /api/auth/register -> { token, user }
export const registerUser = createAsyncThunk<
  { token: string; user: AuthUser },
  { username: string; email: string; password: string; fullName: string },
  { rejectValue: string }
>('auth/registerUser', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await $api.post<{ token: string; user: AuthUser }>(
      '/api/auth/register',
      payload
    );
    return data;
  } catch (err: unknown) {
    if (isAxiosError<ApiError>(err)) {
      return rejectWithValue(err.response?.data?.message ?? 'Ошибка регистрации');
    }
    return rejectWithValue('Ошибка регистрации');
  }
});

// POST /api/auth/login -> { token, user }
export const loginUser = createAsyncThunk<
  { token: string; user: AuthUser },
  { emailOrUsername: string; password: string },
  { rejectValue: string }
>('auth/loginUser', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await $api.post<{ token: string; user: AuthUser }>(
      '/api/auth/login',
      payload
    );
    return data;
  } catch (err: unknown) {
    if (isAxiosError<ApiError>(err)) {
      return rejectWithValue(err.response?.data?.message ?? 'Ошибка входа');
    }
    return rejectWithValue('Ошибка входа');
  }
});

// POST /api/auth/forgot-password -> { message } (+ token в DEV)
export const requestPasswordReset = createAsyncThunk<
  { message: string; token?: string },
  { email: string },
  { rejectValue: string }
>('auth/requestPasswordReset', async ({ email }, { rejectWithValue }) => {
  try {
    const { data } = await $api.post<{ message: string; token?: string }>(
      '/api/auth/forgot-password',
      { email }
    );
    return data;
  } catch (err: unknown) {
    if (isAxiosError<ApiError>(err)) {
      return rejectWithValue(err.response?.data?.message ?? 'Ошибка запроса сброса');
    }
    return rejectWithValue('Ошибка запроса сброса');
  }
});

// POST /api/auth/reset-password -> { message }
export const resetPassword = createAsyncThunk<
  { message: string },
  { token: string; newPassword: string },
  { rejectValue: string }
>('auth/resetPassword', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await $api.post<{ message: string }>(
      '/api/auth/reset-password',
      payload
    );
    return data;
  } catch (err: unknown) {
    if (isAxiosError<ApiError>(err)) {
      return rejectWithValue(err.response?.data?.message ?? 'Ошибка сброса пароля');
    }
    return rejectWithValue('Ошибка сброса пароля');
  }
});

// ---------------- Slice (как в твоём примере) ----------------

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // тот же контракт payload, что ты уже используешь
    setUser: (state, action: PayloadAction<{ token: string; user: AuthUser }>) => {
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
  extraReducers: (b) => {
    b
      .addCase(registerUser.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(registerUser.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.token = payload.token;
        s.user = payload.user;
        localStorage.setItem('token', payload.token);
        localStorage.setItem('user', JSON.stringify(payload.user));
      })
      .addCase(registerUser.rejected, (s, { rejectWithValue, payload }) => {
        s.loading = false; s.error = payload ?? 'Ошибка регистрации';
      })

      .addCase(loginUser.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(loginUser.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.token = payload.token;
        s.user = payload.user;
        localStorage.setItem('token', payload.token);
        localStorage.setItem('user', JSON.stringify(payload.user));
      })
      .addCase(loginUser.rejected, (s, { payload }) => {
        s.loading = false; s.error = payload ?? 'Ошибка входа';
      })

      .addCase(requestPasswordReset.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(requestPasswordReset.fulfilled, (s) => { s.loading = false; })
      .addCase(requestPasswordReset.rejected, (s, { payload }) => {
        s.loading = false; s.error = payload ?? 'Ошибка запроса сброса';
      })

      .addCase(resetPassword.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(resetPassword.fulfilled, (s) => { s.loading = false; })
      .addCase(resetPassword.rejected, (s, { payload }) => {
        s.loading = false; s.error = payload ?? 'Ошибка сброса пароля';
      });
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;