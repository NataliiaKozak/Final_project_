import React, { useState, useCallback, useEffect, useRef } from 'react';
import styles from './EmojiPicker.module.css';

const EMOJI_AUTO_CLOSE_MS = 6000;
const DEFAULT_EMOJI_COUNT = 80;

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  count?: number;
  autoCloseMs?: number;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onSelectEmoji,
  count = DEFAULT_EMOJI_COUNT,
  autoCloseMs = EMOJI_AUTO_CLOSE_MS,
}) => {
  const [showEmojis, setShowEmojis] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emojis = Array.from({ length: count }, (_, i) =>
    String.fromCodePoint(0x1f600 + i),
  );

  const toggleEmojiPicker = useCallback(() => {
    setShowEmojis((prev) => {
      const next = !prev;
      if (next) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setShowEmojis(false), autoCloseMs);
      }
      return next;
    });
  }, [autoCloseMs]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className={styles.emojiDropdown}>
      <button type="button" className={styles.emojiButton} onClick={toggleEmojiPicker} aria-label="Open emoji picker">
        😊
      </button>
      {showEmojis && (
        <div className={styles.emojiList}>
          {emojis.map((emoji, i) => (
            <span
              key={i}
              role="button"
              tabIndex={0}
              className={styles.emojiItem}
              onClick={() => onSelectEmoji(emoji)}
            >
              {emoji}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(EmojiPicker);
