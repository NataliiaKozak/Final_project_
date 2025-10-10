import styles from './notificationsBar.module.css';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { $api } from '../../../api/api';
import type { Notification } from '../../../interfaces/notification.interface';
import type { RootState } from '../../../redux/store';
import NotificationItem from '../item/item';

const NotificationsBar = () => {
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) {
        setError('User is not authenticated');
        return;
      }
      try {
        // БЭК: GET /notifications (по токену)
        const { data } = await $api.get<Notification[]>('/notifications');
        setNotifications(data);
      } catch {
        setError('An error occurred while fetching notifications');
      }
    };

    fetchNotifications();
  }, [token]);

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
