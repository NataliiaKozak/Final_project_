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

  // лайк — toggle на твоём бэке
  const handleLike = async () => {
    try {
      await $api.post(`/likes/post/${item._id}`);
      setIsLiked(prev => !prev);
      setLikesCount(item._id, isLiked ? likesCount - 1 : likesCount + 1);
    } catch (error) {
      console.error('Ошибка при изменении лайка:', error);
    }
  };

  // follow / unfollow — твой бэк: /follows/:userId/(un)follow
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
// type PostItemProps = {
//   item: IPost;
//   likesCount: number;
//   setLikesCount: (postId: string, newCount: number) => void;
//   onClick: () => void;
//   listFollowing: string[] | null;
//   handleRemoveSomeFollow: (userId: string) => void;
//   handleAddSomeFollow: (userId: string) => void;
// };

// const PostItem: React.FC<PostItemProps> = ({
//   item,
//   likesCount,
//   setLikesCount,
//   onClick,
//   listFollowing,
//   handleAddSomeFollow,
//   handleRemoveSomeFollow,
// }) => {
//   const [isLiked, setIsLiked] = useState(false);
//   const currentUser = useSelector((state: RootState) => state.auth.user);
//   const meId = currentUser?._id ?? '';

//   // автор id из union
//   const authorId =
//     typeof item.author === 'string' ? item.author : item.author?._id ?? '';
//   const authorName =
//     typeof item.author === 'string' ? 'User' : item.author?.username ?? 'User';
//   const authorAvatar =
//     typeof item.author === 'string'
//       ? profilePlaceholder
//       : item.author?.profileImage || profilePlaceholder;

//   const [isFollowing, setIsFollowing] = useState<boolean | null>(null);

//   if (!currentUser) {
//     console.error('Current user not found');
//     return null;
//   }
//   if (authorId === meId) {
//     return null;
//     // свой пост — кнопку follow не показываем, карточку можно скрыть полностью если так задумано
//   }

//   useEffect(() => {
//     if (listFollowing && authorId) {
//       setIsFollowing(listFollowing.includes(authorId));
//     }
//   }, [authorId, listFollowing]);

//   const handleLike = async () => {
//     try {
//       await $api.post(`/likes/post/${item._id}`); // toggle
//       setIsLiked((prev) => !prev);
//       setLikesCount(item._id, isLiked ? likesCount - 1 : likesCount + 1);
//     } catch (error) {
//       console.error('Ошибка при изменении лайка:', error);
//     }
//   };

//   const handleFollow = async () => {
//     if (!authorId) return;
//     try {
//       const res = await $api.post(`/follows/${authorId}/follow`);
//       if (res.status === 201 || res.status === 200) {
//         setIsFollowing(true);
//         handleAddSomeFollow(authorId);
//       }
//     } catch (error) {
//       console.error('Ошибка при подписке:', error);
//     }
//   };

//   const handleUnfollow = async () => {
//     if (!authorId) return;
//     try {
//       const res = await $api.delete(`/follows/${authorId}/unfollow`);
//       if (res.status === 200) {
//         setIsFollowing(false);
//         handleRemoveSomeFollow(authorId);
//       }
//     } catch (error) {
//       console.error('Ошибка при отписке:', error);
//     }
//   };

//   const handleClickToFollow = (e: MouseEvent<HTMLButtonElement>) => {
//     e.stopPropagation();
//     if (isFollowing) handleUnfollow();
//     else handleFollow();
//   };

//   return (
//     <li className={styles.postItem} onClick={onClick} style={{ cursor: 'pointer' }}>
//       <div className={styles.header}>
//         <div className={styles.avatarContainer}>
//           <img
//             src={authorAvatar}
//             alt="profileImage"
//             className={styles.avatar}
//           />
//         </div>
//         <div className={styles.userInfo}>
//           <span className={styles.userName}>{authorName}</span>
//           <span className={styles.greytext}>
//             &#8226; {parseData(item.createdAt)} &#8226;
//           </span>
//           {isFollowing !== null && (
//             <CustomButton
//               text={isFollowing ? 'Unfollow' : 'Follow'}
//               style={{
//                 fontWeight: 600,
//                 color: 'var(--color-text-blue)',
//                 backgroundColor: 'transparent',
//               }}
//               onClick={() => {}}
             
//             />
//           )}
//         </div>
//       </div>

//       <div className={styles.imgPost}>
//         <img src={item.image} alt="Post Image" className={styles.postImage} />
//       </div>

//       <div className={styles.bottomBlock}>
//         <div className={styles.actions}>
//           <FaHeart
//             className={`${styles.likeIcon} ${isLiked ? styles.liked : styles.unliked}`}
//             onClick={(e) => {
//               e.stopPropagation();
//               handleLike();
//             }}
//             size={20}
//           />
//           <span className={styles.likesCount}>{likesCount} likes</span>
//           <FaRegComment className="text-gray-500" size={20} />
//         </div>

//         <span>
//           <span className="font-semibold italic">{authorName}</span>: {item.description}
//         </span>
//       </div>

//       <div className={styles.commentsContainer}>
//         <span>View all comments ({item.commentsCount ?? 0})</span>
//       </div>
//     </li>
//   );
// };

// export default PostItem;

//споймано на вранье


// import type { IPost } from '../../../interfaces/post.interface';

// type PostItemProps = {
//   item: IPost;
//   likesCount: number;
//   setLikesCount: (postId: string, newCount: number) => void;
//   onClick: () => void;
//   listFollowing: string[] | null;
//   handleRemoveSomeFollow: (userId: string) => void;
//   handleAddSomeFollow: (userId: string) => void;
// };

// const PostItem: React.FC<PostItemProps> = ({
//   item,
//   likesCount,
//   setLikesCount,
//   onClick,
//   listFollowing,
//   handleAddSomeFollow,
//   handleRemoveSomeFollow,
// }) => {
//   const [isLiked, setIsLiked] = useState(false);
//   const currentUser = useSelector((state: RootState) => state.auth.user);

//   if (!currentUser) {
//     console.error('Current user not found');
//     return null;
//   }

//   // автор поста
//   const authorObj = typeof item.author === 'string' ? undefined : item.author;
//   const authorId = typeof item.author === 'string' ? item.author : (item.author?._id || '');
//   const authorName = authorObj?.username ?? 'User';
//   const authorImage = authorObj?.profileImage || profilePlaceholder;

//   // скрываем карточку, если это мой пост
//   if (authorId && currentUser._id === authorId) {
//     return null;
//   }

//   const [isFollowing, setIsFollowing] = useState<boolean | null>(null);

//   // был ли лайкнут этот пост мной
//   useEffect(() => {
//     (async () => {
//       try {
//         // если у тебя есть эндпоинт «мои лайки», можешь оставить проверку;
//         // иначе можно инициализировать из item.likes?.includes(currentUser._id)
//         // Здесь делаем простую клиентскую инициализацию:
//         setIsLiked(Array.isArray(item.likes) && item.likes.includes(currentUser._id));
//       } catch (error) {
//         // noop
//       }
//     })();
//   }, [item.likes, currentUser._id]);

//   // подписан ли я на автора
//   useEffect(() => {
//     if (listFollowing && authorId) {
//       setIsFollowing(listFollowing.includes(authorId));
//     }
//   }, [listFollowing, authorId]);

//   // toggle лайк (твой бэк)
//   const handleLike = async () => {
//     try {
//       await $api.post(`/likes/post/${item._id}`); // toggle на бэке
//       setIsLiked(prev => !prev);
//       setLikesCount(item._id, isLiked ? likesCount - 1 : likesCount + 1);
//     } catch (error) {
//       console.error('Ошибка при изменении лайка:', error);
//     }
//   };

//   // подписка/отписка (твои эндпоинты)
//   const handleFollow = async () => {
//     if (!currentUser._id || !authorId) return;
//     try {
//       const res = await $api.post(`/follow/${currentUser._id}/follow/${authorId}`);
//       if (res.status === 201) setIsFollowing(true);
//       handleAddSomeFollow(authorId);
//     } catch (error) {
//       console.error('Ошибка при подписке:', error);
//     }
//   };

//   const handleUnfollow = async () => {
//     if (!currentUser._id || !authorId) return;
//     try {
//       const res = await $api.delete(`/follow/${authorId}/unfollow/${currentUser._id}`);
//       if (res.status === 200) setIsFollowing(false);
//       handleRemoveSomeFollow(authorId);
//     } catch (error) {
//       console.error('Ошибка при отписке:', error);
//     }
//   };

//   const handleClickToFollow = (e: MouseEvent<HTMLButtonElement>) => {
//     e.stopPropagation();
//     if (isFollowing) handleUnfollow();
//     else handleFollow();
//   };

//   return (
//     <li className={styles.postItem} onClick={onClick} style={{ cursor: 'pointer' }}>
//       <div className={styles.header}>
//         <div className={styles.avatarContainer}>
//           <img
//             src={authorImage}
//             alt="profileImage"
//             className={styles.avatar}
//           />
//         </div>
//         <div className={styles.userInfo}>
//           <span className={styles.userName}>{authorName}</span>
//           <span className={styles.greytext}>
//             &#8226; {parseData(item.createdAt)} &#8226;
//           </span>
//           {isFollowing !== null && (
//             <CustomButton
//               text={isFollowing ? 'Unfollow' : 'Follow'}
//               style={{
//                 fontWeight: 600,
//                 color: 'var(--color-text-blue)',
//                 backgroundColor: 'transparent',
//               }}
//               onClick={() => handleClickToFollow as unknown as () => void} // не триггерим стоп всплытие тут
//             />
//           )}
//         </div>
//       </div>

//       <div className={styles.imgPost}>
//         <img src={item.image} alt="Post Image" className={styles.postImage} />
//       </div>

//       <div className={styles.bottomBlock}>
//         <div className={styles.actions}>
//           <FaHeart
//             className={`${styles.likeIcon} ${isLiked ? styles.liked : styles.unliked}`}
//             onClick={(e) => {
//               e.stopPropagation();
//               handleLike();
//             }}
//             size={20}
//           />
//           <span className={styles.likesCount}>{likesCount} likes</span>
//           <FaRegComment className="text-gray-500" size={20} />
//         </div>
//         <span>
//           <span className="font-semibold italic">{authorName}</span>: {item.description}
//         </span>
//       </div>

//       <div className={styles.commentsContainer}>
//         <span className={styles.commentText}>
//           View all comments ({item.commentsCount ?? 0})
//         </span>
//       </div>
//     </li>
//   );
// };

// export default PostItem;
//не знаю, чем похожи с предыдущим
// import type { IPost } from '../../../interfaces/post.interface';

// type PostItemProps = {
//   item: IPost;
//   likesCount: number;
//   setLikesCount: (postId: string, newCount: number) => void;
//   onClick: () => void;
//   listFollowing: string[] | null;
//   handleRemoveSomeFollow: (userId: string) => void;
//   handleAddSomeFollow: (userId: string) => void;
// };

// const PostItem: React.FC<PostItemProps> = ({
//   item,
//   likesCount,
//   setLikesCount,
//   onClick,
//   listFollowing,
//   handleAddSomeFollow,
//   handleRemoveSomeFollow,
// }) => {
//   // нормализуем автора из union-типа
//   const authorId =
//     typeof item.author === 'string' ? item.author : item.author?._id || '';
//   const authorName =
//     typeof item.author === 'string' ? 'User' : item.author?.username || 'User';
//   const authorImage =
//     typeof item.author === 'string'
//       ? undefined
//       : item.author?.profileImage || undefined;

//   const [isLiked, setIsLiked] = useState(false);
//   const [isFollowing, setIsFollowing] = useState<boolean | null>(null);

//   const currentUser = useSelector((state: RootState) => state.auth.user);
//   const myId = currentUser?._id || '';

//   // нет пользователя — не рендерим карточку
//   if (!currentUser) return null;
//   // свои посты в ленте — пропускаем
//   if (authorId === myId) return null;

//   // Проверяем, лайкнут ли пост текущим пользователем (как и раньше)
//   useEffect(() => {
//     const fetchLikedStatus = async () => {
//       try {
//         const { data } = await $api.get<string[]>(`/likes/user/${myId}`);
//         setIsLiked(data.includes(item._id));
//       } catch (error) {
//         console.error('Ошибка при загрузке статуса лайка:', error);
//       }
//     };
//     if (myId) fetchLikedStatus();
//   }, [item._id, myId]);

//   // Проверяем подписку на автора
//   useEffect(() => {
//     if (listFollowing && authorId) {
//       setIsFollowing(listFollowing.includes(authorId));
//     }
//   }, [authorId, listFollowing]);

//   // ЛАЙК — toggle на бэке: POST /likes/post/:postId
//   const handleLike = async () => {
//     try {
//       await $api.post(`/likes/post/${item._id}`);
//       // оптимистично обновляем
//       setIsLiked(prev => !prev);
//       setLikesCount(item._id, isLiked ? likesCount - 1 : likesCount + 1);
//     } catch (error) {
//       console.error('Ошибка при изменении лайка:', error);
//     }
//   };

//   // Подписка
//   const handleFollow = async () => {
//     if (!myId || !authorId) return;
//     try {
//       const response = await $api.post(`/follow/${myId}/follow/${authorId}`);
//       if (response.status === 201) setIsFollowing(true);
//       handleAddSomeFollow(authorId);
//     } catch (error) {
//       console.error('Ошибка при подписке:', error);
//     }
//   };

//   // Отписка
//   const handleUnfollow = async () => {
//     if (!myId || !authorId) return;
//     try {
//       const response = await $api.delete(`/follow/${authorId}/unfollow/${myId}`);
//       if (response.status === 200) setIsFollowing(false);
//       handleRemoveSomeFollow(authorId);
//     } catch (error) {
//       console.error('Ошибка при отписке:', error);
//     }
//   };

//   const handleClickToFollow = (e: MouseEvent<HTMLButtonElement>) => {
//     e.stopPropagation();
//     if (isFollowing) handleUnfollow();
//     else handleFollow();
//   };

//   return (
//     <li className={styles.postItem} onClick={onClick} style={{ cursor: 'pointer' }}>
//       <div className={styles.header}>
//         <div className={styles.avatarContainer}>
//           <img
//             src={authorImage || profilePlaceholder}
//             alt="profileImage"
//             className={styles.avatar}
//           />
//         </div>
//         <div className={styles.userInfo}>
//           <span className={styles.userName}>{authorName}</span>
//           <span className={styles.greytext}>
//             &#8226; {parseData(item.createdAt)} &#8226;
//           </span>
//           {isFollowing !== null && (
//             <CustomButton
//               text={isFollowing ? 'Unfollow' : 'Follow'}
//               style={{
//                 fontWeight: 600,
//                 color: 'var(--color-text-blue)',
//                 backgroundColor: 'transparent',
//               }}
//               onClick={handleClickToFollow}
//             />
//           )}
//         </div>
//       </div>

//       <div className={styles.imgPost}>
//         <img src={item.image} alt="Post Image" className={styles.postImage} />
//       </div>

//       <div className={styles.bottomBlock}>
//         <div className={styles.actions}>
//           <FaHeart
//             className={`${styles.likeIcon} ${isLiked ? styles.liked : styles.unliked}`}
//             onClick={e => {
//               e.stopPropagation();
//               handleLike();
//             }}
//             size={20}
//           />
//           <span className={styles.likesCount}>{likesCount} likes</span>
//           <FaRegComment className="text-gray-500" size={20} />
//         </div>
//         <span>
//           <span className="font-semibold italic">{authorName}</span>: {item.description}
//         </span>
//       </div>

//       <div className={styles.commentsContainer}>
//         {/* В новом интерфейсе нет last_comment — показываем плейсхолдер и счётчик, если есть */}
//         <span>Add a comment...</span>
//         <span className={styles.commentText}>
//           View all comments ({item.commentsCount ?? 0})
//         </span>
//       </div>
//     </li>
//   );
// };

// export default PostItem;


// type Post = {
//   _id: string;
//   user_id: string | { _id: string }; // Учитываем возможный объект
//   image_url: string;
//   caption: string;
//   created_at: string;
//   user_name: string;
//   profile_image: string;
//   likes_count?: number;
//   comments_count?: number;
//   last_comment?: string;
// };

// type PostItemProps = {
//   item: Post;
//   likesCount: number;
//   setLikesCount: (postId: string, newCount: number) => void;
//   onClick: () => void;
//   listFollowing: string[] | null;
//   handleRemoveSomeFollow: (arg0: string) => void;
//   handleAddSomeFollow: (arg0: string) => void;
// };

// const PostItem: React.FC<PostItemProps> = ({
//   item,
//   likesCount,
//   setLikesCount,
//   onClick,
//   listFollowing,
//   handleAddSomeFollow,
//   handleRemoveSomeFollow,
// }) => {
//   const [isLiked, setIsLiked] = useState(false);
//   const currentUser = useSelector((state: RootState) => state.auth.user);
//   const { _id } = currentUser || {};
//   const userId =
//     typeof item.user_id === 'string' ? item.user_id : item.user_id?._id || ''; // Проверяем и извлекаем userId

//   const [isFollowing, setIsFollowing] = useState<boolean | null>(null);

//   // Проверяем наличие текущего пользователя
//   if (!currentUser) {
//     console.error('Current user not found');
//     return null; // Можно вернуть сообщение или компонент загрузки
//   }
//   if (userId === _id) {
//     return null;
//   }
//   // Проверяем, лайкнут ли пост текущим пользователем
//   useEffect(() => {
//     const fetchLikedStatus = async () => {
//       try {
//         const response = await $api.get(`/likes/user/${_id}`);
//         const userLikes = response.data; // Получаем список лайкнутых постов
//         if (userLikes.includes(item._id)) {
//           setIsLiked(true);
//         }
//       } catch (error) {
//         console.error('Ошибка при загрузке статуса лайка:', error);
//       }
//     };

//     fetchLikedStatus();
//   }, [item._id, _id]);

//   // Проверяем, подписан ли текущий пользователь на автора поста
//   useEffect(() => {
//     if (listFollowing && userId) {
//       setIsFollowing(listFollowing.includes(userId));
//     }
//   }, [_id, userId, listFollowing]);

//   // Обработчик лайков
//   // const handleLike = async () => {
//   //   try {
//   //     if (isLiked) {
//   //       await $api.delete(`/likes/${item._id}/${_id}`);
//   //       setLikesCount(item._id, likesCount - 1);
//   //     } else {
//   //       await $api.post(`/likes/${item._id}/${_id}`);
//   //       setLikesCount(item._id, likesCount + 1);
//   //     }
//   //     setIsLiked(!isLiked);
//   //   } catch (error) {
//   //     console.error('Ошибка при изменении лайка:', error);
//   //   }
//   // };
//   // 
// const handleLike = async () => {
//   try {
//     await $api.post(`/likes/post/${item._id}`); // toggle на бэке
//     // оптимистично меняем флаг и счётчик
//     setIsLiked((prev) => !prev);
//     setLikesCount(item._id, isLiked ? likesCount - 1 : likesCount + 1);
//   } catch (error) {
//     console.error('Ошибка при изменении лайка:', error);
//   }
// };

//   // Обработчик подписки
//   const handleFollow = async () => {
//     if (!_id || !userId) {
//       console.error(
//         'Не удалось выполнить подписку: отсутствует _id или userId',
//       );
//       return;
//     }

//     try {
//       const response = await $api.post(`/follow/${_id}/follow/${userId}`);
//       if (response.status === 201) {
//         setIsFollowing(true);
//       }
//       handleAddSomeFollow(userId);
//     } catch (error) {
//       console.error('Ошибка при подписке:', error);
//     }
//   };

//   // Обработчик отписки
//   const handleUnfollow = async () => {
//     if (!_id || !userId) {
//       console.error('Не удалось выполнить отписку: отсутствует _id или userId');
//       return;
//     }

//     try {
//       const response = await $api.delete(`/follow/${userId}/unfollow/${_id}`);
//       if (response.status === 200) {
//         setIsFollowing(false);
//       }

//       handleRemoveSomeFollow(userId);
//     } catch (error) {
//       console.error('Ошибка при отписке:', error);
//     }
//   };

//   const handleClickToFollow = (e: MouseEvent<HTMLButtonElement>) => {
//     e.stopPropagation();
//     if (isFollowing) {
//       handleUnfollow();
//     } else {
//       handleFollow();
//     }
//   };

//   return (
//     <li
//       className={styles.postItem}
//       onClick={onClick}
//       style={{ cursor: 'pointer' }}
//     >
//       <div className={styles.header}>
//         <div className={styles.avatarContainer}>
//           <img
//             src={item.profile_image || profilePlaceholder}
//             alt="profileImage"
//             className={styles.avatar}
//           />
//         </div>
//         <div className={styles.userInfo}>
//           <span className={styles.userName}>{item.user_name}</span>
//           <span className={styles.greytext}>
//             &#8226; {parseData(item.created_at)} &#8226;
//           </span>
//           {isFollowing !== null && (
//             <CustomButton
//               text={
//                 isFollowing
//                   ? 'otherProfile.unfollow'
//                   : 'otherProfile.follow'
//               }
//               style={{
//                 fontWeight: 600,
//                 color: 'var( --color-text-blue)',
//                 backgroundColor: 'transparent',
//               }}
//               onClick={handleClickToFollow}
//             />
//           )}
//         </div>
//       </div>
//       <div className={styles.imgPost}>
//         <img
//           src={item.image_url}
//           alt="Post Image"
//           className={styles.postImage}
//         />
//       </div>
//       <div className={styles.bottomBlock}>
//         <div className={styles.actions}>
//           <FaHeart
//             className={`${styles.likeIcon} ${
//               isLiked ? styles.liked : styles.unliked
//             }`}
//             onClick={e => {
//               e.stopPropagation();
//               handleLike();
//             }}
//             size={20}
//           />
//           <span className={styles.likesCount}>{likesCount} likes</span>
//           <FaRegComment className="text-gray-500" size={20} />
//         </div>
//         <span>
//           <span className="font-semibold italic">{item.user_name}</span>:
//           {item.caption}
//         </span>
//       </div>
//       <div className={styles.commentsContainer}>
//         <span>{item.last_comment || 'Add a comment...'}</span>
//         <span className={styles.commentText}>
//           View all comments ({item.comments_count})
//         </span>
//       </div>
//     </li>
//   );
// };

// export default PostItem;
