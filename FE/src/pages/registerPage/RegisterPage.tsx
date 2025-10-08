import { RegisterForm } from '../../components/authLogin/registerForm/RegisterForm';
import styles from './registerPage.module.css';

export const RegisterPage = () => {
  return (
    <div className={styles.registerPage}>
      <RegisterForm />
    </div>
  );
};
