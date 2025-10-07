import React, { useEffect } from 'react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import PrivateRoutesUsers from './utils/privateUsers';

import { RegisterPage } from './pages/registerPage/RegisterPage';
import { ResetPage } from './pages/resetPage/ResetPage';
import { setUser } from './redux/slices/authSlice';

import { AppDispatch, RootState } from './redux/store';
import './global.css';



import { ThemeProvider } from '@mui/material';


const Layout: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
        }}
      >
        {/* <div className="sidebar">
          <Sidebar />
        </div> */}
        <main>{children}</main>
      </div>
      {/* <footer>
        <Footer />
      </footer> */}
    </div>
  );
};

const App: React.FC = () => {
  // const { theme, toggleTheme, mode } = useThemeMode();
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      dispatch(setUser({ token, user: JSON.parse(user) }));
    }
  }, [dispatch]);

  // useEffect(() => {
  //   if (user) {
  //     dispatch(getFollowMe(user._id));
  //     dispatch(getFollowingMe(user._id));
  //   }
  // }, [dispatch, user]);

  return (
    <div className="globalContainer">
      <Router>
        {/* <ThemeProvider theme={theme}> */}
          <Routes>
            {/* <Route path="/" element={<LoginPage />} /> */}
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset" element={<ResetPage />} />
          

          
          
          </Routes>
        {/* </ThemeProvider> */}
      </Router>
    </div>
  );
};

export default App;
