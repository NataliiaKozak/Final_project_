import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isAxiosError } from 'axios';
import { $api } from '../../api/api';
import type { IMessage } from '../../interfaces/message.interface';

type ApiError = { message?: string };

interface MessagesState {
  items: IMessage[];
  loading: boolean;
  error: string | null;
}

const initialState: MessagesState = {
  items: [],
  loading: false,
  error: null,
};

// GET /messages/:userId
export const fetchMessages = createAsyncThunk<IMessage[], string, { rejectValue: string }>(
  'messages/fetch',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await $api.get<IMessage[]>(`/messages/${userId}`);
      return data;
    } catch (err) {
      if (isAxiosError<ApiError>(err)) {
        return rejectWithValue(err.response?.data?.message ?? 'Ошибка загрузки сообщений');
      }
      return rejectWithValue('Ошибка загрузки сообщений');
    }
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.items = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (b) => {
    b
      .addCase(fetchMessages.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchMessages.fulfilled, (s, a: PayloadAction<IMessage[]>) => {
        s.loading = false; s.items = a.payload;
      })
      .addCase(fetchMessages.rejected, (s, a) => {
        s.loading = false; s.error = a.payload ?? 'Ошибка загрузки сообщений';
      });
  },
});

export const { clearMessages } = messagesSlice.actions;
export default messagesSlice.reducer;