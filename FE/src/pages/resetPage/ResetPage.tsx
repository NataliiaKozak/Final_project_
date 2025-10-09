import { ResetForm } from '../../components/auth/resetForm/ResetForm';
import styles from './resetPage.module.css';

export const ResetPage = () => {
  return (
    <div className={styles.resetPage}>
      <ResetForm />
    </div>
  );
};
