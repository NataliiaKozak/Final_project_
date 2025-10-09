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
  const [searchPerson, setSearchPerson] = useState('');
  // const users = useSelector((state: RootState) => state.user.user || []);
  const results = useSelector((s: RootState) => s.search.results);
  const navigate = useNavigate();

  //был не тот импорт
  // useEffect(() => {
  //   dispatch(getAllUsers()); // если позже перейдём на searchSlice → здесь заменим
  // }, [dispatch]);

  // const filteredUsers = Array.isArray(users)
  //   ? users.filter((u) =>
  //       u.username.toLowerCase().includes(searchPerson.toLowerCase())
  //     )
  //   : [];

  //ругался на result
  // useEffect(() => {
  //   // простая реакция на ввод; если пусто — очищаем список
  //   if (searchPerson.trim().length > 0) {
  //     dispatch(searchUsers(searchPerson.trim()));
  //   }
  //   // опционально: else можно диспатчить clear()
  // }, [dispatch, searchPerson]);

  useEffect(() => {
    if (searchPerson.trim()) dispatch(searchUsers(searchPerson.trim()));
    // если нужно очищать при пустой строке — добавим clear() потом
  }, [dispatch, searchPerson]);

  const handleUserClick = (userId: string) => navigate(`/profile/${userId}`);

  //   return (
  //     <div className={styles.searchContent}>
  //       <h3>Search</h3>
  //       <div className={styles.searchContent_inputBox}>
  //         <CustomInput
  //           type="text"
  //           placeholder="Search"
  //           value={searchPerson}
  //           onChange={(value) => setSearchPerson(value)}
  //           style={{ background: 'var(--color-bg-dark-grey)' }}
  //         />
  //       </div>
  //       <h5>Recent</h5>
  //       <div className={styles.searchContent_list}>
  //         {filteredUsers && filteredUsers.length > 0 ? (
  //           filteredUsers.map((user) => (
  //             <div
  //               key={user._id}
  //               className={styles.searchContent_listImage}
  //               onClick={() => handleUserClick(user._id)}
  //             >
  //               <img
  //                 src={user.profileImage || profilePlaceholder}
  //                 alt={user.username}
  //               />
  //               <h6>{user.username}</h6>
  //             </div>
  //           ))
  //         ) : (
  //           <p>Sorry, no users was found</p>
  //         )}
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className={styles.searchContent}>
      <h3>Search</h3>
      <div className={styles.searchContent_inputBox}>
        <CustomInput
          type="text"
          placeholder="Search"
          value={searchPerson}
          onChange={(value) => setSearchPerson(value)}
          style={{ background: 'var(--color-bg-dark-grey)' }}
        />
      </div>
      <h5>Results</h5>
      <div className={styles.searchContent_list}>
        {results && results.length > 0 ? (
          results.map((user) => (
            <div
              key={user._id}
              className={styles.searchContent_listImage}
              onClick={() => handleUserClick(user._id)}
            >
              <img
                src={user.profileImage || profilePlaceholder}
                alt={user.username}
              />
              <h6>{user.username}</h6>
            </div>
          ))
        ) : (
          <p>Type to search users</p>
        )}
      </div>
    </div>
  );
}
export default SearchContent;
