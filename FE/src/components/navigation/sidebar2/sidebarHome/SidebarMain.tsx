import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CustomModal from '../../../ui/customModal/CustomModal';
import SearchContent from '../../../search/searchContent/SearchContent';
import NotificationsContent from '../notificationContent/NotificationContent';
import styles from './SidebarMain.module.css';
import logo from '../../../../assets/logo-ichgram.svg';

import homeL from '../../../../assets/homeIcon.svg';
import searchL from '../../../../assets/search.svg';
import exploreL from '../../../../assets/explore.svg';
import createL from '../../../../assets/create.svg';
import messegeL from '../../../../assets/messages.svg';
import notifL from '../../../../assets/notifications.svg';
import homeD from '../../../../assets/home-active.svg';
import searchD from '../../../../assets/search-active.svg';
import exploreD from '../../../../assets/explore-active.svg';
import createD from '../../../../assets/create-active.svg';
import messegeD from '../../../../assets/messages-active.svg';
import notifD from '../../../../assets/notifications-active.svg';

const Sidebar: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [activeLink, setActiveLink] = useState<string>('');
  const [modalSize, setModalSize] = useState<'default' | 'left' | 'large' | 'small'>('default');

  const openModal = (type: string) => {
    setIsModalOpen(true);
    switch (type) {
      case 'search':
        setModalSize('left');
        setModalContent(<SearchContent />);
        break;
      case 'notifications':
        setModalSize('left');
        setModalContent(<NotificationsContent />);
        break;
      default:
        setModalContent(null);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };

  const handleLinkClick = (link: string) => setActiveLink(link);

  return (
    <div className={styles.sidebarBox}>
      <Link to="/home">
        <img className={styles.sidebarLogo} src={logo} alt="Logo" />
      </Link>
      <div className={styles.sidebarLinks}>
        <Link
          to="/home"
          onClick={() => handleLinkClick('home')}
          className={activeLink === 'home' ? styles.activeLink : ''}
        >
          <img src={activeLink === 'home' ? homeD : homeL} alt="Home" /> Home
        </Link>

        <a
          onClick={() => {
            openModal('search');
            handleLinkClick('search');
          }}
          className={activeLink === 'search' ? styles.activeLink : ''}
        >
          <img src={activeLink === 'search' ? searchD : searchL} alt="Search" />
          Search
        </a>

        <Link
          to="/explore"
          onClick={() => handleLinkClick('explore')}
          className={activeLink === 'explore' ? styles.activeLink : ''}
        >
          <img src={activeLink === 'explore' ? exploreD : exploreL} alt="Explore" />
          Explore
        </Link>

        <Link
          to="/messages"
          onClick={() => handleLinkClick('messages')}
          className={activeLink === 'messages' ? styles.activeLink : ''}
        >
          <img src={activeLink === 'messages' ? messegeD : messegeL} alt="Messages" />
          Messages
        </Link>

        <a
          onClick={() => {
            openModal('notifications');
            handleLinkClick('notifications');
          }}
          className={activeLink === 'notifications' ? styles.activeLink : ''}
        >
          <img src={activeLink === 'notifications' ? notifD : notifL} alt="Notifications" />
          Notifications
        </a>

        <a
          onClick={() => {
            openModal('create');
            handleLinkClick('create');
          }}
          className={activeLink === 'create' ? styles.activeLink : ''}
        >
          <img src={activeLink === 'create' ? createD : createL} alt="Create" />
          Create
        </a>
      </div>

      <CustomModal isOpen={isModalOpen} onClose={closeModal} content={modalContent} modalSize={modalSize} />
    </div>
  );
};

export default Sidebar;
