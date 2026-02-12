import React, { CSSProperties } from 'react';
import styles from './customInput.module.css';

interface InputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  icon?: React.ReactNode;
  errorMessage?: string;
  type?: 'text' | 'password' | 'email';
  className?: string;
  style?: CSSProperties;
  showError?: boolean;
  onBlur?: () => void;
}

// Компонент CustomInput
const CustomInput: React.FC<InputProps> = ({
  placeholder = '',
  value = '',
  onChange,
  icon,
  errorMessage,
  type = 'text',
  className = '',
  style = {},
  onBlur,
}) => {
  // Обработчик изменений
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e.target.value);
  };

  // Класс для поля инпута с учетом ошибки
  const inputClass = `${styles.inputContainer} ${errorMessage ? styles.error : ''} ${className}`;

  return (
    <div className={inputClass}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onBlur={onBlur}
        className={styles.input}
        style={style}
      />
      {errorMessage && (
        <div className={styles.errorMessage}>{errorMessage}</div>
      )}
    </div>
  );
};

export default CustomInput;
