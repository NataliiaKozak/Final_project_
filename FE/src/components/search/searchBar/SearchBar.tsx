import CustomInput from '../../ui/customInput/CustomInput';
import styles from './searchBar.module.css';

const SearchBar = () => {
  return (
    <div className={styles.searchBar}>
      <div className={styles.searchBar_box}>
        <h3>Search</h3>
        <CustomInput
          placeholder="Search…"
          style={{ background: 'var(--color-bg-dark-grey)' }}
        />
        <h5>Recent</h5>
      </div>
    </div>
  );
};

export default SearchBar