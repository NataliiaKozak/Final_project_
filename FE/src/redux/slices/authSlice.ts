import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { IUser } from '../../interfaces/user.interface';

export type AuthUser = Pick<
  IUser,
  '_id' | 'username' | 'email' | 'fullName' | 'profileImage'
> & {
  bio?: string;
  website?: string;
  postsCount?: number;
};

function safeParseUser(): AuthUser | null {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      '_id' in parsed &&
      'username' in parsed
    ) {
      return parsed as AuthUser;
    }
    return null;
  } catch {
    return null;
  }
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  user: safeParseUser(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{ token: string; user: AuthUser }>,
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
