import OtherProfile from '../../components/profiles/otherProfile/OtherProfile';
import PostsListOther from '../../components/posts/postsListOther/PostsListOther';
import styles from './otherProfilePage.module.css';

const OtherProfilePage: React.FC = () => {
  return (
    <div className={styles.profilePage}>
      <OtherProfile />
      <PostsListOther />
    </div>
  );
};

export default OtherProfilePage;
