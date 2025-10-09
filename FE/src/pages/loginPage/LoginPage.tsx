import styles from './loginPage.module.css';
import { LoginForm } from '../../components/auth/loginForm/LoginForm';

import phoneFrame from '../../assets/loginScreen/phone.png';
import screen1 from '../../assets/loginScreen/screenshot1.png';

export const LoginPage = () => {
  return (
    <div className={styles.loginPage}>
      <div className={styles.phoneContainer}>
        <img src={phoneFrame} alt="phone frame" className={styles.phoneFrame} />
        <div className={styles.screen}>
          <img
            src={screen1}
            alt="App Screenshot"
            className={styles.screenImage}
          />
        </div>
      </div>
      <div className={styles.loginFormBox}>
        <LoginForm />
      </div>
    </div>
  );
};
