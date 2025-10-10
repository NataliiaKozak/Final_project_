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

const FollowsPanel: FC<IFollowPanel> = ({ userId, follow, setFollow }) => {
  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        // бэк: GET /follows/:userId/followers
        const res = await $api.get(`/follows/${userId}/followers`);
        const count = Array.isArray(res.data) ? res.data.length : 0;
        setFollow({
          followers: count,
          following: follow.following,
        });
      } catch (error){
        console.error('Error followers:', error);
      }
    };

    const fetchFollowing = async () => {
      try {
        // бэк: GET /follows/:userId/following
        const res = await $api.get(`/follows/${userId}/following`);
        const count = Array.isArray(res.data) ? res.data.length : 0;
        setFollow({
          followers: follow.followers,
          following: count,
        });
      } catch (error) {
        console.error('Error following:', error);
      }
    };

    if (follow.followers === 'Loading...') fetchFollowers();
    if (follow.following === 'Loading...') fetchFollowing();
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
