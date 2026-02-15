import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/ErrorBoundary';
import { useAppDispatch, useAppSelector } from './redux/hooks';

import Sidebar from './components/navigation/sidebar/Sidebar';
import { Footer } from './components/footer/Footer';

// Lazy-loaded pages (code splitting)
const HomePage = React.lazy(() => import('./pages/homePage/HomePage'));
const Explore = React.lazy(() => import('./pages/explorePage/ExplorePage'));
const MessagesPage = React.lazy(() => import('./pages/messagesPage/MessagesPage'));
const CreatePostPage = React.lazy(() => import('./pages/createPostPage/CreatePostPage'));
const ProfilePage = React.lazy(() => import('./pages/profilePage/ProfilePage'));
const EditProfilePage = React.lazy(() => import('./pages/editProfilePage/EditProfilePage'));
const OtherProfilePage = React.lazy(() => import('./pages/otherProfilePage/OtherProfilePage'));
const SearchPage = React.lazy(() => import('./pages/searchPage/SearchPage'));
const NotificationsPage = React.lazy(() => import('./pages/notificationsPage/NotificationsPage'));
const NotFoundPage = React.lazy(() => import('./pages/notFoundPage/NotFoundPage'));

// Auth pages (small, can be eager or lazy — lazy for consistency)
const LoginPage = React.lazy(() => import('./pages/loginPage/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = React.lazy(() => import('./pages/registerPage/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ResetPage = React.lazy(() => import('./pages/resetPage/ResetPage').then(m => ({ default: m.ResetPage })));

import PrivateUsers from './utils/privateUsers';

// Redux
import { setUser } from './redux/slices/authSlice';
import { getFollowersMe, getFollowingMe } from './redux/slices/followSlice';
import { setTheme } from './redux/slices/themeSlice';

import './global.css';

const PageLoader: React.FC = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
    <p>Loading...</p>
  </div>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex' }}>
        <div className="sidebar">
          <Sidebar />
        </div>
        <main style={{ flex: 1 }}>{children}</main>
      </div>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const themeMode = useAppSelector((s) => s.theme.mode);

  // 0) Apply theme class to root element
  useEffect(() => {
    const root = document.documentElement;
    let resolved: 'light' | 'dark' = 'light';
    if (themeMode === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolved = themeMode;
    }
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);

    // Listen for system theme changes when mode is 'system'
    if (themeMode === 'system') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        root.classList.remove('light', 'dark');
        root.classList.add(e.matches ? 'dark' : 'light');
      };
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    }
  }, [themeMode]);

  // 1) Инициализация auth из localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');

    if (token && userRaw) {
      try {
        const parsed = JSON.parse(userRaw);
        dispatch(setUser({ token, user: parsed }));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, [dispatch]);

  // 2) Подтягиваем followers/following после входа
  useEffect(() => {
    if (user?._id) {
      dispatch(getFollowersMe(user._id));
      dispatch(getFollowingMe(user._id));
    }
  }, [dispatch, user?._id]);

  return (
    <HelmetProvider>
    <ErrorBoundary>
    <div className="globalContainer">
      <Router>
        <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset" element={<ResetPage />} />

          {/* Приватная зона */}
          <Route element={<PrivateUsers />}>
            <Route
              path="/home"
              element={
                <Layout>
                  <HomePage />
                </Layout>
              }
            />
            <Route
              path="/explore"
              element={
                <Layout>
                  <Explore />
                </Layout>
              }
            />
            <Route
              path="/messages"
              element={
                <Layout>
                  <MessagesPage />
                </Layout>
              }
            />
            <Route
              path="/create"
              element={
                <Layout>
                  <CreatePostPage />
                </Layout>
              }
            />
            <Route
              path="/profile"
              element={
                <Layout>
                  <ProfilePage />
                </Layout>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <Layout>
                  <EditProfilePage />
                </Layout>
              }
            />
            <Route
              path="/profile/:userId"
              element={
                <Layout>
                  <OtherProfilePage />
                </Layout>
              }
            />
            <Route
              path="/search"
              element={
                <Layout>
                  <SearchPage />
                </Layout>
              }
            />
            <Route
              path="/notifications"
              element={
                <Layout>
                  <NotificationsPage />
                </Layout>
              }
            />
            {/* 404 в приватной зоне */}
            <Route
              path="*"
              element={
                <Layout>
                  <NotFoundPage />
                </Layout>
              }
            />
          </Route>
        </Routes>
        </Suspense>
      </Router>
    </div>
    </ErrorBoundary>
    </HelmetProvider>
  );
};

export default App;
