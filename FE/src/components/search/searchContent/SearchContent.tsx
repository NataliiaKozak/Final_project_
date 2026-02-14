import styles from './searchContent.module.css';
import { useState, useEffect, useCallback } from 'react';
import { searchUsers } from '../../../redux/slices/searchSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import CustomInput from '../../ui/customInput/CustomInput';
import { useNavigate } from 'react-router-dom';
import profilePlaceholder from '../../../assets/profile-placeholder.svg';

const SEARCH_DEBOUNCE_MS = 300;

function SearchContent() {
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState('');
  const results = useAppSelector((s) => s.search.results);
  const authUser = useAppSelector((s) => s.auth.user);
  const filtered = results?.filter((u) => u._id !== authUser?._id) ?? [];
  const navigate = useNavigate();

  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    const timer = setTimeout(() => dispatch(searchUsers(q)), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [dispatch, query]);

  const handleUserClick = useCallback(
    (userId: string) => navigate(`/profile/${userId}`),
    [navigate],
  );

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
        {filtered.length > 0 ? (
          filtered.map((user) => (
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
