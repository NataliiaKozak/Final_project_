import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../redux/store';
import type { IMessage } from '../../../interfaces/message.interface';
import type { IUser } from '../../../interfaces/user.interface';
import styles from './messageRoom.module.css';

function isPopulatedUser(
  v: string | { _id: string; username: string; profileImage?: string }
): v is { _id: string; username: string; profileImage?: string } {
  return typeof v === 'object' && v !== null && '_id' in v;
}

interface MessagesRoomProps {
  selectedRecipient: IUser | null;
}

const MessagesRoom: React.FC<MessagesRoomProps> = ({ selectedRecipient }) => {
  const authUser = useSelector((s: RootState) => s.auth.user);
  const { items, loading, error } = useSelector((s: RootState) => s.messages);

  const dialogMessages: IMessage[] = useMemo(() => {
    if (!selectedRecipient?._id || !authUser?._id) return [];
    const otherId = selectedRecipient._id;
    const me = authUser._id;

    return items.filter((m) => {
      const senderId = isPopulatedUser(m.sender) ? m.sender._id : m.sender;
      const recipientId = isPopulatedUser(m.recipient) ? m.recipient._id : m.recipient;

      const pair1 = senderId === me && recipientId === otherId;
      const pair2 = senderId === otherId && recipientId === me;
      return pair1 || pair2;
    });
  }, [items, selectedRecipient?._id, authUser?._id]);

  return (
    <section className={styles.room}>
      <div className={styles.header}>
        {selectedRecipient ? `Chat with ${selectedRecipient.username}` : 'Select a dialog'}
      </div>

      {loading && <div className={styles.status}>Loading...</div>}
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.messages}>
        {selectedRecipient &&
          dialogMessages.map((m) => {
            const fromMe =
              (typeof m.sender === 'string' ? m.sender : m.sender._id) === authUser?._id;

            return (
              <div
                key={m._id}
                className={`${styles.message} ${fromMe ? styles.me : styles.other}`}
                title={new Date(m.createdAt).toLocaleString()}
              >
                <div className={styles.bubble}>{m.text}</div>
              </div>
            );
          })}
      </div>

    </section>
  );
};

export default MessagesRoom;