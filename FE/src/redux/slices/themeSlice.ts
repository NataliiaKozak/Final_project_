import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
}

const saved = localStorage.getItem('theme') as ThemeMode | null;

const initialState: ThemeState = {
  mode: saved ?? 'system',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleTheme(state) {
      const next = state.mode === 'dark' ? 'light' : 'dark';
      state.mode = next;
      localStorage.setItem('theme', next);
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
