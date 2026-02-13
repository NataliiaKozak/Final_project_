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
    const fetchCounts = async () => {
      try {
        const [followersRes, followingRes] = await Promise.all([
          $api.get(`/follows/${userId}/followers`),
          $api.get(`/follows/${userId}/following`),
        ]);
        const followersCount = Array.isArray(followersRes.data) ? followersRes.data.length : 0;
        const followingCount = Array.isArray(followingRes.data) ? followingRes.data.length : 0;
        setFollow({
          followers: followersCount,
          following: followingCount,
        });
      } catch (error) {
        console.error('Error fetching follow counts:', error);
      }
    };

    if (follow.followers === 'Loading...' || follow.following === 'Loading...') {
      fetchCounts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

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
