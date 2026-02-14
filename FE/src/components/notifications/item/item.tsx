import React, { FC, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserByIdApi } from '../../../api/services/usersService';
import { $api } from '../../../api/api';
import parseData from '../../../helpers/parseData';
import type { Notification } from '../../../interfaces/notification.interface';
import type { IUser } from '../../../interfaces/user.interface';
import profilePlaceholder from '../../../assets/profile-placeholder.svg';
import styles from '../notificationsBar/notificationsBar.module.css';

const TYPE_TEXT: Record<Notification['type'], string> = {
  liked_post: 'liked your post',
  liked_comment: 'liked your comment',
  commented_post: 'commented on your post',
  followed_user: 'started following you',
};

const NotificationItem: FC<Notification> = ({
  _id,
  sender,
  type,
  createdAt,
  isRead,
}) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<IUser | null>(null);
  const [read, setRead] = useState(isRead);

  useEffect(() => {
    if (typeof sender === 'string') {
      getUserByIdApi(sender).then(setUser);
    } else {
      setUser({
        _id: sender._id,
        username: sender.username,
        profileImage: sender.profileImage,
        email: '',
        fullName: '',
      });
    }
  }, [sender]);

  const handleRead = useCallback(async () => {
    try {
      await $api.patch(`/notifications/${_id}`, { isRead: true });
      setRead(true);
    } catch (err: unknown) {
      if (err instanceof Error) console.error('Notification read error:', err.message);
    }
  }, [_id]);

  const goToProfile = useCallback(() => {
    if (user) navigate(`/profile/${user._id}`);
  }, [navigate, user]);

  if (!user) return <li className={styles.notificationItem}>Loading...</li>;

  return (
    <li
      className={styles.notificationItem}
      style={{ background: read ? '#FFF' : '#f3f3f3' }}
    >
      <div
        className={styles.userAvatar_box}
        onClick={goToProfile}
        style={{ cursor: 'pointer' }}
      >
        <img
          src={user.profileImage || profilePlaceholder}
          alt={user.username}
          className={styles.avatar}
        />
        <div>
          <p>
            <span className={styles.userName}>{user.username}</span> {TYPE_TEXT[type]}
          </p>
          <p className={styles.parsedData}>{parseData(createdAt)}</p>
        </div>
      </div>

      <div>
        {!read && (
          <button className={styles.notBtn} onClick={handleRead}>
            Read
          </button>
        )}
      </div>
    </li>
  );
};

export default React.memo(NotificationItem);
