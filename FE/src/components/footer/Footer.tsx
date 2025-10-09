import styles from './footer.module.css';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <div className={styles.footer}>
      <div className={styles.footer_top}>
        <Link to="/home">Home</Link>
        <Link to="/search">Search</Link>
        <Link to="/explore">Explore</Link>
        <Link to="/messages">Messages</Link>
        <Link to="/notifications">Notifications</Link>
        <Link to="/create">Create</Link>
      </div>
      <div className={styles.footer_bottom}>
        <p>© 2025 ICHgram</p>
      </div>
    </div>
  );
};
