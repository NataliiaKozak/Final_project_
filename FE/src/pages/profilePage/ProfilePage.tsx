import React from 'react';
import PostsList from '../../components/posts/postsList2/PostList2';
import CurrentUserProfile from '../../components/profiles/currentUserProfile/CurrentUserProfile';
import Seo from '../../components/ui/seo/Seo';
import styles from './profilePage.module.css';

const ProfilePage: React.FC = () => {
  return (
    <div className={styles.profilePage}>
      <Seo title="Profile" description="View your profile and posts on ICHGRAMM." />
      <CurrentUserProfile />
      <PostsList />
    </div>
  );
};

export default ProfilePage;
