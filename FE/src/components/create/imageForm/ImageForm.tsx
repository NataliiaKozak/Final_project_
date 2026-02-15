import { useState, FormEvent, ChangeEvent, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../redux/hooks';
import styles from './ImageForm.module.css';
import { $api } from '../../../api/api';
import profilePlaceholder from '../../../assets/profile-placeholder.svg';
import placeCreate from '../../../assets/place-create.svg';
import EmojiPicker from '../../ui/emojiPicker/EmojiPicker';

const MAX_CHARS = 150;

interface ImageFormProps {
  closeModal: () => void;
}

export const ImageForm: React.FC<ImageFormProps> = ({ closeModal }) => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [filePath, setFilePath] = useState('');
  const [text, setText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [statusVisible, setStatusVisible] = useState(false);
  const objectUrlRef = useRef<string | null>(null);

  const currentUser = useAppSelector((s) => s.auth.user);

  // Clean up ObjectURL on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files?.[0]) {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const url = URL.createObjectURL(e.target.files[0]);
      objectUrlRef.current = url;
      setFile(e.target.files[0]);
      setFilePath(url);
    }
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!file) {
      setUploadStatus('Please upload image');
      setStatusVisible(true);
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    if (text.trim()) formData.append('description', text);

    setIsUploading(true);
    setUploadStatus('Loading...');
    setStatusVisible(true);

    try {
      await $api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadStatus('Posted successfully!');
      setStatusVisible(true);
      setText('');
      setFile(null);
      setFilePath('');
      setIsUploading(false);
      setTimeout(() => {
        closeModal();
        navigate('/profile');
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) console.error('Upload error:', err.message);
      setUploadStatus('Upload failed.');
      setStatusVisible(true);
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      {statusVisible && (
        <p
          className={`${styles.statusMessage} ${
            uploadStatus === 'Posted successfully!' ? styles.success : ''
          }`}
        >
          {uploadStatus}
        </p>
      )}
      <button type="submit" className={styles.submitButton} disabled={isUploading}>
        Share
      </button>
      <div className={styles.bred}>
        <div className={styles.fileInputContainer}>
          <label htmlFor="fileInput" className={styles.uploadLabel}>
            <img
              src={filePath || placeCreate}
              alt="Uploaded file"
              className={filePath ? styles.uploadIcon : styles.uploadIconPlaceholder}
            />
          </label>
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            className={styles.fileInput}
            onChange={handleFileChange}
          />
        </div>

        <div className={styles.box_fil}>
          {currentUser && (
            <div className={styles.header}>
              <span className={styles.placeholderImage}>
                <img
                  src={currentUser.profileImage || profilePlaceholder}
                  alt={currentUser.username}
                  className={styles.avatarImage}
                />
              </span>
              <span className={styles.username}>{currentUser.username}</span>
            </div>
          )}

          <textarea
            placeholder="Describe your post"
            value={text}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS) setText(e.target.value);
            }}
            maxLength={MAX_CHARS}
            rows={4}
            className={styles.textArea}
          />

          <div className={styles.divider} />

          <div className={styles.emojiRow}>
              <EmojiPicker
              onSelectEmoji={(emoji) => setText((prev) => (prev + emoji).slice(0, MAX_CHARS))}
              count={50}
              autoCloseMs={9000}
            />
            <span className={styles.charCounter}>{text.length}/{MAX_CHARS}</span>
          </div>
        </div>
      </div>
    </form>
  );
};
