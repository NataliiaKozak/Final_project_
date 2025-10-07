import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import CustomButton from '../../ui/customButton/CustomButton';
import CustomInput from '../../ui/customInput/CustomInput';
import { setUser } from '../../../redux/slices/authSlice';
import { $api } from '../../../api/api';
import logo from '../../assets/logo-ichgram.svg';
import styles from './loginForm.module.css';

export const LoginForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [userObject, setUserObject] = useState({ email: '', password: '' });
  const [showEmailError, setShowEmailError] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange =
    (field: keyof typeof userObject) => (value: string) => {
      setUserObject(prev => ({ ...prev, [field]: value }));
    };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let hasError = false;

    if (userObject.email === '') {
      setShowEmailError(true);
      setEmailErrorMessage('Email is required'); 
      hasError = true;
    } else if (!validateEmail(userObject.email)) {
      setShowEmailError(true);
      setEmailErrorMessage('Invalid email format'); 
      hasError = true;
    } else {
      setShowEmailError(false);
      setEmailErrorMessage('');
    }

    if (userObject.password === '') {
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

    if (!hasError) {
      setIsSubmitting(true);
      setAuthError('');

      try {
        const response = await $api.post('/auth/login', userObject);
        const { token, user } = response.data;

        if (token) {
          dispatch(setUser({ token, user }));
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          navigate('/home');
        } else {
          setAuthError('Invalid credentials'); 
        }
      } catch (error) {
        console.error('Login error:', error);
        setAuthError('Invalid email or password'); 
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className={styles.loginFormBox}>
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <img src={logo} alt="logo" />
        <CustomInput
          placeholder={'Email'}
          value={userObject.email}
          onChange={handleInputChange('email')}
          type="email"
          style={{ paddingLeft: '8px', backgroundColor: 'var(--color-bg-light-grey)', color: 'var(--color-text-grey)' }}
          showError={showEmailError}
          errorMessage={emailErrorMessage}
        />
        <div className={styles.passwordContainer}>
          <CustomInput
            placeholder={'Password'} 
            value={userObject.password}
            onChange={handleInputChange('password')}
            type={showPassword ? 'text' : 'password'}
            style={{
              paddingLeft: '8px',
              backgroundColor: 'var(--color-bg-light-grey)',
              color: 'var(--color-text-grey)',
              margin: '7px 0 15px',
            }}
            showError={showPasswordError}
            errorMessage={passwordErrorMessage}
          />
          <span className={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
          </span>
        </div>
        <CustomButton text={'Log in'} type="submit" style={{ width: '268px', height: '32px' }} disabled={isSubmitting} /> {/* [i18n removed] 11 */}
        {authError && <div className={styles.errorMessage}>{authError}</div>}
        <div className={styles.lineBox}>
          <div className={styles.line}></div>
          <p>or</p> 
          <div className={styles.line}></div>
        </div>
        <Link to={'/reset'} className={styles.forgotPasswordLink}>
          Forgot password?
        </Link>
      </form>
      <div className={styles.haveAccountBox}>
        <p>
          Don’t have an account? 
          <Link to={'/register'} style={{ color: 'var(--color-text-blue)', fontWeight: 600 }}>
            Sign up 
          </Link>
        </p>
      </div>
    </div>
  );
};
