import styles from './resetForm.module.css';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { $api } from '../../../api/api';
import CustomButton from '../../ui/customButton/CustomButton';
import CustomInput from '../../ui/customInput/CustomInput';
import trouble from '../../../assets/trouble_logging _in.svg';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

type ForgotResp = { message: string; token?: string }; // В DEV бэк может вернуть token
type ApiErr = { message?: string };

export const ResetForm = () => {
  const [email, setEmail] = useState('');
  const [devToken, setDevToken] = useState(''); // если пришёл токен из DEV-окружения — положим сюда
  const [tokenInput, setTokenInput] = useState(''); // пользователю ввести токен (из письма или devToken)
  const [newPassword, setNewPassword] = useState('');
  const [stage, setStage] = useState<'request' | 'reset'>('request');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRequestReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      // БЭК: POST /auth/forgot-password  { email }
      const { data } = await $api.post<ForgotResp>('/auth/forgot-password', { email });
      // В DEV сервер может вернуть token в ответе → сохраним и покажем второй шаг
      if (data.token) setDevToken(data.token);
      setStage('reset');
    } catch (err: unknown) {
      console.error('Ошибка при запросе сброса:', err);
      if (isAxiosError<ApiErr>(err)) {
        setError(err.response?.data?.message ?? 'Error requesting reset');
      } else {
        setError('Error requesting reset');
      }
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const token = tokenInput || devToken; // приоритет — то, что ввёл пользователь
    if (!token) {
      setError('Reset token is required (check your email)');
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    try {
      // БЭК: POST /auth/reset-password  { token, newPassword }
      const { data } = await $api.post<{ message: string }>('/auth/reset-password', {
        token,
        newPassword,
      });
      alert(data.message || 'Password updated successfully');
      // очистка формы и возврат на первый шаг
      setStage('request');
      setDevToken('');
      setTokenInput('');
      setNewPassword('');
      setEmail('');
    } catch (err: unknown) {
      console.error('Ошибка при обновлении пароля:', err);
      if (isAxiosError<ApiErr>(err)) {
        setError(err.response?.data?.message ?? 'Error updating password');
      } else {
        setError('Error updating password');
      }
    }
  };

  return (
    <div className={styles.resetFormBox}>
      <form
        className={styles.resetForm}
        onSubmit={stage === 'request' ? handleRequestReset : handleResetPassword}
      >
        <img src={trouble} alt="logo" />
        <h5>Trouble logging in?</h5>

        {stage === 'request' ? (
          <>
            <p className={styles.instruction}>
              Enter your email and we'll send you a link (token) to reset your password.
            </p>

            <CustomInput
              placeholder="Enter your email"
              value={email}
              onChange={setEmail}
              type="email"
              style={{
                paddingLeft: '8px',
                backgroundColor: 'var(--color-bg-light-grey)',
                color: 'var(--color-text-grey)',
              }}
            />

            {error && <p className={styles.errorMessage}>{error}</p>}

            <CustomButton
              text="Reset password"
              style={{ width: '268px', height: '32px' }}
              type="submit"
            />
          </>
        ) : (
          <>
            <p className={styles.instruction}>
              Enter the reset token from your email and your new password.
            </p>

            {/* В DEV token может вернуться в ответе — можно показать подсказку: */}
            {devToken && (
              <p className={styles.devHint}>
                DEV token: <code>{devToken}</code>
              </p>
            )}

            <CustomInput
              placeholder="Enter reset token"
              value={tokenInput}
              onChange={setTokenInput}
              type="text"
              style={{
                paddingLeft: '8px',
                backgroundColor: 'var(--color-bg-light-grey)',
                color: 'var(--color-text-grey)',
                marginBottom: '6px',
              }}
            />

            <div className={styles.passwordContainer}>
              <CustomInput
                placeholder="Enter new password"
                value={newPassword}
                onChange={setNewPassword}
                type={showPassword ? 'text' : 'password'}
                style={{
                  paddingLeft: '8px',
                  backgroundColor: 'var(--color-bg-light-grey)',
                  color: 'var(--color-text-grey)',
                  marginTop: '6px',
                }}
              />
              <span
                className={styles.eyeIcon}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
              </span>
            </div>

            {error && <p className={styles.errorMessage}>{error}</p>}

            <CustomButton
              text="Save new password"
              style={{ width: '268px', height: '32px' }}
              type="submit"
            />
          </>
        )}

        <div className={styles.lineBox}>
          <div className={styles.line}></div>
          <p>OR</p>
          <div className={styles.line}></div>
        </div>

        <Link to={'/register'} className={styles.createAccount}>
          Create new account
        </Link>
        <div className={styles.back}>
          <Link
            to={'/'}
            style={{ color: 'var(--color-text-dark)', fontWeight: 600 }}
          >
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
};



// import styles from './resetForm.module.css';
// import { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { $api } from '../../../api/api';
// import CustomButton from '../../ui/customButton/CustomButton';
// import CustomInput from '../../ui/customInput/CustomInput';
// import trouble from '../../../assets/trouble_logging _in.svg';
// import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

// export const ResetForm = () => {
//   const [userObject, setUserObject] = useState({
//     email: '',
//     password: '',
//     username: '',
//     fullName: '',
//   });

//   const [isPasswordReset, setIsPasswordReset] = useState(false);
//   const [newPassword, setNewPassword] = useState('');
//   const [error, setError] = useState('');
//   const [showPassword, setShowPassword] = useState(false);

//   const handleInputChange = (field: string, value: string) => {
//     setUserObject((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const handleCheckUser = async (e) => {
//     e.preventDefault();
//     setError('');
//     try {
//       const response = await $api.post('/auth/check-user', {
//         email: userObject.email,
//       });
//       if (response.status === 200) {
//         setIsPasswordReset(true);
//       } else {
//         setError('User not found');
//       }
//     } catch (error) {
//       console.error('Ошибка при проверке пользователя:', error);
//       setError('Error checking user');
//     }
//   };

//   const handleUpdatePassword = async (e) => {
//     //any!!
//     e.preventDefault();
//     setError('');
//     try {
//       const response = await $api.post('/auth/update-password', {
//         email: userObject.email,
//         newPassword,
//       });
//       if (response.status === 200) {
//         alert('Password updated successfully');
//         setIsPasswordReset(false);
//         setNewPassword('');
//       } else {
//         setError('Error updating password');
//       }
//     } catch (error) {
//       console.error('Ошибка при обновлении пароля:', error);
//       setError('Error updating password');
//     }
//   };

//   return (
//     <div className={styles.resetFormBox}>
//       <form
//         className={styles.resetForm}
//         onSubmit={isPasswordReset ? handleUpdatePassword : handleCheckUser}
//       >
//         <img src={trouble} alt="logo" />
//         <h5>Trouble logging in?</h5>
//         <p className={styles.instruction}>
//           Enter your email and we'll send you a link to get back into your
//           account.
//         </p>

//         <CustomInput
//           placeholder="Enter your email"
//           value={userObject.email}
//           onChange={(value) => handleInputChange('email', value)}
//           type="email"
//           style={{
//             paddingLeft: '8px',
//             backgroundColor: 'var(--color-bg-light-grey)',
//             color: 'var(--color-text-grey)',
//           }}
//         />

//         {isPasswordReset && (
//           <div className={styles.passwordContainer}>
//             <CustomInput
//               placeholder="Enter new password"
//               value={newPassword}
//               onChange={setNewPassword}
//               type={showPassword ? 'text' : 'password'}
//               style={{
//                 paddingLeft: '8px',
//                 backgroundColor: 'var(--color-bg-light-grey)',
//                 color: 'var(--color-text-grey)',
//                 marginTop: '6px',
//               }}
//             />
//             <span
//               className={styles.eyeIcon}
//               onClick={() => setShowPassword(!showPassword)}
//             >
//               {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
//             </span>
//           </div>
//         )}

//         {error && <p className={styles.errorMessage}>{error}</p>}

//         <CustomButton
//           text={isPasswordReset ? 'Save new password' : 'Reset password'}
//           style={{ width: '268px', height: '32px' }}
//           type="submit"
//         />

//         <div className={styles.lineBox}>
//           <div className={styles.line}></div>
//           <p>OR</p>
//           <div className={styles.line}></div>
//         </div>

//         <Link to={'/register'} className={styles.createAccount}>
//           Create new account
//         </Link>
//         <div className={styles.back}>
//           <Link
//             to={'/'}
//             style={{ color: 'var(--color-text-dark)', fontWeight: 600 }}
//           >
//             Back to Login
//           </Link>
//         </div>
//       </form>
//     </div>
//   );
// };