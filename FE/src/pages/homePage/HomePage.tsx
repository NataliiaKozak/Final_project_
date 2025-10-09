import React from 'react';
import HomePagePosts from '../../components/home/homePagePosts/HomePagePosts';
import styles from './HomePage.module.css';
import allUpdates from '../../assets/allUdate.png';

const HomePage: React.FC = () => {
  return (
    <div className={styles.homepagepost}>
      <div className={styles.homepagepostWrapper}>
        <HomePagePosts />
      </div>
      <div className={styles.allUpdates}>
        <img src={allUpdates} alt="All updates" />
        <p className={styles.allUpBig}>You've seen all the updates</p>
        <p className={styles.allUpSmall}>
          You have viewed all new publications
        </p>
      </div>
    </div>
  );
};

export default HomePage;
