import { useState, useEffect } from 'react';
import styles from './loginPage.module.css';
import { LoginForm } from '../../molecules/loginForm/LoginForm';

import phoneFrame from '../../assets/loginScreen/phone.png';
import screen1 from '../../assets/loginScreen/screenshot1.png';
import screen2 from '../../assets/loginScreen/screenshot2.png';
import screen3 from '../../assets/loginScreen/screenshot3.png';
import screen4 from '../../assets/loginScreen/screenshot4.png';

export const LoginPage = () => {
  const screenshots = [screen1, screen2, screen3, screen4];
  const [currentScreenshot, setCurrentScreenshot] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScreenshot(prev => (prev + 1) % screenshots.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.loginPage}>
      <div className={styles.phoneContainer}>
        <img src={phoneFrame} alt="phone frame" className={styles.phoneFrame} />
        <div className={styles.screen}>
          <img
            key={currentScreenshot}
            src={screenshots[currentScreenshot]}
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
