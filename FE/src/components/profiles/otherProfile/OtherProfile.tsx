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

  const { userId } = useParams<{ userId: string }>();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const loading = useSelector((state: RootState) => state.user.loading);
  const error = useSelector((state: RootState) => state.user.error);

  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [follow, setFollow] = useState<ILocalFollow>({
    followers: 'Loading...',
    following: 'Loading...',
  });

  // если открыли свой профиль — редирект на /profile
  useEffect(() => {
    if (authUser?._id && userId && authUser._id === userId) {
      navigate('/profile');
    }
  }, [authUser?._id, userId, navigate]);

  // сбрасываем локальные счётчики при смене userId
  useEffect(() => {
    setFollow({ followers: 'Loading...', following: 'Loading...' });
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
        console.error('Error check following:', error);
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
        followers: prev.followers !== 'Loading...' ? prev.followers + 1 : prev.followers,
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
        followers: prev.followers !== 'Loading...' ? prev.followers - 1 : prev.followers,
      }));
    } catch (e) {
      console.error('Error unfollow:', error);
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

