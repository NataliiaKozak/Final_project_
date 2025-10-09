// import { configureStore } from '@reduxjs/toolkit';

// import authReducer from './slices/authSlice';
// import userReducer from './slices/userSlice';

// const store = configureStore({
//   reducer: {
//     user: userReducer,
//     auth: authReducer,
//   },
// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

// export default store;

import { configureStore } from '@reduxjs/toolkit';

import authReducer from '../redux/slices/authSlice';
import userReducer from '../redux/slices/userSlice';
import postsReducer from '../redux/slices/postsSlice';
import likesReducer from '../redux/slices/likesSlice';
import commentsReducer from '../redux/slices/commentsSlice';
import followReducer from '../redux/slices/followSlice';
import notificationsReducer from '../redux/slices/notificationsSlice';
import messagesReducer from '../redux/slices/messagesSlice';
import searchReducer from '../redux/slices/searchSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    posts: postsReducer,
    likes: likesReducer,
    comments: commentsReducer,
    follow: followReducer,
    notifications: notificationsReducer,
    messages: messagesReducer,
    search: searchReducer,
  },
  // если вдруг ругнётся на FormData в санках — можно включить это:
  // middleware: (getDefault) =>
  //   getDefault({
  //     serializableCheck: false,
  //   }),
  devTools: import.meta.env.MODE !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
