import styles from '../notificationsBar/notificationsBar.module.css';
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
      // Поле в интерфейсе: isRead
      await $api.patch(`/notifications/${_id}`, { isRead: true });
      setRead(true);
    } catch (error) {
      console.error('Ошибка при чтении уведомления:', error);
    }
  };

  const username = user?.username ?? 'User';
  const avatar = user?.profileImage || profilePlaceholder;

  // текст на основе типа 
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
