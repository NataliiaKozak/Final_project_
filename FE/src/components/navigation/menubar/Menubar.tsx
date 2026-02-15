import { NavLink, useLocation  } from 'react-router-dom';
import styles from './menubar.module.css';

import homeIcon from '../../../assets/homeIcon.svg';
import homeIconActive from '../../../assets/home-active.svg';
import searchIcon from '../../../assets/search.svg';
import searchIconActive from '../../../assets/search-active.svg';
import exploreIcon from '../../../assets/explore.svg';
import exploreIconActive from '../../../assets/home-active.svg';
import messagesIcon from '../../../assets/messages.svg';
import messagesIconActive from '../../../assets/messages-active.svg';
import notificationsIcon from '../../../assets/notifications.svg';
import notificationsIconActive from '../../../assets/notifications-active.svg';
import createIcon from '../../../assets/create.svg';
import createIconActive from '../../../assets/create-active.svg';

import CustomModal from '../../ui/customModal/CustomModal';
import React, { useState, useEffect, useCallback } from 'react';
import SearchContent from '../../search/searchContent/SearchContent';
import CreatePostPage from '../../../pages/createPostPage/CreatePostPage';
import NotificationsBar from '../../notifications/notificationsBar/NotificationsBar';
import { connectSocket, getSocket, disconnectSocket } from '../../../api/socket';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { toggleTheme } from '../../../redux/slices/themeSlice';

const Menubar = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((s) => s.theme.mode);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [burgerOpen, setBurgerOpen] = useState(false);

  // Закрываем модалку при любом переходе (включая Profile)
  useEffect(() => {
    setActivePanel(null);
    setModalContent(null);
  }, [location.pathname]);

  // Сбрасываем счётчик при переходе на Messages
  useEffect(() => {
    if (location.pathname === '/messages') {
      setUnreadMessages(0);
    }
  }, [location.pathname]);

  // Глобальное подключение сокета для отслеживания новых сообщений
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');
    connectSocket(apiBaseUrl, token);

    const checkSocket = () => {
      const socket = getSocket();
      if (!socket) return;

      const handler = () => {
        // Увеличиваем счётчик только если НЕ на странице сообщений
        if (window.location.pathname !== '/messages') {
          setUnreadMessages((prev) => prev + 1);
        }
      };

      socket.on('receiveMessage', handler);
      return () => {
        socket.off('receiveMessage', handler);
      };
    };

    // Даём сокету время на подключение
    const timer = setTimeout(checkSocket, 500);
    const cleanup = checkSocket();

    return () => {
      clearTimeout(timer);
      cleanup?.();
    };
  }, []);

  const [modalSize, setModalSize] = useState<'default' | 'left' | 'large' | 'small'>('default');

  const openModal = (type: string) => {
    if (activePanel === type) {
      closeModal();
      return;
    }
    setActivePanel(type);
    switch (type) {
      case 'search':
        setModalSize('left');
        setModalContent(<SearchContent />);
        break;
      case 'notifications':
        setModalSize('left');
        setModalContent(<NotificationsBar />);
        break;
      case 'create':
        setModalSize('large');
        setModalContent(<CreatePostPage />);
        break;
      default:
        setModalContent(null);
    }
  };

  const closeModal = () => {
    setActivePanel(null);
    setModalContent(null);
  };

  return (
    <nav className={styles.menubar}>
      {/* Burger button — visible only on <567px */}
      <button
        className={styles.burgerBtn}
        onClick={() => setBurgerOpen((p) => !p)}
        aria-label="Menu"
      >
        <span className={styles.burgerLine} />
        <span className={styles.burgerLine} />
        <span className={styles.burgerLine} />
      </button>

      {/* Burger side menu — slides from left on <567px */}
      {burgerOpen && (
        <div className={styles.burgerOverlay} onClick={() => setBurgerOpen(false)}>
          <div className={styles.burgerMenu} onClick={(e) => e.stopPropagation()}>
            <NavLink
              to="/notifications"
              className={activePanel === 'notifications' ? styles.activeLink : styles.link}
              onClick={(e) => {
                e.preventDefault();
                setBurgerOpen(false);
                openModal('notifications');
              }}
            >
              <img src={activePanel === 'notifications' ? notificationsIconActive : notificationsIcon} alt="Notifications" />
              <span>Notifications</span>
            </NavLink>

            <NavLink
              to="/create"
              className={activePanel === 'create' ? styles.activeLink : styles.link}
              onClick={(e) => {
                e.preventDefault();
                setBurgerOpen(false);
                openModal('create');
              }}
            >
              <img src={activePanel === 'create' ? createIconActive : createIcon} alt="Create" />
              <span>Create</span>
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
              onClick={() => setBurgerOpen(false)}
            >
              <span style={{ fontSize: '20px', width: '20px', textAlign: 'center' }}>&#128100;</span>
              <span>Profile</span>
            </NavLink>

            <button
              className={styles.themeToggle}
              onClick={() => { dispatch(toggleTheme()); setBurgerOpen(false); }}
              aria-label={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}
            >
              <span>{themeMode === 'dark' ? '\u2600' : '\u263E'}</span>
              <span>{themeMode === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>
      )}

      <NavLink to="/home" className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}>
        {({ isActive }) => (
          <>
            <img src={isActive ? homeIconActive : homeIcon} alt="Home" />
            <span>Home</span>
          </>
        )}
      </NavLink>

      <NavLink
        to="/search"
        className={activePanel === 'search' ? styles.activeLink : styles.link}
        onClick={(e) => {
          e.preventDefault();
          openModal('search');
        }}
      >
        <img src={activePanel === 'search' ? searchIconActive : searchIcon} alt="Search" />
        <span>Search</span>
      </NavLink>

      <NavLink to="/explore" className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}>
        {({ isActive }) => (
          <>
            <img src={isActive ? exploreIconActive : exploreIcon} alt="Explore" />
            <span>Explore</span>
          </>
        )}
      </NavLink>

      <NavLink
        to="/messages"
        className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
        onClick={() => setUnreadMessages(0)}
      >
        {({ isActive }) => (
          <>
            <img src={isActive ? messagesIconActive : messagesIcon} alt="Messages" />
            <span>Messages</span>
            {unreadMessages > 0 && (
              <span className={styles.badge}>{unreadMessages}</span>
            )}
          </>
        )}
      </NavLink>

      {/* These are shown on >=567px, hidden on <567px (moved to burger) */}
      <NavLink
        to="/notifications"
        className={`${activePanel === 'notifications' ? styles.activeLink : styles.link} ${styles.desktopOnly}`}
        onClick={(e) => {
          e.preventDefault();
          openModal('notifications');
        }}
      >
        <img src={activePanel === 'notifications' ? notificationsIconActive : notificationsIcon} alt="Notifications" />
        <span>Notifications</span>
      </NavLink>

      <NavLink
        to="/create"
        className={`${activePanel === 'create' ? styles.activeLink : styles.link} ${styles.desktopOnly}`}
        onClick={(e) => {
          e.preventDefault();
          openModal('create');
        }}
      >
        <img src={activePanel === 'create' ? createIconActive : createIcon} alt="Create" />
        <span>Create</span>
      </NavLink>

      <button
        className={`${styles.themeToggle} ${styles.desktopOnly}`}
        onClick={() => dispatch(toggleTheme())}
        aria-label={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}
      >
        <span>{themeMode === 'dark' ? '\u2600' : '\u263E'}</span>
        <span>{themeMode === 'dark' ? 'Light' : 'Dark'}</span>
      </button>

      <CustomModal isOpen={activePanel !== null} onClose={closeModal} content={modalContent} modalSize={modalSize} />
    </nav>
  );
};

export default Menubar;
