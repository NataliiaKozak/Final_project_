import React from 'react';
import PostsList from '../../components/posts/postsList2/PostList2';
import CurrentUserProfile from '../../components/profiles/currentUserProfile/CurrentUserProfile';
import styles from './profilePage.module.css';

const ProfilePage: React.FC = () => {
  return (
    <div className={styles.profilePage}>
      <CurrentUserProfile />
      <PostsList />
    </div>
  );
};

export default ProfilePage;
