import styles from '../notificationBar.module.css';
import { FC, useEffect, useState } from 'react';
import { getUserByIdApi } from '../../../api/services/usersService';
import { $api } from '../../../api/api';
import parseData from '../../../helpers/parseData';
import type { Notification } from '../../../interfaces/notification.interface';
import type { IUser } from '../../../interfaces/user.interface';
import profilePlaceholder from '../../../assets/profile-placeholder.svg';

const NotificationItem: FC<Notification> = ({
  _id,
  sender,
  type,
  createdAt,
  isRead,
}) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [read, setRead] = useState<boolean>(isRead);

  // sender по интерфейсу: string | { _id; username; profileImage? }
  useEffect(() => {
    const loadSender = async () => {
      if (typeof sender === 'string') {
        const data = await getUserByIdApi(sender);
        setUser(data);
      } else {
        // контроллер может прислать популяцию
        setUser({
          _id: sender._id,
          username: sender.username,
          profileImage: sender.profileImage,
          email: '',       // обязательные поля IUser, которых нет в уведомлении
          fullName: '',    // безопасные заглушки — не отображаются
        });
      }
    };
    loadSender();
  }, [sender]);

  const handleReadNotification = async () => {
    try {
      // Пометить одно уведомление прочитанным.
      // Поле в твоём интерфейсе: isRead
      await $api.patch(`/notifications/${_id}`, { isRead: true });
      setRead(true);
    } catch (error) {
      console.error('Ошибка при чтении уведомления:', error);
    }
  };

  const username = user?.username ?? 'User';
  const avatar = user?.profileImage || profilePlaceholder;

  // Простейший текст на основе типа (без выдумываний контента)
  const typeTextMap: Record<Notification['type'], string> = {
    liked_post: 'liked your post',
    liked_comment: 'liked your comment',
    commented_post: 'commented on your post',
    followed_user: 'started following you',
  };
  const contentText = typeTextMap[type];

  if (!user) return <li className={styles.notificationItem}>Loading...</li>;

  return (
    <li
      className={styles.notificationItem}
      style={{ background: !read ? '#f3f3f3' : '#FFF' }}
    >
      <div className={styles.userAvatar_box}>
        <img src={avatar} alt={username} className={styles.avatar} />
        <div>
          <p>
            <span className={styles.userName}>{username}</span> {contentText}
          </p>
          <p className={styles.parsedData}>{parseData(createdAt)}</p>
        </div>
      </div>

      <div>
        {!read && (
          <button className={styles.notBtn} onClick={handleReadNotification}>
            Read
          </button>
        )}
      </div>
    </li>
  );
};

export default NotificationItem;

//after L
// const NotificationItem: FC<Notification> = ({
//   _id,
//   sender,
//   type,
//   createdAt,
//   isRead,
// }) => {
//   const [senderUser, setSenderUser] = useState<IUser | null>(null);
//   const [read, setRead] = useState<boolean>(isRead);

//   // минимально: получаем id отправителя
//   const senderId = typeof sender === 'string' ? sender : sender._id;

//   useEffect(() => {
//     const handleGetUser = async () => {
//       try {
//         const data = await getUserByIdApi(senderId);
//         setSenderUser(data);
//       } catch {
//         setSenderUser(null);
//       }
//     };
//     handleGetUser();
//   }, [senderId]);

//   const handleReadNotification = async () => {
//     try {
//       await $api.patch(`/notifications/${_id}`, { is_read: true });
//       setRead(true);
//     } catch {
//       // тихо фейлим
//     }
//   };

//   // Короткий текст по типу (без «контента», которого нет в интерфейсе)
//   const typeText: Record<Notification['type'], string> = {
//     liked_post: 'liked your post',
//     liked_comment: 'liked your comment',
//     commented_post: 'commented your post',
//     followed_user: 'started following you',
//   };
//   const line = typeText[type] ?? 'did something';

//   if (!senderUser) return <li className={styles.notificationItem}>Loading...</li>;

//   return (
//     <li
//       className={styles.notificationItem}
//       style={{ background: !read ? '#f3f3f3' : '#FFF' }}
//     >
//       <div className={styles.userAvatar_box}>
//         <img
//           src={senderUser.profileImage || profilePlaceholder}
//           alt={senderUser.username}
//           className={styles.avatar}
//         />
//         <div>
//           <p>
//             <span className={styles.userName}>{senderUser.username}</span> {line}
//           </p>
//           <p className={styles.parsedData}>{parseData(createdAt)}</p>
//         </div>
//       </div>

//       <div>
//         {!read && (
//           <button className={styles.notBtn} onClick={handleReadNotification}>
//             Read
//           </button>
//         )}
//       </div>
//     </li>
//   );
// };

// export default NotificationItem;
//улучшить почему-то
// const textByType = (type: Notification['type']) => {
//   switch (type) {
//     case 'liked_post': return 'liked your post';
//     case 'liked_comment': return 'liked your comment';
//     case 'commented_post': return 'commented your post';
//     case 'followed_user': return 'started following you';
//     default: return 'notification';
//   }
// };

// const NotificationItem: FC<Notification> = ({
//   _id,
//   sender,
//   type,
//   createdAt,
//   isRead,
// }) => {
//   const [senderUser, setSenderUser] = useState<IUser | null>(null);
//   const [read, setRead] = useState<boolean>(isRead);

//   const senderId = useMemo(() => (typeof sender === 'string' ? sender : sender._id), [sender]);

//   useEffect(() => {
//     const loadSender = async () => {
//       try {
//         const data = await getUserByIdApi(senderId);
//         setSenderUser(data);
//       } catch (e) {
//         console.error('Failed to load sender:', e);
//       }
//     };
//     loadSender();
//   }, [senderId]);

//   const handleReadNotification = async () => {
//     try {
//       // БЭК: PATCH /notifications/:id → { isRead: true }
//       await $api.patch(`/notifications/${_id}`, { isRead: true });
//       setRead(true);
//     } catch (error) {
//       console.error('Ошибка при чтении уведомления:', error);
//     }
//   };

//   return (
//     <li className={styles.notificationItem} style={{ background: !read ? '#f3f3f3' : '#FFF' }}>
//       <div className={styles.userAvatar_box}>
//         <img
//           src={senderUser?.profileImage || profilePlaceholder}
//           alt={senderUser?.username || 'User'}
//           className={styles.avatar}
//         />
//         <div>
//           <p>
//             <span className={styles.userName}>{senderUser?.username || 'User'}</span>{' '}
//             {textByType(type)}
//           </p>
//           <p className={styles.parsedData}>{parseData(createdAt)}</p>
//         </div>
//       </div>
//       <div>
//         {!read && (
//           <button className={styles.notBtn} onClick={handleReadNotification}>
//             Read
//           </button>
//         )}
//       </div>
//     </li>
//   );
// };

// export default NotificationItem;

// const renderTextByType = (type: Notification['type']) => {
//   switch (type) {
//     case 'liked_post': return 'liked your post';
//     case 'liked_comment': return 'liked your comment';
//     case 'commented_post': return 'commented on your post';
//     case 'followed_user': return 'started following you';
//     default: return '';
//   }
// };

// const NotificationItem: FC<Notification> = ({
//   _id,
//   sender,
//   type,
//   createdAt,
//   isRead,
// }) => {
//   const [user, setUser] = useState<IUser | null>(null);
//   const [read, setRead] = useState<boolean>(isRead);

//   useEffect(() => {
//     const fetchSender = async () => {
//       const senderId = typeof sender === 'string' ? sender : sender._id;
//       const data = await getUserByIdApi(senderId);
//       setUser(data);
//     };
//     fetchSender();
//   }, [sender]);

//   const handleRead = async () => {
//     try {
//       // На бэке есть markAsRead (отмечает все). Если появится эндпоинт "по одному" — заменим.
//       await $api.post('/notifications/mark-as-read');
//       setRead(true);
//     } catch (e) {
//       console.error('Ошибка при чтении уведомления', e);
//     }
//   };

//   return (
//     <li
//       className={styles.notificationItem}
//       style={{ background: !read ? '#f3f3f3' : '#FFF' }}
//     >
//       <div className={styles.userAvatar_box}>
//         <img
//           src={user?.profileImage || profilePlaceholder}
//           alt={user?.username || 'user'}
//           className={styles.avatar}
//         />
//         <div>
//           <p>
//             <span className={styles.userName}>{user?.username ?? 'User'}</span>{' '}
//             {renderTextByType(type)}
//           </p>
//           <p className={styles.parsedData}>{parseData(createdAt)}</p>
//         </div>
//       </div>

//       {!read && (
//         <button className={styles.notBtn} onClick={handleRead}>
//           Read
//         </button>
//       )}
//     </li>
//   );
// };

// export default NotificationItem;





// const NotificationItem: FC<Notification> = ({
//   _id,
//   content,
//   sender,
//   createdAt,
//   isRead,
// }) => {
//   const [user, setUser] = useState<IUser | null>(null);
//   const [read, setRead] = useState<boolean>(isRead);

//   useEffect(() => {
//     const handleGetUser = async () => {
//       const data = await getUserByIdApi(sender);
//       setUser(data);
//     };
//     handleGetUser();
//   }, [sender]);

//   const handleReadNotification = async () => {
//     try {
//       await $api.patch(`/notifications/${_id}`, { is_read: true });
//       setRead(true);
//     } catch (error) {
//       console.error('Ошибка при чтении уведомления:', error);
//     }
//   };

//   if (!user) return <p>Loading</p>;

//   return (
//     <li
//       className={styles.notificationItem}
//       style={{ background: !read ? '#f3f3f3' : '#FFF' }}
//     >
//       <div className={styles.userAvatar_box}>
//         <img
//           src={user.profileImage || profilePlaceholder}
//           alt={user.username}
//           className={styles.avatar}
//         />
//         <div>
//           <p>
//             <span className={styles.userName}>{user.username}</span> {content}
//           </p>
//           <p className={styles.parsedData}>{parseData(createdAt)}</p>
//         </div>
//       </div>

//       {!read && (
//         <button className={styles.notBtn} onClick={handleReadNotification}>
//           Read
//         </button>
//       )}
//     </li>
//   );
// };



// зачем переписал?
// const textByType = (type: Notification['type']) => {
//   switch (type) {
//     case 'liked_post': return 'liked your post';
//     case 'liked_comment': return 'liked your comment';
//     case 'commented_post': return 'commented your post';
//     case 'followed_user': return 'started following you';
//     default: return 'notification';
//   }
// };

// const NotificationItem: FC<Notification> = ({
//   _id,
//   sender,
//   type,
//   createdAt,
//   isRead,
// }) => {
//   const [senderUser, setSenderUser] = useState<IUser | null>(null);
//   const [read, setRead] = useState<boolean>(isRead);

//   const senderId = useMemo(() => (typeof sender === 'string' ? sender : sender._id), [sender]);

//   useEffect(() => {
//     const loadSender = async () => {
//       try {
//         const data = await getUserByIdApi(senderId);
//         setSenderUser(data);
//       } catch (e) {
//         console.error('Failed to load sender:', e);
//       }
//     };
//     loadSender();
//   }, [senderId]);

//   const handleReadNotification = async () => {
//     try {
//       // БЭК: PATCH /notifications/:id → { isRead: true }
//       await $api.patch(`/notifications/${_id}`, { isRead: true });
//       setRead(true);
//     } catch (error) {
//       console.error('Ошибка при чтении уведомления:', error);
//     }
//   };

//   return (
//     <li className={styles.notificationItem} style={{ background: !read ? '#f3f3f3' : '#FFF' }}>
//       <div className={styles.userAvatar_box}>
//         <img
//           src={senderUser?.profileImage || profilePlaceholder}
//           alt={senderUser?.username || 'User'}
//           className={styles.avatar}
//         />
//         <div>
//           <p>
//             <span className={styles.userName}>{senderUser?.username || 'User'}</span>{' '}
//             {textByType(type)}
//           </p>
//           <p className={styles.parsedData}>{parseData(createdAt)}</p>
//         </div>
//       </div>
//       <div>
//         {!read && (
//           <button className={styles.notBtn} onClick={handleReadNotification}>
//             Read
//           </button>
//         )}
//       </div>
//     </li>
//   );
// };

// export default NotificationItem;
