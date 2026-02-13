import React, { useState, useEffect, MouseEvent } from 'react';
import { FaHeart, FaRegComment } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import CustomButton from '../../ui/customButton/CustomButton';
import { $api } from '../../../api/api';
import profilePlaceholder from '../../../assets/profile-placeholder.svg';
import parseData from '../../../helpers/parseData';
import { RootState } from '../../../redux/store';
import styles from './PostItem.module.css';

import type { IPost } from '../../../interfaces/post.interface';

type PostItemProps = {
  item: IPost;
  likesCount: number;
  setLikesCount: (postId: string, newCount: number) => void;
  onClick: () => void;
  listFollowing: string[] | null;
  handleRemoveSomeFollow: (userId: string) => void;
  handleAddSomeFollow: (userId: string) => void;
};

const PostItem: React.FC<PostItemProps> = ({
  item,
  likesCount,
  setLikesCount,
  onClick,
  listFollowing,
  handleAddSomeFollow,
  handleRemoveSomeFollow,
}) => {
  const [isLiked, setIsLiked] = useState(item.isLikedByMe ?? false);
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const myId = currentUser?._id ?? '';

  const authorId = typeof item.author === 'string' ? item.author : (item.author?._id ?? '');
  const authorName = typeof item.author === 'string' ? 'User' : (item.author?.username ?? 'User');
  const authorAvatar = typeof item.author === 'string' ? undefined : item.author?.profileImage;

  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);

  // инициализируем флаг подписки из списка (хук ДО условных return)
  useEffect(() => {
    if (listFollowing && authorId) {
      setIsFollowing(listFollowing.includes(authorId));
    }
  }, [authorId, listFollowing]);

  const goToProfile = (e: MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${authorId}`);
  };

  // если автор — я, не показываем карточку
  if (!currentUser) return null;
  if (authorId === myId) return null;

  // лайк — toggle на бэке (оптимистичное обновление)
  const handleLike = async () => {
    const prevLiked = isLiked;
    const prevCount = likesCount;
    // мгновенно переключаем UI
    setIsLiked(!prevLiked);
    setLikesCount(item._id, prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);
    try {
      const { data } = await $api.post<{ liked: boolean; likesCount: number }>(`/likes/post/${item._id}`);
      console.log('[PostItem] like response:', data);
      // синхронизируем с сервером
      setIsLiked(data.liked);
      setLikesCount(item._id, data.likesCount);
    } catch (error) {
      console.error('Ошибка при изменении лайка:', error);
      // откатываем
      setIsLiked(prevLiked);
      setLikesCount(item._id, prevCount);
    }
  };

  // follow / unfollow — бэк: /follows/:userId/(un)follow
  const handleFollow = async () => {
    if (!authorId) return;
    try {
      const res = await $api.post(`/follows/${authorId}/follow`);
      if (res.status === 200 || res.status === 201) {
        setIsFollowing(true);
        handleAddSomeFollow(authorId);
      }
    } catch (error) {
      console.error('Ошибка при подписке:', error);
    }
  };

  const handleUnfollow = async () => {
    if (!authorId) return;
    try {
      const res = await $api.delete(`/follows/${authorId}/unfollow`);
      if (res.status === 200) {
        setIsFollowing(false);
        handleRemoveSomeFollow(authorId);
      }
    } catch (error) {
      console.error('Ошибка при отписке:', error);
    }
  };

  const handleClickToFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFollowing) {
      handleUnfollow();
    } else {
      handleFollow();
    }
  };

  return (
    <li className={styles.postItem} onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className={styles.header}>
        <div className={styles.avatarContainer}>
          <img
            src={authorAvatar || profilePlaceholder}
            alt="avatar"
            className={styles.avatar}
            onClick={goToProfile}
            style={{ cursor: 'pointer' }}
          />
        </div>

        <div className={styles.userInfo}>
          <span className={styles.userName} onClick={goToProfile} style={{ cursor: 'pointer' }}>{authorName}</span>
          <span className={styles.greytext}>&#8226; {parseData(item.createdAt)} &#8226;</span>

          {isFollowing !== null && (
            <CustomButton
              text={isFollowing ? 'Unfollow' : 'Follow'}
              style={{
                fontWeight: 600,
                color: 'var(--color-text-blue)',
                backgroundColor: 'transparent',
              }}
              onClick={handleClickToFollow}
            />
          )}
        </div>
      </div>

      <div className={styles.imgPost}>
        <img src={item.image} alt="Post Image" className={styles.postImage} />
      </div>

      <div className={styles.bottomBlock}>
        <div className={styles.actions}>
          <FaHeart
            style={{ cursor: 'pointer', color: isLiked ? 'red' : '#ccc', transition: 'color 0.2s' }}
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
            size={20}
          />
          <span className={styles.likesCount}>{likesCount} likes</span>
          <FaRegComment className="text-gray-500" size={20} />
        </div>

        <span>
          <span className="font-semibold italic">{authorName}</span>: {item.description}
        </span>
      </div>

      <div className={styles.commentsContainer}>
        <span>View all comments ({item.commentsCount ?? 0})</span>
      </div>
    </li>
  );
};

export default PostItem;
