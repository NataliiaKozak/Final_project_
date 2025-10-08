import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isAxiosError } from 'axios';
import { $api } from '../../api/api';
import type { IUser } from '../../interfaces/user.interface';

type ApiError = { message?: string };
type SearchItem = Pick<IUser, '_id' | 'username' | 'fullName' | 'profileImage'>;

interface SearchState {
  results: SearchItem[];
  loading: boolean;
  error: string | null;
  lastQuery: string;
}

const initialState: SearchState = {
  results: [],
  loading: false,
  error: null,
  lastQuery: '',
};

// GET /search?query=...
export const searchUsers = createAsyncThunk<SearchItem[], string, { rejectValue: string }>(
  'search/users',
  async (query, { rejectWithValue }) => {
    try {
      const q = query.trim();
      if (!q) return [];
      const { data } = await $api.get<SearchItem[]>('/search', { params: { query: q } });
      return data;
    } catch (err) {
      if (isAxiosError<ApiError>(err)) {
        return rejectWithValue(err.response?.data?.message ?? 'Ошибка поиска');
      }
      return rejectWithValue('Ошибка поиска');
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    clearSearch: (state) => {
      state.results = [];
      state.error = null;
      state.lastQuery = '';
      state.loading = false;
    },
  },
  extraReducers: (b) => {
    b
      .addCase(searchUsers.pending, (s, a) => {
        s.loading = true; s.error = null; s.lastQuery = (a.meta.arg ?? '').trim();
      })
      .addCase(searchUsers.fulfilled, (s, a: PayloadAction<SearchItem[]>) => {
        s.loading = false; s.results = a.payload;
      })
      .addCase(searchUsers.rejected, (s, a) => {
        s.loading = false; s.error = a.payload ?? 'Ошибка поиска';
      });
  },
});

export const { clearSearch } = searchSlice.actions;
export default searchSlice.reducer;