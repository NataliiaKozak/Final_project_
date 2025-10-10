import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import CustomButton from '../../ui/customButton/CustomButton';
import CustomInput from '../../ui/customInput/CustomInput';
import { setUser } from '../../../redux/slices/authSlice';
import { $api } from '../../../api/api';
import logo from '../../../assets/logo-ichgram.svg';
import styles from './loginForm.module.css';

// payload, который ждёт бэк: /auth/login
type LoginPayload = { emailOrUsername: string; password: string };
// user, который возвращает бэк при логине/регистрации
type AuthUser = { _id: string; username: string; email: string; fullName: string; profileImage?: string };
type LoginResponse = { token: string; user: AuthUser };

export const LoginForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [userObject, setUserObject] = useState<LoginPayload>({ emailOrUsername: '', password: '' });
  const [showLoginError, setShowLoginError] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: keyof LoginPayload) => (value: string) =>
    setUserObject(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let hasError = false;
    if (!userObject.emailOrUsername.trim()) {
      setShowLoginError(true);
      setLoginErrorMessage('Username or Email is required');
      hasError = true;
    } else {
      setShowLoginError(false);
      setLoginErrorMessage('');
    }
    if (!userObject.password.trim()) {
      setShowPasswordError(true);
      setPasswordErrorMessage('Password is required');
      hasError = true;
    } else if (userObject.password.length < 4) {
      setShowPasswordError(true);
      setPasswordErrorMessage('Password must be at least 4 characters');
      hasError = true;
    } else {
      setShowPasswordError(false);
      setPasswordErrorMessage('');
    }
    if (hasError) return;

    setIsSubmitting(true);
    setAuthError('');
    try {
       //  POST /auth/login  { emailOrUsername, password }
      const { data } = await $api.post<LoginResponse>('/auth/login', userObject);
      const { token, user } = data;

      dispatch(setUser({ token, user })); //  setUser уже пишет в localStorage


      navigate('/home');
    } catch {
      setAuthError('Invalid username/email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.loginFormBox}>
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <img src={logo} alt="logo" />
        <CustomInput
          placeholder="Username or Email"
          value={userObject.emailOrUsername}
          onChange={handleInputChange('emailOrUsername')}
          type="text"
          style={{ paddingLeft: '8px', backgroundColor: 'var(--color-bg-light-grey)', color: 'var(--color-text-grey)' }}
          showError={showLoginError}
          errorMessage={loginErrorMessage}
        />
        <div className={styles.passwordContainer}>
          <CustomInput
            placeholder="Password"
            value={userObject.password}
            onChange={handleInputChange('password')}
            type={showPassword ? 'text' : 'password'}
            style={{ paddingLeft: '8px', backgroundColor: 'var(--color-bg-light-grey)', color: 'var(--color-text-grey)', margin: '7px 0 15px' }}
            showError={showPasswordError}
            errorMessage={passwordErrorMessage}
          />
          <span className={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
          </span>
        </div>
        <CustomButton text="Log in" type="submit" style={{ width: '268px', height: '32px' }} disabled={isSubmitting} />
        {authError && <div className={styles.errorMessage}>{authError}</div>}
        <div className={styles.lineBox}>
          <div className={styles.line}></div>
          <p>or</p>
          <div className={styles.line}></div>
        </div>
        <Link to="/reset" className={styles.forgotPasswordLink}>Forgot password?</Link>
      </form>
      <div className={styles.haveAccountBox}>
        <p>
          Don’t have an account?{' '}
          <Link to="/register" style={{ color: 'var(--color-text-blue)', fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

