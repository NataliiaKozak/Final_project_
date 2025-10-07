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
  showError?: boolean; // Сделайте это свойство необязательным
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
        value={value} // Используем переданное значение напрямую
        onChange={handleInputChange} // Используем переданный обработчик
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
