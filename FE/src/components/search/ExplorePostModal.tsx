// мы используем ту же модалку PostModal.
// Если оставить «прослойку» — она просто прокидывает пост дальше:

import React from 'react';
import type { PostPreview } from '../../interfaces/post.interface';
import styles from './ExplorePostModal.module.css';

interface ExplorePostModalProps {
  post: PostPreview;          // <-- принимаем превью
  isOpen: boolean;
  onClose: () => void;
}

const ExplorePostModal: React.FC<ExplorePostModalProps> = ({ post, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>

        <div className={styles.imageBox}>
          <img src={post.image} alt="post" className={styles.image} />
        </div>

        <div className={styles.meta}>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ExplorePostModal;

// import React from 'react';
// import PostModal from '../../components/posts/postModal/PostModal';
// import type { RootState } from '../../redux/store';

// type PostEntity = RootState['posts']['posts'][number];

// interface ExplorePostModalProps {
//   post: PostEntity;
//   isOpen: boolean;
//   onClose: () => void;
//   onRefetch: () => void;
// }

// const ExplorePostModal: React.FC<ExplorePostModalProps> = ({ post, isOpen, onClose, onRefetch }) => {
//   if (!isOpen) return null;

//   return (
//     <PostModal
//       post={{
//         _id: post._id,
//         image: post.image,
//         description: post.description,
//         createdAt: post.createdAt,
//         author: typeof post.author === 'string' ? post.author : {
//           _id: post.author._id,
//           username: post.author.username,
//           profileImage: post.author.profileImage,
//           fullName: post.author.fullName,
//         },
//         likesCount: post.likesCount,
//         commentsCount: post.commentsCount,
//       }}
//       onClose={onClose}
//       onUpdatePosts={onRefetch}
//     />
//   );
// };

// export default ExplorePostModal;

// import React from 'react';
// import HomePagePostModal from '../../components/home/homePagePosts/HomePagePosts';
// import type { RootState } from '../../redux/store';
// // Совместимо с HomePagePostModal: image_url, caption и т.д.
// type PostEntity = RootState['posts']['posts'][number];

// interface ExplorePostModalProps {
//   post: PostEntity;
//   isOpen: boolean;
//   onClose: () => void;
// }

// const ExplorePostModal: React.FC<ExplorePostModalProps> = ({ post, isOpen, onClose }) => {
//   if (!isOpen) return null;
//   return <HomePagePostModal post={post} onClose={onClose} />;
// };

// export default ExplorePostModal;


// interface ExplorePostModalProps {
//   post: any; // Данные поста
//   isOpen: boolean; // Состояние открытия модалки
//   onClose: () => void; // Функция закрытия модалки
// }

// const ExplorePostModal: React.FC<ExplorePostModalProps> = ({ post, isOpen, onClose }) => {
//   if (!isOpen) return null;

//   return <HomePagePostModal post={post} onClose={onClose} />;
// };

// export default ExplorePostModal;
