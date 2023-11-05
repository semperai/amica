import { useEffect, useRef } from 'react';
import styles from './flexTextarea.module.css';
interface FlexTextareaProps {
  value?: string;
  onChange?: (value: string) => void;
}

const FlexTextarea: React.FC<FlexTextareaProps> = ({ value = "", onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dummyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleInput = (e: Event) => {
      const event = e as unknown as React.ChangeEvent<HTMLTextAreaElement>;
      const inputValue = event.target.value;
      if (dummyRef.current) {
        dummyRef.current.textContent = inputValue + '\u200b';
      }
      if (onChange) {
        onChange(inputValue);
      }
    };

    const handleCompositionEnd = (e: CompositionEvent) => {
      const event = e.target as HTMLTextAreaElement;
      const inputValue = event.value;
      if (dummyRef.current) {
        dummyRef.current.textContent = inputValue + '\u200b';
      }
      if (onChange) {
        onChange(inputValue);
      }
    };

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('input', handleInput);
      textarea.addEventListener('compositionend', handleCompositionEnd);

      // Set the default value in the dummy div and textarea
      if (value) {
        if (dummyRef.current) {
          dummyRef.current.textContent = value + '\u200b';
        }
        textarea.value = value;
      }

      // Clean up function
      return () => {
        textarea.removeEventListener('input', handleInput);
        textarea.removeEventListener('compositionend', handleCompositionEnd);
      }
    }
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.value = value;
    }
    if (dummyRef.current) {
      dummyRef.current.textContent = value + '\u200b';
    }
  }, [value]);

  return (
    <div className={styles.FlexTextarea}>
      <div className={styles.FlexTextarea__dummy} ref={dummyRef} aria-hidden="true"></div>
      <textarea className={styles.FlexTextarea__textarea} ref={textareaRef}></textarea>
    </div>
  );
}

export default FlexTextarea;
