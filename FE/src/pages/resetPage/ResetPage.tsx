import { ResetForm } from '../../molecules/resetForm/ResetForm';
import styles from './restPage.module.css';

export const ResetPage = () => {
  return (
    <div className={styles.resetPage}>
      <ResetForm />
    </div>
  );
};
