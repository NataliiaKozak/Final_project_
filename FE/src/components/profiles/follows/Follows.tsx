import { FC, useEffect, useCallback } from 'react';
import { $api } from '../../../api/api';
import { ILocalFollow } from '../../../interfaces/follow.interface';
import styles from './follows.module.css';

interface IFollowPanel {
  userId: string;
  follow: ILocalFollow;
  setFollow: (newFollow: ILocalFollow) => void;
}

const FollowsPanel: FC<IFollowPanel> = ({ userId, follow, setFollow }) => {
  const fetchCounts = useCallback(async () => {
    try {
      const [followersRes, followingRes] = await Promise.all([
        $api.get(`/follows/${userId}/followers`),
        $api.get(`/follows/${userId}/following`),
      ]);
      const followersCount = Array.isArray(followersRes.data) ? followersRes.data.length : 0;
      const followingCount = Array.isArray(followingRes.data) ? followingRes.data.length : 0;
      setFollow({ followers: followersCount, following: followingCount });
    } catch (err: unknown) {
      if (err instanceof Error) console.error('Follow counts error:', err.message);
    }
  }, [userId, setFollow]);

  useEffect(() => {
    if (follow.followers === null || follow.following === null) {
      fetchCounts();
    }
  }, [userId, follow.followers, follow.following, fetchCounts]);

  return (
    <>
      {follow.followers !== null && (
        <p>
          <span className={styles.text}>{follow.followers}</span>
          followers
        </p>
      )}
      {follow.following !== null && (
        <p>
          <span className={styles.text}>{follow.following}</span>
          following
        </p>
      )}
    </>
  );
};

export default FollowsPanel;
