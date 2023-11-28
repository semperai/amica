import { useEffect } from 'react';

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  ctrlKey = false
) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === key && event.ctrlKey === ctrlKey) {
        callback();
      }
    };

    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, []);
};
