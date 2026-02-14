import styles from './profileLink.module.css';
import { NavLink } from 'react-router-dom';
import { useAppSelector } from '../../../redux/hooks';
import profilePlaceholder from '../../../assets/profile-placeholder.svg';

const ProfileLink = () => {
  const user = useAppSelector((s) => s.auth.user);

  return (
    <nav className={styles.profileLink}>
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          isActive ? styles.activeLink : styles.link
        }
      >
        <div className={styles.profileLink_photoBox}>
          <img
            src={user?.profileImage || profilePlaceholder}
            alt={user?.username || 'profile'}
          />
        </div>
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};
export default ProfileLink;
