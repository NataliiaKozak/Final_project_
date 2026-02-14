import React, { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { fetchAllConversations } from '../../../redux/slices/messagesSlice';
import { isPopulatedUser } from '../../../utils/populatedUser';
import type { IMessage } from '../../../interfaces/message.interface';
import type { IUser } from '../../../interfaces/user.interface';
import styles from './recieversList.module.css';
import profilePlaceholder from '../../../assets/profile-placeholder.svg';

interface RecieversListProps {
  onSelectRecipient: (user: IUser | null) => void;
  selectedRecipient: IUser | null;
}

const RecieversList: React.FC<RecieversListProps> = ({ onSelectRecipient, selectedRecipient }) => {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((s) => s.auth.user);
  const { items, loading, error } = useAppSelector((s) => s.messages);

  useEffect(() => {
    if (authUser?._id) {
      dispatch(fetchAllConversations());
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
    <aside className={styles.recieversList}>
      <h4>Dialogs</h4>

      {loading && <p style={{ padding: '8px 20px', fontSize: 14 }}>Loading...</p>}
      {error && <p style={{ padding: '8px 20px', fontSize: 14, color: 'red' }}>{error}</p>}

      <ul>
        {recipients.map((u) => {
          const active = selectedRecipient?._id === u._id;
          return (
            <li
              key={u._id}
              className={`${styles.recieversList_userBox} ${active ? styles.active : ''}`}
              onClick={() => onSelectRecipient(u)}
            >
              <img
                src={u.profileImage || profilePlaceholder}
                alt={u.username}
                className={styles.userBox_img}
              />
              <div className={styles.userBox_data}>
                <p className={styles.userBox_dataP1}>{u.username}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default RecieversList;
