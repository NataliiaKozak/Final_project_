import React from 'react';
import styles from './CreateContent.module.css';
import { ImageForm } from '../../../create/imageForm/ImageForm';

const CreateContent: React.FC = () => {
  return (
    <div className={styles.greateContainer}>
      <div className={styles.createHeader}>
        <h3>Create new post</h3>
        <a href="#">Share</a>
      </div>
      <div className={styles.createBox}>
        <div className={styles.createBoxLeft}></div>
        <div className={styles.createBoxRight}>
          <div className={styles.createBoxRightDescription}></div>
          <div className={styles.createBoxRightBottom}></div>
          <ImageForm closeModal={() => {}}/>
        </div>
      </div>
    </div>
  );
};

export default CreateContent;
