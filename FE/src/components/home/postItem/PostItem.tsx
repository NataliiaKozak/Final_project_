import React, { useState, useEffect, MouseEvent } from 'react';
import { FaHeart, FaRegComment } from 'react-icons/fa';
import { useSelector } from 'react-redux';

import CustomButton from '../../customButton/CustomButton';
import { $api } from '../../api/api';
import profilePlaceholder from '../../assets/profile-placeholder.svg';
import parseData from '../../helpers/parseData';
import { RootState } from '../../redux/store';
import styles from './PostItem.module.css';

type Post = {
  _id: string;
  user_id: string | { _id: string }; // Учитываем возможный объект
  image_url: string;
  caption: string;
  created_at: string;
  user_name: string;
  profile_image: string;
  likes_count?: number;
  comments_count?: number;
  last_comment?: string;
};

type PostItemProps = {
  item: Post;
  likesCount: number;
  setLikesCount: (postId: string, newCount: number) => void;
  onClick: () => void;
  listFollowing: string[] | null;
  handleRemoveSomeFollow: (arg0: string) => void;
  handleAddSomeFollow: (arg0: string) => void;
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
  const { _id } = currentUser || {};
  const userId =
    typeof item.user_id === 'string' ? item.user_id : item.user_id?._id || ''; // Проверяем и извлекаем userId

  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);

  // Проверяем наличие текущего пользователя
  if (!currentUser) {
    console.error('Current user not found');
    return null; // Можно вернуть сообщение или компонент загрузки
  }
  if (userId === _id) {
    return null;
  }
  // Проверяем, лайкнут ли пост текущим пользователем
  useEffect(() => {
    const fetchLikedStatus = async () => {
      try {
        const response = await $api.get(`/likes/user/${_id}`);
        const userLikes = response.data; // Получаем список лайкнутых постов
        if (userLikes.includes(item._id)) {
          setIsLiked(true);
        }
      } catch (error) {
        console.error('Ошибка при загрузке статуса лайка:', error);
      }
    };

    fetchLikedStatus();
  }, [item._id, _id]);

  // Проверяем, подписан ли текущий пользователь на автора поста
  useEffect(() => {
    if (listFollowing && userId) {
      setIsFollowing(listFollowing.includes(userId));
    }
  }, [_id, userId, listFollowing]);

  // Обработчик лайков
  const handleLike = async () => {
    try {
      if (isLiked) {
        await $api.delete(`/likes/${item._id}/${_id}`);
        setLikesCount(item._id, likesCount - 1);
      } else {
        await $api.post(`/likes/${item._id}/${_id}`);
        setLikesCount(item._id, likesCount + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Ошибка при изменении лайка:', error);
    }
  };

  // Обработчик подписки
  const handleFollow = async () => {
    if (!_id || !userId) {
      console.error(
        'Не удалось выполнить подписку: отсутствует _id или userId',
      );
      return;
    }

    try {
      const response = await $api.post(`/follow/${_id}/follow/${userId}`);
      if (response.status === 201) {
        setIsFollowing(true);
      }
      handleAddSomeFollow(userId);
    } catch (error) {
      console.error('Ошибка при подписке:', error);
    }
  };

  // Обработчик отписки
  const handleUnfollow = async () => {
    if (!_id || !userId) {
      console.error('Не удалось выполнить отписку: отсутствует _id или userId');
      return;
    }

    try {
      const response = await $api.delete(`/follow/${userId}/unfollow/${_id}`);
      if (response.status === 200) {
        setIsFollowing(false);
      }

      handleRemoveSomeFollow(userId);
    } catch (error) {
      console.error('Ошибка при отписке:', error);
    }
  };

  const handleClickToFollow = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isFollowing) {
      handleUnfollow();
    } else {
      handleFollow();
    }
  };

  return (
    <li
      className={styles.postItem}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className={styles.header}>
        <div className={styles.avatarContainer}>
          <img
            src={item.profile_image || profilePlaceholder}
            alt="avatar"
            className={styles.avatar}
          />
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{item.user_name}</span>
          <span className={styles.greytext}>
            &#8226; {parseData(item.created_at)} &#8226;
          </span>
          {isFollowing !== null && (
            <CustomButton
              text={
                isFollowing
                  ? 'otherProfile.unfollow'
                  : 'otherProfile.follow'
              }
              style={{
                fontWeight: 600,
                color: 'var( --color-text-blue)',
                backgroundColor: 'transparent',
              }}
              onClick={handleClickToFollow}
            />
          )}
        </div>
      </div>
      <div className={styles.imgPost}>
        <img
          src={item.image_url}
          alt="Post Image"
          className={styles.postImage}
        />
      </div>
      <div className={styles.bottomBlock}>
        <div className={styles.actions}>
          <FaHeart
            className={`${styles.likeIcon} ${
              isLiked ? styles.liked : styles.unliked
            }`}
            onClick={e => {
              e.stopPropagation();
              handleLike();
            }}
            size={20}
          />
          <span className={styles.likesCount}>{likesCount} likes</span>
          <FaRegComment className="text-gray-500" size={20} />
        </div>
        <span>
          <span className="font-semibold italic">{item.user_name}</span>:
          {item.caption}
        </span>
      </div>
      <div className={styles.commentsContainer}>
        <span>{item.last_comment || 'Add a comment...'}</span>
        <span className={styles.commentText}>
          View all comments ({item.comments_count})
        </span>
      </div>
    </li>
  );
};

export default PostItem;
