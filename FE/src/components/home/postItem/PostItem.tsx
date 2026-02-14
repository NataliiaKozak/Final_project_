import React, { useState, useEffect, useCallback, MouseEvent } from 'react';
import { FaHeart, FaRegComment } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import CustomButton from '../../ui/customButton/CustomButton';
import { $api } from '../../../api/api';
import profilePlaceholder from '../../../assets/profile-placeholder.svg';
import parseData from '../../../helpers/parseData';
import { useAppSelector } from '../../../redux/hooks';
import { useOptimisticLike } from '../../../hooks/useOptimisticLike';
import { getAuthorInfo } from '../../../utils/author';
import styles from './PostItem.module.css';

import type { IPost } from '../../../interfaces/post.interface';

interface PostItemProps {
  item: IPost;
  likesCount: number;
  setLikesCount: (postId: string, newCount: number) => void;
  onClick: () => void;
  listFollowing: string[] | null;
  handleRemoveSomeFollow: (userId: string) => void;
  handleAddSomeFollow: (userId: string) => void;
}

const PostItem: React.FC<PostItemProps> = ({
  item,
  likesCount: externalLikesCount,
  setLikesCount,
  onClick,
  listFollowing,
  handleAddSomeFollow,
  handleRemoveSomeFollow,
}) => {
  const navigate = useNavigate();
  const currentUser = useAppSelector((s) => s.auth.user);
  const myId = currentUser?._id ?? '';

  const { id: authorId, name: authorName, image: authorAvatar } = getAuthorInfo(item.author);

  const { isLiked, toggleLike } = useOptimisticLike(
    item._id,
    item.isLikedByMe ?? false,
    externalLikesCount,
    setLikesCount,
  );

  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);

  useEffect(() => {
    if (listFollowing && authorId) {
      setIsFollowing(listFollowing.includes(authorId));
    }
  }, [authorId, listFollowing]);

  const goToProfile = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      navigate(`/profile/${authorId}`);
    },
    [navigate, authorId],
  );

  if (!currentUser) return null;
  if (authorId === myId) return null;

  const handleFollow = async () => {
    if (!authorId) return;
    try {
      const res = await $api.post(`/follows/${authorId}/follow`);
      if (res.status === 200 || res.status === 201) {
        setIsFollowing(true);
        handleAddSomeFollow(authorId);
      }
    } catch (err: unknown) {
      if (err instanceof Error) console.error('Follow error:', err.message);
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
    } catch (err: unknown) {
      if (err instanceof Error) console.error('Unfollow error:', err.message);
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
              toggleLike();
            }}
            size={20}
          />
          <span className={styles.likesCount}>{externalLikesCount} likes</span>
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

export default React.memo(PostItem);
