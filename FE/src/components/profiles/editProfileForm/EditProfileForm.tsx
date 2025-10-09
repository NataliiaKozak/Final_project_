//форма редактирования профиля
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import CustomButton from '../../ui/customButton/CustomButton';
import { setUser } from '../../../redux/slices/authSlice';
import { $api } from '../../../api/api';
import photoPlaceholder from '../../../assets/photo-placeholder.svg';
import { RootState } from '../../../redux/store';
import styles from './editProfileForm.module.css';

const EditProfileForm: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();

  const [username, setUsername] = useState(user?.username || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [charCount, setCharCount] = useState(bio.length);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('fullName', fullName);
      formData.append('website', website);
      formData.append('bio', bio);
      if (profileImageFile) formData.append('profileImage', profileImageFile);

      // БЭК: PUT /users (protect, upload.single('profileImage'))
      const { data } = await $api.put('/users', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      dispatch(
        setUser({
          token: localStorage.getItem('token') || '',
          user: data,
        })
      );
      localStorage.setItem('user', JSON.stringify(data));
      console.log('User updated successfully');
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBioChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newBio = event.target.value;
    setBio(newBio);
    setCharCount(newBio.length);
  };

  return (
    <form className={styles.editProfileForm} onSubmit={handleSubmit}>
      <h4>Edit profile</h4>

      <div className={styles.editProfileForm_imgForm}>
        <img
          src={profileImage || photoPlaceholder}
          alt="Profile"
          className={styles.profileImage}
        />
        <div className={styles.userInfo}>
          <p className={styles.username}>{username || 'Your username'}</p>
          <p className={styles.userBio}>{bio || 'About you'}</p>
        </div>
        <label className={styles.uploadButton}>
          New photo
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <label>
        Username
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={styles.inputField}
        />
      </label>

      <label>
        Full name
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={styles.inputField}
        />
      </label>

      <label>
        Website
        <input
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className={styles.inputField}
        />
      </label>

      <label>
        About
        <textarea
          value={bio}
          onChange={handleBioChange}
          className={styles.textareaField}
          maxLength={150}
        />
        <div className={styles.charCount}>{charCount} / 150</div>
      </label>

      <CustomButton text="Save" type="submit" className={styles.saveButton} />
    </form>
  );
};

export default EditProfileForm;

// const EditProfileForm: React.FC = () => {
//   const { t } = useTranslation();
//   const user = useSelector((state: RootState) => state.auth.user);
//   const dispatch = useDispatch();

//   const [username, setUsername] = useState(user?.username || '');
//   const [bioWebsite, setBioWebsite] = useState(user?.bio_website || '');
//   const [bio, setBio] = useState(user?.bio || '');
//   const [profileImage, setProfileImage] = useState(user?.profile_image || '');
//   const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
//   const [charCount, setCharCount] = useState(bio.length);

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();

//     try {
//       // Создаем объект FormData для отправки данных
//       const formData = new FormData();
//       formData.append('username', username);
//       formData.append('bio_website', bioWebsite);
//       formData.append('bio', bio);
//       if (profileImageFile) {
//         formData.append('profile_image', profileImageFile); // Добавляем файл только если он выбран
//       }

//       const response = await $api.put('/user/current', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       // Обновляем данные пользователя в Redux
//       dispatch(
//         setUser({
//           token: localStorage.getItem('token') || '',
//           user: response.data,
//         }),
//       );

//       // Обновляем LocalStorage
//       localStorage.setItem('user', JSON.stringify(response.data));
//       console.log('User updated successfully');
//     } catch (error) {
//       console.error('Error updating user profile:', error);
//     }
//   };

//   const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       setProfileImageFile(file); // Сохраняем файл для отправки
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setProfileImage(reader.result as string); // Отображаем превью изображения
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleBioChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
//     const newBio = event.target.value;
//     setBio(newBio);
//     setCharCount(newBio.length);
//   };

//   return (
//     <form className={styles.editProfileForm} onSubmit={handleSubmit}>
//       <h4>{t('editProfileForm.edit')}</h4>
//       <div className={styles.editProfileForm_imgForm}>
//         <img
//           src={profileImage || photoPlaceholder}
//           alt="Profile"
//           className={styles.profileImage}
//         />
//         <div className={styles.userInfo}>
//           <p className={styles.username}>
//             {username || t('editProfileForm.defaultUsername')}
//           </p>
//           <p className={styles.userBio}>
//             {bio || t('editProfileForm.defaultBio')}
//           </p>
//         </div>
//         <label className={styles.uploadButton}>
//           {t('editProfileForm.newPhoto')}
//           <input
//             type="file"
//             onChange={handleImageChange}
//             accept="image/*"
//             style={{ display: 'none' }}
//           />
//         </label>
//       </div>

//       <label>
//         {t('editProfileForm.username')}
//         <input
//           type="text"
//           value={username}
//           onChange={e => setUsername(e.target.value)}
//           className={styles.inputField}
//         />
//       </label>

//       <label>
//         {t('editProfileForm.website')}

//         <input
//           type="url"
//           value={bioWebsite}
//           onChange={e => setBioWebsite(e.target.value)}
//           className={styles.inputField}
//         />
//       </label>

//       <label>
//         {t('editProfileForm.about')}
//         <textarea
//           value={bio}
//           onChange={handleBioChange}
//           className={styles.textareaField}
//           maxLength={150}
//         />
//         <div className={styles.charCount}>{charCount} / 150</div>
//       </label>

//       <CustomButton
//         text={t('editProfileForm.saveBtn')}
//         type="submit"
//         className={styles.saveButton}
//       />
//     </form>
//   );
// };

// export default EditProfileForm;
