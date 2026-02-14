import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { fetchNotifications } from '../../../redux/slices/notificationsSlice';
import NotificationItem from '../item/item';
import styles from './notificationsBar.module.css';

const NotificationsBar = () => {
  const dispatch = useAppDispatch();
  const { actions: notifications, loading, error } = useAppSelector(
    (s) => s.notifications,
  );

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  if (error) return <div className="error">{error}</div>;
  if (loading) return <div>Loading...</div>;

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
