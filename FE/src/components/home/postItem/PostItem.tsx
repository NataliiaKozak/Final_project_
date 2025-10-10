import React, { useState, useEffect, MouseEvent } from 'react';
import { FaHeart, FaRegComment } from 'react-icons/fa';
import { useSelector } from 'react-redux';

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
  const [isLiked, setIsLiked] = useState(false);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const myId = currentUser?._id ?? '';

  const authorId = typeof item.author === 'string' ? item.author : (item.author?._id ?? '');
  const authorName = typeof item.author === 'string' ? 'User' : (item.author?.username ?? 'User');
  const authorAvatar = typeof item.author === 'string' ? undefined : item.author?.profileImage;

  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);

  // если автор — я, не показываем карточку (как в чужом коде)
  if (!currentUser) return null;
  if (authorId === myId) return null;

  // инициализируем флаг подписки из списка
  useEffect(() => {
    if (listFollowing && authorId) {
      setIsFollowing(listFollowing.includes(authorId));
    }
  }, [authorId, listFollowing]);

  // лайк — toggle на  бэке
  const handleLike = async () => {
    try {
      await $api.post(`/likes/post/${item._id}`);
      setIsLiked(prev => !prev);
      setLikesCount(item._id, isLiked ? likesCount - 1 : likesCount + 1);
    } catch (error) {
      console.error('Ошибка при изменении лайка:', error);
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

  const handleClickToFollow = () => {
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
          />
        </div>

        <div className={styles.userInfo}>
          <span className={styles.userName}>{authorName}</span>
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
            className={`${styles.likeIcon} ${isLiked ? styles.liked : styles.unliked}`}
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
