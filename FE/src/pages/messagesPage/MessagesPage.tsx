import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MessagesRoom from '../../components/messages/messageRoom/MessageRoom';
import RecieversList from '../../components/messages/receiversList/RecieversList';
import { $api } from '../../api/api';
import type { IUser } from '../../interfaces/user.interface';
import styles from './messagePage.module.css';

const MessagesPage: React.FC = () => {
  const location = useLocation();
  const [selectedRecipient, setSelectedRecipient] = useState<IUser | null>(null);

  // Если перешли с кнопки "Message" на чужом профиле
  useEffect(() => {
    const targetUserId = (location.state as { targetUserId?: string })?.targetUserId;
    if (targetUserId && !selectedRecipient) {
      (async () => {
        try {
          const { data } = await $api.get(`/users/${targetUserId}`);
          setSelectedRecipient({
            _id: data._id,
            username: data.username,
            email: data.email ?? '',
            fullName: data.fullName ?? '',
            profileImage: data.profileImage,
          });
        } catch (err) {
          console.error('Error loading target user:', err);
        }
      })();
    }
  }, [location.state]);

  return (
    <div className={styles.messagePage}>
      <RecieversList
        onSelectRecipient={setSelectedRecipient}
        selectedRecipient={selectedRecipient}
      />
      <MessagesRoom selectedRecipient={selectedRecipient} />
    </div>
  );
};

export default MessagesPage;
