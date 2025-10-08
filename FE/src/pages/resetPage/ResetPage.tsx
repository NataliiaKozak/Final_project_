import { ResetForm } from '../../components/authLogin/resetForm/ResetForm';
import styles from './resetPage.module.css';

export const ResetPage = () => {
  return (
    <div className={styles.resetPage}>
      <ResetForm />
    </div>
  );
};
