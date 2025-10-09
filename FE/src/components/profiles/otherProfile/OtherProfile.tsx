//блок с инфо чужого юзера
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
import { AppDispatch, RootState } from '../../../redux/store';
import styles from './otherProfile.module.css';

function OtherProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const { userId } = useParams<{ userId: string }>();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const loading = useSelector((state: RootState) => state.user.loading);
  const error = useSelector((state: RootState) => state.user.error);
  const authUser = useSelector((state: RootState) => state.auth.user);
  const myId = authUser?._id ?? '';

  const [follow, setFollow] = useState<ILocalFollow>({
    followers: 'Loading...',
    following: 'Loading...',
  });

  // если открыли свой профиль по /profile/:userId → редирект на /profile
  useEffect(() => {
    if (myId && userId && myId === userId) {
      navigate('/profile');
    }
  }, [myId, userId, navigate]);

  useEffect(() => {
    setFollow({ followers: 'Loading...', following: 'Loading...' });
  }, [userId]);

  // проверка: подписан ли я на этого пользователя
  useEffect(() => {
    const checkFollowing = async () => {
      if (!myId || !userId) return;
      const { data } = await $api.get(`/follows/${userId}/followers`);
      // бэк возвращает массив пользователей (популяция). Ищем свой id
      const ids: string[] = data.map((u: { _id: string }) => u._id);
      setIsFollowing(ids.includes(myId));
    };
    checkFollowing();
  }, [myId, userId]);

  // загрузка профиля пользователя
  useEffect(() => {
    if (userId) dispatch(getUserById(userId));
  }, [dispatch, userId]);

  const handleChangeFollow = (newFollow: ILocalFollow) => setFollow(newFollow);

  const handleFollow = async () => {
    if (!userId) return;
    const response = await $api.post(`/follows/${userId}/follow`);
    if (response.status === 200) {
      setIsFollowing(true);
      setFollow((prev) => ({
        ...prev,
        followers:
          prev.followers !== 'Loading...' ? prev.followers + 1 : prev.followers,
      }));
    }
  };

  const handleUnfollow = async () => {
    if (!userId) return;
    const response = await $api.delete(`/follows/${userId}/unfollow`);
    if (response.status === 200) {
      setIsFollowing(false);
      setFollow((prev) => ({
        ...prev,
        followers:
          prev.followers !== 'Loading...' ? prev.followers - 1 : prev.followers,
      }));
    }
  };

  const handleMessage = () => {
    if (userId) navigate('/messages', { state: { targetUserId: userId } });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
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
                <span className={styles.currentUserProfile_statisticCount}>
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
              {currentUser.bio || ''}
            </p>

            {currentUser.website ? (
              <a
                className={styles.webLink}
                href={currentUser.website}
                target="_blank"
                rel="noreferrer"
              >
                <img src={web} alt="" />
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
