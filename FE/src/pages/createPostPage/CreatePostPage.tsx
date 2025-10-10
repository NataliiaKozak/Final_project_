import React from 'react';
import { ImageForm } from '../../components/create/imageForm/ImageForm';
import styles from './CreatePostPage.module.css';

const CreatePostPage: React.FC = () => {
  return (
    <div className={styles.createPostPage}>
      <h1 className={styles.createPostTitle}>Create new post</h1>
      <ImageForm closeModal={() => {}}/> 
    </div>
  );
};


export default CreatePostPage;
