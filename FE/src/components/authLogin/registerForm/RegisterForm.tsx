import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { $api } from '../../../api/api';
import CustomButton from '../../ui/customButton/CustomButton';
import CustomInput from '../../ui/customInput/CustomInput';
import styles from './registerForm.module.css';
import logo from '../../../assets/logo-ichgram.svg';


export const RegisterForm = () => {
  const navigate = useNavigate();

  const [userObject, setUserObject] = useState({
    email: '',
    password: '',
    username: '',
    fullName: '',
  });

  const [error, setError] = useState({
    email: '',
    username: '',
    general: '',
  });

  const handleInputChange = (field: keyof typeof userObject) => (value: string) => {
    setUserObject(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({ email: '', username: '', general: '' });

    try {
      const response = await $api.post('/auth/register', userObject);
      if (response.status === 201) {
        navigate('/');
      }
    } catch (e: any) {
      console.error('Registration error:', e);
      if (e.response) {
        const errorData = e.response.data;
        if (e.response.status === 400) {
          setError(prev => ({
            ...prev,
            email: errorData.errors?.email || '',
            username: errorData.errors?.username || '',
            general: !errorData.errors ? errorData.message : '',
          }));
        } else {
          setError(prev => ({ ...prev, general: 'Unexpected error occurred' })); 
        }
      } else {
        setError(prev => ({ ...prev, general: 'Unexpected error occurred' })); 
      }
    }
  };

  return (
    <div className={styles.registerFormBox}>
      <form className={styles.registerForm} onSubmit={handleSubmit}>
        <img src={logo} alt="logo" />
        <h4>Sign up</h4>
        <CustomInput
          placeholder={'Email'} 
          value={userObject.email}
          onChange={handleInputChange('email')}
          type="email"
          style={{ paddingLeft: '8px', backgroundColor: '#FAFAFA', color: '#737373' }}
        />
        {error.email && <p className={styles.errorMessage}>{error.email}</p>}
        <CustomInput
          placeholder={'Full name'} 
          value={userObject.fullName}
          onChange={handleInputChange('fullName')}
          type="text"
          style={{ paddingLeft: '8px', backgroundColor: '#FAFAFA', color: '#737373', marginTop: '6px' }}
        />
        <CustomInput
          placeholder={'Username'} 
          value={userObject.username}
          onChange={handleInputChange('username')}
          type="text"
          style={{ paddingLeft: '8px', backgroundColor: '#FAFAFA', color: '#737373', marginTop: '6px' }}
        />
        {error.username && <p className={styles.errorMessage}>{error.username}</p>}
        <CustomInput
          placeholder={'Password'} 
          value={userObject.password}
          onChange={handleInputChange('password')}
          type="password"
          style={{ paddingLeft: '8px', backgroundColor: '#FAFAFA', color: '#737373', marginTop: '6px' }}
        />
        {error.general && <p className={styles.errorMessage}>{error.general}</p>}
        <p className={styles.registerForm_p1}>
          By signing up, you agree to our <span className={styles.agreementLink}>Terms</span> and acknowledge our{' '}
          <span className={styles.agreementLink}>Privacy Policy</span>. 
        </p>
        <p className={styles.registerForm_p2}>
          Read more about our <span className={styles.agreementLink}>Terms</span>,{' '}
          <span className={styles.agreementLink}>Privacy Policy</span>,{' '}
          <span className={styles.agreementLink}>Cookies Policy</span>.
        </p>
        <CustomButton style={{ width: '268px', height: '32px' }} text={'Sign up'} type="submit" /> 
      </form>
      <div className={styles.haveAccountBox}>
        <p>
          Already have an account? 
          <Link to={'/'} style={{ color: 'var(--color-text-blue)', fontWeight: 600 }}>
            Log in 
          </Link>
        </p>
      </div>
    </div>
  );
};
