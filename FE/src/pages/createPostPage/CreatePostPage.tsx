// import React from 'react';
// import { ImageForm } from '../../molecules/imageForm/ImageForm';
// import './CreatePostPage.module.css'; // Импорт стилей, если нужно

// const CreatePostPage: React.FC = () => {
//   return (
//     <div className="createPostPage">
//       <h1 className="createPostTitle">Create new post</h1>
//       <ImageForm />
//     </div>
//   );
// };

// export default CreatePostPage;

import React from 'react';
import { ImageForm } from '../../components/create/imageForm/ImageForm';
import styles from './CreatePostPage.module.css';

const CreatePostPage: React.FC = () => {
  return (
    <div className={styles.createPostPage}>
      <h1 className={styles.createPostTitle}>Create new post</h1>
      {/* {/* <ImageForm closeModal={() => {}} /> no-op, чтобы не ругался тип.  */}
      {/* сейчас проп не обязателен
      связано с components/create/imageForm/ImageForm.ts */}  */
      <ImageForm closeModal={() => {}}/> 
    </div>
  );
};


export default CreatePostPage;
