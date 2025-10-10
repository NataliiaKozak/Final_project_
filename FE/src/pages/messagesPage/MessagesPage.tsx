import React, { useState } from 'react';
import MessagesRoom from '../../components/messages/messageRoom/MessageRoom';
import RecieversList from '../../components/messages/receiversList/RecieversList';
import type { IUser } from '../../interfaces/user.interface';
import styles from './messagePage.module.css';

const MessagesPage: React.FC = () => {
  const [selectedRecipient, setSelectedRecipient] = useState<IUser | null>(
    null
  );

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

