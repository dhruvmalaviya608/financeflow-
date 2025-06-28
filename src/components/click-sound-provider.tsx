'use client';

import { useEffect, useRef } from 'react';

export function ClickSoundProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // This effect runs once on the client to initialize the Audio object.
    // Place your sound file at the path below.
    audioRef.current = new Audio('/sounds/click.mp3');
  }, []);

  useEffect(() => {
    const playSound = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Check if the clicked element or its parent is a button or a menu item.
      const isClickable = target.closest(
        'button, [role="button"], [role="menuitem"], [role="option"], [role="tab"], [role="checkbox"]'
      );

      if (isClickable && audioRef.current) {
        // Clone the audio node to allow for rapid, overlapping plays
        const soundToPlay = audioRef.current.cloneNode() as HTMLAudioElement;
        soundToPlay.play().catch(error => {
          // Autoplay was prevented. This is a common browser policy.
          // The user must interact with the document first.
          console.log("Sound playback was prevented by the browser.");
        });
      }
    };

    document.addEventListener('click', playSound);

    return () => {
      document.removeEventListener('click', playSound);
    };
  }, []);

  return <>{children}</>;
}
