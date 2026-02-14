import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { useNavigate } from 'react-router-dom';

import CustomButton from '../../ui/customButton/CustomButton';
import FollowsPanel from '../../profiles/follows/Follows';
import { logout } from '../../../redux/slices/authSlice';
import { getUserById } from '../../../redux/slices/userSlice';
import profilePlaceholder from '../../../assets/profile-placeholder.svg';
import { ILocalFollow } from '../../../interfaces/follow.interface';
import styles from './currentUserProfile.module.css';
import web from '../../../assets/web.svg';

const CurrentUserProfile: React.FC = () => {
  const user = useAppSelector((s) => s.auth.user);
  const currentUser = useAppSelector((s) => s.user.currentUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?._id) dispatch(getUserById(user._id));
  }, [dispatch, user?._id]);
  const [follow, setFollow] = useState<ILocalFollow>({
    followers: null,
    following: null,
  });

  if (!user) return <div>Failed to load profile</div>;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };
  const handleChangeFollow = (newFollow: ILocalFollow) => {
    setFollow(newFollow);
  };

  return (
    <div className={styles.currentUserProfile}>
      <span className={styles.gradient_border}>
        <span className={styles.gradient_border_inner}>
          <img
            src={user.profileImage || profilePlaceholder}
            alt={user.username}
          />
        </span>
      </span>
      <div className={styles.currentUserProfile_rightside}>
        <div className={styles.currentUserProfile_rightside_btnBox}>
          <p>{user.username}</p>
          {user.fullName && <p style={{ color: 'var(--color-text-grey)', fontWeight: 400 }}>{user.fullName}</p>}
          <CustomButton
            className={styles.btn}
            text="Edit profile"
            style={{
              fontWeight: 600,
              color: 'var(--color-text-dark)',
              width: '168.72px',
              backgroundColor: 'var(--color-bg-dark-grey)',
            }}
            onClick={handleEditProfile}
          />
          <CustomButton
            className={styles.btn}
            text="Log out"
            style={{ width: '168.72px', fontWeight: 600 }}
            onClick={handleLogout}
          />
        </div>

        <div className={styles.currentUserProfile_statistic}>
          <p>
            <span className={styles.currentUserProfile_statisticCount}>
              {currentUser?.postsCount ?? user.postsCount ?? 0}
            </span>
            posts
          </p>

          <FollowsPanel
            userId={user._id}
            follow={follow}
            setFollow={handleChangeFollow}
          />
        </div>

        <p className={styles.currentUserProfile_statisticBio}>
          {user.bio || ''}
        </p>

        {user.website ? (
          <a className={styles.webLink} href={user.website} target="_blank" rel="noreferrer">
            <img src={web} alt="" />
            {user.website}
          </a>
        ) : null}
      </div>
    </div>
  );
};

export default CurrentUserProfile;
