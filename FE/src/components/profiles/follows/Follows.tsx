//виджет «followers / following»
import { FC, useEffect } from 'react';
import { $api } from '../../../api/api';
import { ILocalFollow } from '../../../interfaces/follow.interface';
import styles from './follows.module.css';

interface IFollowPanel {
  userId: string;
  follow: ILocalFollow;
  setFollow: (newFollow: ILocalFollow) => void;
}

const FollowsPanel: FC<IFollowPanel> = ({ userId, setFollow, follow }) => {
  useEffect(() => {
    const handleGetFollowers = async () => {
      const response = await $api.get(`/follows/${userId}/followers`); // GET followers
      setFollow({ ...follow, followers: response.data.length });
    };
    const handleGetFollowing = async () => {
      const response = await $api.get(`/follows/${userId}/following`); // GET following
      setFollow({ ...follow, following: response.data.length });
    };

    if (follow.followers === 'Loading...') handleGetFollowers();
    if (follow.following === 'Loading...') handleGetFollowing();
  }, [userId, follow, setFollow]);

  return (
    <>
      {follow.followers !== 'Loading...' && (
        <p>
          <span className={styles.text}>{follow.followers}</span>
          followers
        </p>
      )}
      {follow.following !== 'Loading...' && (
        <p>
          <span className={styles.text}>{follow.following}</span>
          following
        </p>
      )}
    </>
  );
};

export default FollowsPanel;
