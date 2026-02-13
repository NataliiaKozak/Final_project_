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
import React, { useState, useEffect } from 'react';
import SearchContent from '../../search/searchContent/SearchContent';
import CreatePostPage from '../../../pages/createPostPage/CreatePostPage';
import NotificationsBar from '../../notifications/notificationsBar/NotificationsBar';

const Menubar = () => {
  const location = useLocation();
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  // Закрываем модалку при любом переходе (включая Profile)
  useEffect(() => {
    setActivePanel(null);
    setModalContent(null);
  }, [location.pathname]);
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

      <NavLink to="/messages" className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}>
        {({ isActive }) => (
          <>
            <img src={isActive ? messagesIconActive : messagesIcon} alt="Messages" />
            <span>Messages</span>
          </>
        )}
      </NavLink>

      <NavLink
        to="/notifications"
        className={activePanel === 'notifications' ? styles.activeLink : styles.link}
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
        className={activePanel === 'create' ? styles.activeLink : styles.link}
        onClick={(e) => {
          e.preventDefault();
          openModal('create');
        }}
      >
        <img src={activePanel === 'create' ? createIconActive : createIcon} alt="Create" />
        <span>Create</span>
      </NavLink>

      <CustomModal isOpen={activePanel !== null} onClose={closeModal} content={modalContent} modalSize={modalSize} />
    </nav>
  );
};

export default Menubar;
