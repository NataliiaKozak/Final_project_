import { RegisterForm } from '../../molecules/registerForm/RegisterForm';
import styles from './registerPage.module.css';

export const RegisterPage = () => {
  return (
    <div className={styles.registerPage}>
      <RegisterForm />
    </div>
  );
};
