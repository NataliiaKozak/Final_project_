import React, { useEffect, useRef, useCallback } from 'react';
import styles from './customModal.module.css';

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: React.ReactNode;
  modalSize: 'default' | 'left' | 'large' | 'small';
}

const FOCUSABLE = 'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  content,
  modalSize,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;

    const prev = document.activeElement as HTMLElement | null;
    document.addEventListener('keydown', handleKeyDown);

    // Focus first focusable element inside modal
    requestAnimationFrame(() => {
      const el = modalRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      el?.focus();
    });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      prev?.focus();
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const getModalClass = () => {
    switch (modalSize) {
      case 'large':
        return styles.ModalLarge;
      case 'small':
        return styles.ModalSmall;
      case 'left':
        return styles.ModalLeft;
      default:
        return styles.ModalDefault;
    }
  };

  return (
    <div className={styles.Overlay} onClick={onClose}>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className={`${styles.Modal} ${getModalClass()}`}
        onClick={e => e.stopPropagation()}
      >
        <button className={styles.modalCloseButton} onClick={onClose} aria-label="Close modal">
          &times;
        </button>
        <div className={styles.modalContent}>{content}</div>
      </div>
    </div>
  );
};

export default CustomModal;
