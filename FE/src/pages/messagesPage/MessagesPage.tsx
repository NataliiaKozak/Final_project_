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

// import React, { useEffect, useState } from 'react';
// import MessagesRoom from '../../components/messages/messageRoom/MessageRoom';
// import RecieversList from '../../components/messages/receiversList/RecieversList';
// import type { IUser } from '../../interfaces/user.interface';
// import { useSelector } from 'react-redux';
// import type { RootState } from '../../redux/store';
// // import { connectSocket, disconnectSocket } from '../../api/socket';
// import styles from './messagePage.module.css';

// const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// const MessagesPage: React.FC = () => {
//   const [selectedRecipient, setSelectedRecipient] = useState<IUser | null>(null);
//   const token = useSelector((s: RootState) => s.auth.token);

//   useEffect(() => {
//     if (token) {
//       connectSocket(API_BASE, token);
//     }
//     return () => {
//       disconnectSocket();
//     };
//   }, [token]);

//   return (
//     <div className={styles.messagePage}>
//       <RecieversList
//         onSelectRecipient={setSelectedRecipient}
//         selectedRecipient={selectedRecipient}
//       />
//       <MessagesRoom selectedRecipient={selectedRecipient} />
//     </div>
//   );
// };

// export default MessagesPage;
