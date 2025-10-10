import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../redux/store';
import { fetchMessages } from '../../../redux/slices/messagesSlice';
import type { IMessage } from '../../../interfaces/message.interface';
import type { IUser } from '../../../interfaces/user.interface';
import styles from './recieversList.module.css';
import profilePlaceholder from '../../../assets/profile-placeholder.svg';

interface RecieversListProps {
  onSelectRecipient: (user: IUser | null) => void;
  selectedRecipient: IUser | null;
}

function isPopulatedUser(
  v: string | { _id: string; username: string; profileImage?: string }
): v is { _id: string; username: string; profileImage?: string } {
  return typeof v === 'object' && v !== null && '_id' in v;
}

const RecieversList: React.FC<RecieversListProps> = ({ onSelectRecipient, selectedRecipient }) => {
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((s: RootState) => s.auth.user);
  const { items, loading, error } = useSelector((s: RootState) => s.messages);

  useEffect(() => {
    if (authUser?._id) {
      dispatch(fetchMessages(authUser._id));
    }
  }, [dispatch, authUser?._id]);

  // Строим список собеседников из массива сообщений
  const recipients: IUser[] = useMemo(() => {
    if (!authUser?._id) return [];
    const map = new Map<string, IUser>();

    items.forEach((m: IMessage) => {
      const me = authUser._id;

      const other =
        (isPopulatedUser(m.sender) ? m.sender._id : m.sender) === me
          ? m.recipient
          : m.sender;

      const otherId = isPopulatedUser(other) ? other._id : other;
      const otherUsername = isPopulatedUser(other) ? other.username : 'user';
      const otherImage = isPopulatedUser(other) ? other.profileImage : undefined;

      if (!map.has(otherId)) {
        map.set(otherId, {
          _id: otherId,
          username: otherUsername,
          email: '', // нет в сообщении — оставляем пустым
          fullName: otherUsername,
          profileImage: otherImage,
        });
      }
    });

    return Array.from(map.values());
  }, [items, authUser?._id]);

  return (
    <aside className={styles.list}>
      <div className={styles.header}>Dialogs</div>

      {loading && <div className={styles.status}>Loading...</div>}
      {error && <div className={styles.error}>{error}</div>}

      <ul className={styles.items}>
        {recipients.map((u) => {
          const active = selectedRecipient?._id === u._id;
          return (
            <li
              key={u._id}
              className={`${styles.item} ${active ? styles.active : ''}`}
              onClick={() => onSelectRecipient(u)}
            >
              <img
                src={u.profileImage || profilePlaceholder}
                alt={u.username}
                className={styles.avatar}
              />
              <div className={styles.meta}>
                <div className={styles.username}>{u.username}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default RecieversList;
