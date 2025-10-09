import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Sidebar from './components/navigation/sidebar/Sidebar';
import { Footer } from './components/footer/Footer';

// Страницы
import HomePage from './pages/homePage/HomePage';
import Explore from './pages/explorePage/ExplorePage';
import MessagesPage from './pages/messagesPage/MessagesPage'; // если ещё нет — можно временно поставить-заглушку
import CreatePostPage from './pages/createPostPage/CreatePostPage';
import ProfilePage from './pages/profilePage/ProfilePage';
import EditProfilePage from './pages/editProfilePage/EditProfilePage';
import OtherProfilePage from './pages/otherProfilePage/OtherProfilePage';
import { LoginPage } from './pages/loginPage/LoginPage';
import { RegisterPage } from './pages/registerPage/RegisterPage';
import { ResetPage } from './pages/resetPage/ResetPage';
import NotFoundPage from './pages/notFoundPage/NotFoundPage';
import SearchPage from './pages/searchPage/SearchPage';
import NotificationsPage from './pages/notificationsPage/NotificationsPage';

import PrivateUsers from './utils/privateUsers';

// Redux
import { setUser } from './redux/slices/authSlice';
import { getFollowersMe, getFollowingMe } from './redux/slices/followSlice';
import type { AppDispatch, RootState } from './redux/store';

import './global.css';

// Простой лэйаут со Sidebar + Footer
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
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.auth.user);

  // 1) Инициализация auth из localStorage (без any)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');

    if (token && userRaw) {
      try {
        const parsed = JSON.parse(userRaw);
        dispatch(setUser({ token, user: parsed }));
      } catch {
        // если в LS лежит битый JSON — очищаем
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
    <div className="globalContainer">
      <Router>
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
                  {/* На странице модалки нет — ImageForm внутри страницы самоуправляется */}
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
      </Router>
    </div>
  );
};

export default App;

// import React, { useEffect, FC } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// import Sidebar from './components/navigation/sidebar/Sidebar';
// import { Footer } from './components/footer/Footer';
// import PrivateUsers from './utils/PrivateUsers';

// import PrivateRoutesUsers from './guard/privateRoutes/privateUsers';

// import { ImageForm } from './molecules/imageForm/ImageForm';

// import CreatePage from './organisms/createPage/CreatePostPage';
// import EditProfilePage from './organisms/editProfilePage/EditProfilePage';
// import ExplorePage from './organisms/explorePage/ExplorePage';
// import HomePage from './organisms/homePage/HomePage';
// import { LoginPage } from './organisms/loginPage/LoginPage';
// import MessagesPage from './organisms/messagesPage/MessagesPage';
// import OtherProfilePage from './organisms/otherProfilePage/OtherProfilePage';
// import ProfilePage from './organisms/profilePage/ProfilePage';
// import { RegisterPage } from './organisms/registerPage/RegisterPage';
// import { ResetPage } from './organisms/resetPage/ResetPage';
// import { setUser } from './redux/slices/authSlice';

// import { getFollowersMe, getFollowingMe } from './redux/slices/followSlice';

// // Типы стора
// import { AppDispatch, RootState } from './redux/store';
// import './global.css';
// import NotFoundPage from './organisms/notFoundPage/NotFoundPage';

// const Layout: FC<{ children: React.ReactNode }> = ({ children }) => {
//   return (
//     <div style={{ display: 'flex', flexDirection: 'column' }}>
//       <div style={{ display: 'flex' }}>
//         <div className="sidebar">
//           <Sidebar />
//         </div>
//         <main>{children}</main>
//       </div>
//       <footer>
//         <Footer />
//       </footer>
//     </div>
//   );
// };

// const App: React.FC = () => {
//   const { user } = useSelector((state: RootState) => state.auth);
//   const dispatch = useDispatch<AppDispatch>();

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     const user = localStorage.getItem('user');

//     if (token && user) {
//       dispatch(setUser({ token, user: JSON.parse(user) }));
//     }
//   }, [dispatch]);

//   useEffect(() => {
//     if (user) {
//       dispatch(getFollowersMe(user._id));
//       dispatch(getFollowingMe(user._id));
//     }
//   }, [dispatch, user]);

//   return (
//     <div className="globalContainer">
//       <Router>
//         <Routes>
//           <Route path="/" element={<LoginPage />} />
//           <Route path="/register" element={<RegisterPage />} />
//           <Route path="/reset" element={<ResetPage />} />
//           <Route path="/upload" element={<ImageForm />} />
//           <Route element={<PrivateRoutesUsers />}>
//             <Route
//               path="/home"
//               element={
//                 <Layout>
//                   <HomePage />
//                 </Layout>
//               }
//             />
//             <Route
//               path="/explore"
//               element={
//                 <Layout>
//                   <ExplorePage />
//                 </Layout>
//               }
//             />
//             <Route
//               path="/messages"
//               element={
//                 <Layout>
//                   <MessagesPage />
//                 </Layout>
//               }
//             />
//             <Route
//               path="/create"
//               element={
//                 <Layout>
//                   <CreatePage />
//                 </Layout>
//               }
//             />
//             <Route
//               path="/profile"
//               element={
//                 <Layout>
//                   <ProfilePage />
//                 </Layout>
//               }
//             />
//             <Route
//               path="/profile/edit"
//               element={
//                 <Layout>
//                   <EditProfilePage />
//                 </Layout>
//               }
//             />
//             <Route
//               path="/profile/:userId"
//               element={
//                 <Layout>
//                   <OtherProfilePage />
//                 </Layout>
//               }
//             />
//             <Route
//               path="*"
//               element={
//                 <Layout>
//                   <NotFoundPage />
//                 </Layout>
//               }
//             />
//           </Route>
//         </Routes>
//       </Router>
//     </div>
//   );
// };

// export default App;
