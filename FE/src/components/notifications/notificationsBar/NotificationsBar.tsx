import styles from './notificationBar.module.css';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { $api } from '../../../api/api';
import type { Notification } from '../../../interfaces/notification.interface';
import type { RootState } from '../../../redux/store';
import NotificationItem from '../item/item';

const NotificationsBar = () => {
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);

  // useEffect(() => {
  //   const fetchNotifications = async () => {
  //     if (!user || !token) {
  //       setError('User is not authenticated');
  //       return;
  //     }
  //     try {
  //       // эндпоинт оставляю как у тебя
  //       const { data } = await $api.get(`/notifications/${user._id}/notifications`);
  //       setNotifications(data);
  //     } catch (err: any) {
  //       console.error('Fetch error:', err);
  //       setError(err.response?.data?.error || 'An error occurred while fetching notifications');
  //     }
  //   };
  //   fetchNotifications();
  // }, [user, token]);

  //чтобы точно «слышал» бэк
  useEffect(() => {
  const fetchNotifications = async () => {
    if (!user || !token) return;
    // БЭК: GET /api/notifications (по токену), а не с :userId
    const { data } = await $api.get('/notifications');
    setNotifications(data);


  };
  fetchNotifications();
}, [user, token]);

  if (error) return <div className="error">{error}</div>;
  if (!notifications) return <div>Loading...</div>;

  return (
    <div className={styles.notificationsBar}>
      <div className={styles.notHeader}>
        <h2>Notification</h2>
        <h3>New</h3>
      </div>
      {notifications.length === 0 ? (
        <div>No notifications</div>
      ) : (
        <ul className={styles.notificationsList}>
          {notifications.map((item) => (
            <NotificationItem key={item._id} {...item} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationsBar;

//для чего переписал?
// const NotificationsBar = () => {
//   const [notifications, setNotifications] = useState<Notification[] | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   const user = useSelector((state: RootState) => state.auth.user);
//   const token = useSelector((state: RootState) => state.auth.token);

//   useEffect(() => {
//     const fetchNotifications = async () => {
//       if (!user || !token) {
//         setError('User is not authenticated');
//         return;
//       }
//       try {
//         // БЭК: GET /notifications/:userId/notifications
//         const { data } = await $api.get<Notification[]>(`/notifications/${user._id}/notifications`);
//         setNotifications(data);
//       } catch (err: unknown) {
//         console.error('Fetch error:', err);
//         setError('An error occurred while fetching notifications');
//       }
//     };
//     fetchNotifications();
//   }, [user, token]);

//   if (error) return <div className="error">{error}</div>;
//   if (!notifications) return <div>Loading...</div>;

//   return (
//     <div className={styles.notificationsBar}>
//       <div className={styles.notHeader}>
//         <h2>Notifications</h2>
//         <h3>New</h3>
//       </div>
//       {notifications.length === 0 ? (
//         <div>No notifications</div>
//       ) : (
//         <ul className={styles.notificationsList}>
//           {notifications.map((item) => (
//             <NotificationItem key={item._id} {...item} />
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default NotificationsBar;