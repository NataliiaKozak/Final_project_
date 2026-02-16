import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { sendMessage, addMessage, fetchMessages } from '../../../redux/slices/messagesSlice';
import { connectSocket, getSocket } from '../../../api/socket';
import { isPopulatedUser } from '../../../utils/populatedUser';
import type { IMessage } from '../../../interfaces/message.interface';
import type { IUser } from '../../../interfaces/user.interface';
import styles from './messageRoom.module.css';

interface MessagesRoomProps {
  selectedRecipient: IUser | null;
}

const MessagesRoom: React.FC<MessagesRoomProps> = ({ selectedRecipient }) => {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((s) => s.auth.user);
  const { items, loading, error } = useAppSelector((s) => s.messages);
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Подключение к сокету (socket lifecycle managed by Menubar, not here)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');
    connectSocket(apiBaseUrl, token);
  }, []);

  // Подключение к комнате + слушатель входящих сообщений
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !selectedRecipient?._id) return;

    socket.emit('joinRoom', { targetUserId: selectedRecipient._id });

    const handleReceive = (msg: IMessage) => {
      dispatch(addMessage(msg));
    };
    socket.on('receiveMessage', handleReceive);

    return () => {
      socket.off('receiveMessage', handleReceive);
    };
  }, [selectedRecipient?._id, dispatch]);

  // Загрузка истории при смене собеседника
  useEffect(() => {
    if (selectedRecipient?._id) {
      dispatch(fetchMessages(selectedRecipient._id));
    }
  }, [selectedRecipient?._id, dispatch]);

  // Авто-скролл вниз
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [items]);

  const dialogMessages: IMessage[] = useMemo(() => {
    if (!selectedRecipient?._id || !authUser?._id) return [];
    const otherId = selectedRecipient._id;
    const me = authUser._id;

    return items.filter((m) => {
      const senderId = isPopulatedUser(m.sender) ? m.sender._id : m.sender;
      const recipientId = isPopulatedUser(m.recipient) ? m.recipient._id : m.recipient;

      return (senderId === me && recipientId === otherId) ||
             (senderId === otherId && recipientId === me);
    });
  }, [items, selectedRecipient?._id, authUser?._id]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || !selectedRecipient?._id) return;

    dispatch(sendMessage({ recipientId: selectedRecipient._id, text: trimmed }));
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
        <div ref={messagesEndRef} />
      </div>

      {selectedRecipient && (
        <div className={styles.inputArea}>
          <input
            type="text"
            className={styles.input}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
          />
          <button
            className={styles.sendButton}
            onClick={handleSend}
            disabled={!text.trim()}
          >
            Send
          </button>
        </div>
      )}
    </section>
  );
};

export default MessagesRoom;
