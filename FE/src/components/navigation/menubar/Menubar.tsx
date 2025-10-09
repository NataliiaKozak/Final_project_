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
import React, { useState } from 'react';
import SearchContent from '../../search/searchContent/SearchContent';
import CreatePostPage from '../../../pages/createPostPage/CreatePostPage';
import NotificationsBar from '../../notifications/notificationsBar/NotificationsBar';

const Menubar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
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
    setIsModalOpen(false);
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
        className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
        onClick={(e) => {
          e.preventDefault();
          openModal('search');
        }}
      >
        {({ isActive }) => (
          <>
            <img src={isActive ? searchIconActive : searchIcon} alt="Search" />
            <span>Search</span>
          </>
        )}
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
        className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
        onClick={(e) => {
          e.preventDefault();
          openModal('notifications');
        }}
      >
        {({ isActive }) => (
          <>
            <img src={isActive ? notificationsIconActive : notificationsIcon} alt="Notifications" />
            <span>Notifications</span>
          </>
        )}
      </NavLink>

      <NavLink
        to="/create"
        className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
        onClick={(e) => {
          e.preventDefault();
          openModal('create');
        }}
      >
        {({ isActive }) => (
          <>
            <img src={isActive ? createIconActive : createIcon} alt="Create" />
            <span>Create</span>
          </>
        )}
      </NavLink>

      <CustomModal isOpen={isModalOpen} onClose={closeModal} content={modalContent} modalSize={modalSize} />
    </nav>
  );
};

export default Menubar;
// // попытка исправить баг с закрыванием окна after false
// const Menubar = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalContent, setModalContent] = useState<React.ReactNode>(null);
//   const [modalSize, setModalSize] = useState<'default' | 'left' | 'large' | 'small'>('default');

//   // 🔹 Закрываем модалку при любой смене маршрута
//   const location = useLocation();
//   useEffect(() => {
//     setIsModalOpen(false);
//     setModalContent(null);
//   }, [location.pathname]);
//   // модалка будет закрываться при клике на другой пункт меню/смене URL.
  
  
//   const openModal = (type: 'search' | 'notifications' | 'create') => {
//     setIsModalOpen(true);
//     switch (type) {
//       case 'search':
//         setModalSize('left');
//         setModalContent(<SearchContent />);
//         break;
//       case 'notifications':
//         setModalSize('left');
//         setModalContent(<NotificationsBar />);
//         break;
//       case 'create':
//         setModalSize('large');
//         setModalContent(<CreatePostPage />);
//         break;
//     }
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setModalContent(null);
//   };

//   return (
//     <nav className={styles.menubar}>
//       <NavLink to="/home" className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}>
//         {({ isActive }) => (
//           <>
//             <img src={isActive ? homeIconActive : homeIcon} alt="Home" />
//             <span>Home</span>
//           </>
//         )}
//       </NavLink>

//       <NavLink
//         to="/search"
//         className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
//         onClick={(e) => {
//           e.preventDefault();
//           openModal('search');
//         }}
//       >
//         {({ isActive }) => (
//           <>
//             <img src={isActive ? searchIconActive : searchIcon} alt="Search" />
//             <span>Search</span>
//           </>
//         )}
//       </NavLink>

//       <NavLink to="/explore" className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}>
//         {({ isActive }) => (
//           <>
//             <img src={isActive ? exploreIconActive : exploreIcon} alt="Explore" />
//             <span>Explore</span>
//           </>
//         )}
//       </NavLink>

//       <NavLink to="/messages" className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}>
//         {({ isActive }) => (
//           <>
//             <img src={isActive ? messagesIconActive : messagesIcon} alt="Messages" />
//             <span>Messages</span>
//           </>
//         )}
//       </NavLink>

//       <NavLink
//         to="/notifications"
//         className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
//         onClick={(e) => {
//           e.preventDefault();
//           openModal('notifications');
//         }}
//       >
//         {({ isActive }) => (
//           <>
//             <img src={isActive ? notificationsIconActive : notificationsIcon} alt="Notifications" />
//             <span>Notifications</span>
//           </>
//         )}
//       </NavLink>

//       <NavLink
//         to="/create"
//         className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
//         onClick={(e) => {
//           e.preventDefault();
//           openModal('create');
//         }}
//       >
//         {({ isActive }) => (
//           <>
//             <img src={isActive ? createIconActive : createIcon} alt="Create" />
//             <span>Create</span>
//           </>
//         )}
//       </NavLink>

//       <CustomModal isOpen={isModalOpen} onClose={closeModal} content={modalContent} modalSize={modalSize} />
//     </nav>
//   );
// };

// export default Menubar;

// const Menubar = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalContent, setModalContent] = useState<React.ReactNode>(null);
//   const [activeLink, setActiveLink] = useState<string>('');
//   const [modalSize, setModalSize] = useState<
//     'default' | 'left' | 'large' | 'small'
//   >('default');

//   const userId = localStorage.getItem('userId') || 'mockUserId';

//   const openModal = (type: string) => {
//     setIsModalOpen(true);
//     switch (type) {
//       case 'search':
//         setModalSize('left');
//         setModalContent(<SearchContent />);
//         break;
//       case 'notifications':
//         setModalSize('left');
//         setModalContent(<NotificationsBar />); // ← не передаем userId . не принимает пропсы, он сам берёт user из Redux
//         break;
//       case 'create':
//         setModalSize('large');
//         setModalContent(<CreatePostPage />);
//         break;
//       default:
//         setModalContent(null);
//     }
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setModalContent(null);
//   };

//   const handleLinkClick = (link: string) => setActiveLink(link);

//   return (
//     <nav className={styles.menubar}>
//       <NavLink
//         to="/home"
//         className={({ isActive }) =>
//           isActive ? styles.activeLink : styles.link
//         }
//       >
//         {({ isActive }) => (
//           <>
//             <img src={isActive ? homeIconActive : homeIcon} alt="Home" />
//             <span>Home</span>
//           </>
//         )}
//       </NavLink>

//       <NavLink
//         to="/search"
//         className={({ isActive }) =>
//           isActive ? styles.activeLink : styles.link
//         }
//         onClick={(e) => {
//           e.preventDefault();
//           openModal('search');
//           handleLinkClick('search');
//         }}
//       >
//         {({ isActive }) => (
//           <>
//             <img src={isActive ? searchIconActive : searchIcon} alt="Search" />
//             <span>Search</span>
//           </>
//         )}
//       </NavLink>

//       <NavLink
//         to="/explore"
//         className={({ isActive }) =>
//           isActive ? styles.activeLink : styles.link
//         }
//       >
//         {({ isActive }) => (
//           <>
//             <img
//               src={isActive ? exploreIconActive : exploreIcon}
//               alt="Explore"
//             />
//             <span>Explore</span>
//           </>
//         )}
//       </NavLink>

//       <NavLink
//         to="/messages"
//         className={({ isActive }) =>
//           isActive ? styles.activeLink : styles.link
//         }
//       >
//         {({ isActive }) => (
//           <>
//             <img
//               src={isActive ? messagesIconActive : messagesIcon}
//               alt="Messages"
//             />
//             <span>Messages</span>
//           </>
//         )}
//       </NavLink>

//       <NavLink
//         to="/notifications"
//         className={({ isActive }) =>
//           isActive ? styles.activeLink : styles.link
//         }
//         onClick={(e) => {
//           e.preventDefault();
//           openModal('notifications');
//           handleLinkClick('notifications');
//         }}
//       >
//         {({ isActive }) => (
//           <>
//             <img
//               src={isActive ? notificationsIconActive : notificationsIcon}
//               alt="Notifications"
//             />
//             <span>Notifications</span>
//           </>
//         )}
//       </NavLink>

//       <NavLink
//         to="/create"
//         className={({ isActive }) =>
//           isActive ? styles.activeLink : styles.link
//         }
//         onClick={(e) => {
//           e.preventDefault();
//           openModal('create');
//           handleLinkClick('create');
//         }}
//       >
//         {({ isActive }) => (
//           <>
//             <img src={isActive ? createIconActive : createIcon} alt="Create" />
//             <span>Create</span>
//           </>
//         )}
//       </NavLink>

//       <CustomModal
//         isOpen={isModalOpen}
//         onClose={closeModal}
//         content={modalContent}
//         modalSize={modalSize}
//       />
//     </nav>
//   );
// };

// export default Menubar;
