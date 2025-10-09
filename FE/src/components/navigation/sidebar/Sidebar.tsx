import styles from './sidebar.module.css';
import logo from '../../../assets/logo-ichgram.svg';
import Menubar from '../menubar/Menubar';
import ProfileLink from '../profileLink/ProfileLink';

const Sidebar = () => {
  return (
    <div className={styles.sidebar}>
      <img src={logo} alt="logo" />
      <Menubar />
      <ProfileLink />
    </div>
  );
};

export default Sidebar;
