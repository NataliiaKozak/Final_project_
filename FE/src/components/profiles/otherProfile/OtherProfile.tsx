//блок с инфо чужого юзера
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { useParams, useNavigate } from 'react-router-dom';
import CustomButton from '../../ui/customButton/CustomButton';
import FollowsPanel from '../../profiles/follows/Follows';
import { getUserById } from '../../../redux/slices/userSlice';
import { $api } from '../../../api/api';
import profilePlaceholder from '../../../assets/profile-placeholder.svg';
import web from '../../../assets/web.svg';
import {
  IFollowItem,
  ILocalFollow,
} from '../../../interfaces/follow.interface';
import styles from './otherProfile.module.css';

function OtherProfile() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { userId } = useParams<{ userId: string }>();
  const authUser = useAppSelector((s) => s.auth.user);
  const currentUser = useAppSelector((s) => s.user.currentUser);
  const loading = useAppSelector((s) => s.user.loading);
  const error = useAppSelector((s) => s.user.error);

  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [follow, setFollow] = useState<ILocalFollow>({
    followers: null,
    following: null,
  });

  // если открыли свой профиль — редирект на /profile
  useEffect(() => {
    if (authUser?._id && userId && authUser._id === userId) {
      navigate('/profile');
    }
  }, [authUser?._id, userId, navigate]);

  // сбрасываем локальные счётчики при смене userId
  useEffect(() => {
    setFollow({ followers: null, following: null });
  }, [userId]);

  // подтянуть пользователя (публичный профиль)
  useEffect(() => {
    if (userId) dispatch(getUserById(userId));
  }, [dispatch, userId]);

  // определить, подписан ли текущий пользователь (_id) на userId
  useEffect(() => {
    const checkFollowing = async () => {
      if (!authUser?._id || !userId) return;
      try {
        // GET /follows/:userId/following -> IFollowItem[]
        // нужно узнать список, на кого подписан ТЕКУЩИЙ юзер
        const { data } = await $api.get<IFollowItem[]>(
          `/follows/${authUser._id}/following`
        );
        const isFollow = data.some((u) => u._id === userId);
        setIsFollowing(isFollow);
      } catch (e) {
        console.error('Error check following:', e);
        setIsFollowing(false);
      }
    };
    checkFollowing();
  }, [authUser?._id, userId]);

  const handleChangeFollow = (newFollow: ILocalFollow) => setFollow(newFollow);

  const handleFollow = async () => {
    if (!userId) return;
    try {
      // бэк: POST /follows/:userId/follow
      await $api.post(`/follows/${userId}/follow`);
      setIsFollowing(true);
      setFollow((prev) => ({
        ...prev,
        followers: prev.followers !== null ? prev.followers + 1 : prev.followers,
      }));
    } catch (error) {
        console.error('Error follow:', error);
    }
  };

  const handleUnfollow = async () => {
    if (!userId) return;
    try {
      // бэк: DELETE /follows/:userId/unfollow
      await $api.delete(`/follows/${userId}/unfollow`);
      setIsFollowing(false);
      setFollow((prev) => ({
        ...prev,
        followers: prev.followers !== null ? prev.followers - 1 : prev.followers,
      }));
    } catch (e) {
      console.error('Error unfollow:', e);
    }
  };

  const handleMessage = () => {
    if (userId) navigate('/messages', { state: { targetUserId: userId } });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        ← Back
      </button>
      {currentUser ? (
        <div className={styles.otherProfile}>
          <span className={styles.gradient_border}>
            <span className={styles.gradient_border_inner}>
              <img
                src={currentUser.profileImage || profilePlaceholder}
                alt={currentUser.username}
              />
            </span>
          </span>

          <div className={styles.otherProfile_rightside}>
            <div className={styles.otherProfile_rightside_btnBox}>
              <p>{currentUser.username}</p>
              {currentUser.fullName && <p style={{ color: 'var(--color-text-grey)', fontWeight: 400 }}>{currentUser.fullName}</p>}

              <CustomButton
                text={isFollowing ? 'Unfollow' : 'Follow'}
                style={{
                  fontWeight: 600,
                  color: 'var(--color-text-dark)',
                  width: '168.72px',
                  backgroundColor: 'var(--color-bg-dark-grey)',
                }}
                onClick={isFollowing ? handleUnfollow : handleFollow}
              />

              <CustomButton
                className={styles.btn}
                text="Message"
                style={{ width: '168.72px' }}
                onClick={handleMessage}
              />
            </div>

            <div className={styles.otherProfile_statistic}>
              <p>
                <span className={styles.otherProfile_statisticCount}>
                  {currentUser.postsCount ?? 0}
                </span>
                posts
              </p>

              <FollowsPanel
                userId={userId || ''}
                follow={follow}
                setFollow={handleChangeFollow}
              />
            </div>

            <p className={styles.otherProfile_statisticBio}>
              {currentUser.bio}
            </p>

            {currentUser.website ? (
              <a className={styles.webLink} href={currentUser.website} target="_blank" rel="noreferrer">
                <img src={web} alt="website" />
                {currentUser.website}
              </a>
            ) : null}
          </div>
        </div>
      ) : (
        <p>User not found</p>
      )}
    </div>
  );
}

export default OtherProfile;

