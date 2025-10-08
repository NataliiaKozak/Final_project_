import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isAxiosError } from 'axios';
import { $api } from '../../api/api';
import type { Notification } from '../../interfaces/notification.interface';

type ApiError = { message?: string };

interface NotificationsState {
  actions: Notification[]; // храним, как в чужом коде называлось
  loading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  actions: [],
  loading: false,
  error: null,
};

/* ===================== THUNKS (роуты бэка) ===================== */

// GET /notifications
export const fetchNotifications = createAsyncThunk<
  Notification[],
  void,
  { rejectValue: string }
>('notifications/fetchNotifications', async (_: void, { rejectWithValue }) => {
  try {
    const { data } = await $api.get<Notification[]>('/notifications');
    return data;
  } catch (err: unknown) {
    if (isAxiosError<ApiError>(err)) {
      return rejectWithValue(
        err.response?.data?.message ?? 'Ошибка при загрузке уведомлений'
      );
    }
    return rejectWithValue('Ошибка при загрузке уведомлений');
  }
});

// PUT /notifications/read
export const markAllNotificationsRead = createAsyncThunk<
  { message: string },
  void,
  { rejectValue: string }
>('notifications/markAllRead', async (_: void, { rejectWithValue }) => {
  try {
    const { data } = await $api.put<{ message: string }>('/notifications/read');
    return data;
  } catch (err: unknown) {
    if (isAxiosError<ApiError>(err)) {
      return rejectWithValue(
        err.response?.data?.message ?? 'Ошибка при обновлении уведомлений'
      );
    }
    return rejectWithValue('Ошибка при обновлении уведомлений');
  }
});

/* ===================== SLICE ===================== */

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // опционально: очистка при логауте
    clearNotifications(state) {
      state.actions = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchNotifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchNotifications.fulfilled,
        (state, action: PayloadAction<Notification[]>) => {
          state.loading = false;
          // как и было в чужом коде — берём последние 10
          state.actions = action.payload.slice(0, 10);
        }
      )
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Ошибка при загрузке уведомлений';
      })

      // markAllNotificationsRead — помечаем локально все как прочитанные
      .addCase(markAllNotificationsRead.pending, (state) => {
        state.error = null;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.actions = state.actions.map(
          (n) => ({ ...n, isRead: true } as Notification)
        );
      })
      .addCase(markAllNotificationsRead.rejected, (state, action) => {
        state.error = action.payload ?? 'Ошибка при обновлении уведомлений';
      });
  },
});

export const { clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
