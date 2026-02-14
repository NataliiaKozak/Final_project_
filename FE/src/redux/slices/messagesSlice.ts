import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isAxiosError } from 'axios';
import { $api } from '../../api/api';
import type { IMessage } from '../../interfaces/message.interface';

import type { ApiError } from '../../interfaces/api.interface';

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

// GET /messages — все диалоги
export const fetchAllConversations = createAsyncThunk<
  IMessage[],
  void,
  { rejectValue: string }
>('messages/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await $api.get<IMessage[]>('/messages');
    return data;
  } catch (err) {
    if (isAxiosError<ApiError>(err)) {
      return rejectWithValue(
        err.response?.data?.message ?? 'Ошибка загрузки диалогов',
      );
    }
    return rejectWithValue('Ошибка загрузки диалогов');
  }
});

// GET /messages/:userId
export const fetchMessages = createAsyncThunk<
  IMessage[],
  string,
  { rejectValue: string }
>('messages/fetch', async (userId, { rejectWithValue }) => {
  try {
    const { data } = await $api.get<IMessage[]>(`/messages/${userId}`);
    return data;
  } catch (err) {
    if (isAxiosError<ApiError>(err)) {
      return rejectWithValue(
        err.response?.data?.message ?? 'Ошибка загрузки сообщений',
      );
    }
    return rejectWithValue('Ошибка загрузки сообщений');
  }
});

// POST /messages
export const sendMessage = createAsyncThunk<
  IMessage,
  { recipientId: string; text: string },
  { rejectValue: string }
>('messages/send', async ({ recipientId, text }, { rejectWithValue }) => {
  try {
    const { data } = await $api.post<IMessage>('/messages', {
      recipientId,
      text,
    });
    return data;
  } catch (err) {
    if (isAxiosError<ApiError>(err)) {
      return rejectWithValue(
        err.response?.data?.message ?? 'Ошибка отправки сообщения',
      );
    }
    return rejectWithValue('Ошибка отправки сообщения');
  }
});

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.items = [];
      state.error = null;
      state.loading = false;
    },
    addMessage: (state, action: PayloadAction<IMessage>) => {
      const exists = state.items.some((m) => m._id === action.payload._id);
      if (!exists) {
        state.items.push(action.payload);
      }
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchAllConversations.pending, (s) => {
      s.loading = true;
      s.error = null;
    })
      .addCase(
        fetchAllConversations.fulfilled,
        (s, a: PayloadAction<IMessage[]>) => {
          s.loading = false;
          s.items = a.payload;
        },
      )
      .addCase(fetchAllConversations.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload ?? 'Ошибка загрузки диалогов';
      })
      .addCase(fetchMessages.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchMessages.fulfilled, (s, a: PayloadAction<IMessage[]>) => {
        s.loading = false;
        s.items = a.payload;
      })
      .addCase(fetchMessages.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload ?? 'Ошибка загрузки сообщений';
      })
      .addCase(sendMessage.fulfilled, (s, a: PayloadAction<IMessage>) => {
        const exists = s.items.some((m) => m._id === a.payload._id);
        if (!exists) {
          s.items.push(a.payload);
        }
      })
      .addCase(sendMessage.rejected, (s, a) => {
        s.error = a.payload ?? 'Ошибка отправки сообщения';
      });
  },
});

export const { clearMessages, addMessage } = messagesSlice.actions;
export default messagesSlice.reducer;
