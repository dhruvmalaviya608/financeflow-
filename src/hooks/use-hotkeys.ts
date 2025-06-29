
'use client';

import { useEffect, useCallback } from 'react';

type Hotkey = {
  keys: string[];
  callback: (event: KeyboardEvent) => void;
  preventDefault?: boolean;
};

export function useHotkeys(hotkeys: Hotkey[], dependencies: any[] = []) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      // Ignore hotkeys if the user is typing in an input, textarea, or a content-editable element
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
        target.isContentEditable
      ) {
        // Allow Ctrl+S to work in textareas for saving notes
        const isSaveShortcut = hotkey.keys.includes('s') && (event.ctrlKey || event.metaKey);
        if (target.tagName === 'TEXTAREA' && isSaveShortcut) {
            // continue
        } else {
            return;
        }
      }

      for (const hotkey of hotkeys) {
        const { keys, callback, preventDefault = true } = hotkey;

        const allKeysPressed = keys.every((key) => {
          if (key.toLowerCase() === 'ctrl') return event.ctrlKey || event.metaKey;
          if (key.toLowerCase() === 'shift') return event.shiftKey;
          if (key.toLowerCase() === 'alt') return event.altKey;
          return event.key.toLowerCase() === key.toLowerCase();
        });

        if (allKeysPressed) {
          if (preventDefault) {
            event.preventDefault();
          }
          callback(event);
          return; // Stop after first match to prevent multiple triggers
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hotkeys, ...dependencies]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
