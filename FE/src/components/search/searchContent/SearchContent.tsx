import styles from './searchContent.module.css';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../redux/store';
import { searchUsers } from '../../../redux/slices/searchSlice';
import CustomInput from '../../ui/customInput/CustomInput';
import { useNavigate } from 'react-router-dom';
import profilePlaceholder from '../../../assets/profile-placeholder.svg';

function SearchContent() {
  const dispatch = useDispatch<AppDispatch>();
  const [query, setQuery] = useState('');
  const results = useSelector((state: RootState) => state.search.results);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    dispatch(searchUsers(q));
  }, [dispatch, query]);

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className={styles.searchContent}>
      <h3>Search</h3>
      <div className={styles.searchContent_inputBox}>
        <CustomInput
          type="text"
          placeholder="Search users…"
          value={query}
          onChange={(value) => setQuery(value)}
          style={{ background: 'var(--color-bg-dark-grey)' }}
        />
      </div>
      <h5>Recent</h5>
      <div className={styles.searchContent_list}>
        {results && results.length > 0 ? (
          results.map((user) => (
            <div
              key={user._id}
              className={styles.searchContent_listImage}
              onClick={() => handleUserClick(user._id)}
            >
              <img src={user.profileImage || profilePlaceholder} alt={user.username} />
              <h6>{user.username}</h6>
            </div>
          ))
        ) : (
          <p>No users found</p>
        )}
      </div>
    </div>
  );
}

export default SearchContent;


