import MessagesRoom from '../../molecules/messageRoom/MessageRoom';
import RecieversList from '../../molecules/receiversList/RecieversList';
import styles from './messagePage.module.css';

const MessagesPage: React.FC = () => {
  return (
    <div className={styles.messagePage}>
      <RecieversList />
      <MessagesRoom />
    </div>
  );
};

export default MessagesPage;
