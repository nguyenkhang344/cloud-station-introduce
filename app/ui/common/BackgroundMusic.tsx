'use client';

import { useEffect, useRef } from 'react';
import { useSound } from '@/app/lib/contexts/SoundContext';

interface BackgroundMusicProps {
  isLoading: boolean;
  musicPath?: string;
}

const BackgroundMusic = ({ isLoading, musicPath = '/sounds/musics/piano 02 ill leave the light on.ogg' }: BackgroundMusicProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasPlayedRef = useRef(false);
  const { isEnabled } = useSound();

  const fadeIn = (duration: number = 5000) => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const startTime = Date.now();
    const maxVolume = 0.5; // 50%

    audio.volume = 0;

    const animateFadeIn = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      audio.volume = progress * maxVolume;

      if (progress < 1) {
        requestAnimationFrame(animateFadeIn);
      }
    };

    animateFadeIn();
  };

  const fadeOut = (duration: number = 5000) => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const startTime = Date.now();
    const startVolume = audio.volume;

    const animateFadeOut = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      audio.volume = startVolume * (1 - progress);

      if (progress < 1) {
        requestAnimationFrame(animateFadeOut);
      } else {
        audio.pause();
        audio.volume = 0.5;
      }
    };

    animateFadeOut();
  };

  useEffect(() => {
    // Expose fade functions to window for cleanup
    (window as any).__fadeOutMusic = fadeOut;

    return () => {
      delete (window as any).__fadeOutMusic;
    };
  }, []);

  useEffect(() => {
    // Play music when loading is complete and user interacts
    const handleUserInteraction = () => {
      if (audioRef.current && !isLoading && !hasPlayedRef.current && isEnabled) {
        hasPlayedRef.current = true;

        // Set volume to 0 before playing to prevent loud initial sound
        audioRef.current.volume = 0;

        audioRef.current.play().catch(() => {
          // Ignore autoplay prevented errors
        });

        // Start fade in animation after a short delay
        setTimeout(() => {
          fadeIn(5000);
        }, 100);
      }
      // Remove listeners after first interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    // Add listeners for user interaction (mouse, touch, and keyboard)
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [isLoading, isEnabled]);

  // Handle sound enable/disable
  useEffect(() => {
    if (!audioRef.current) return;

    if (isEnabled && hasPlayedRef.current) {
      // Resume music if it was playing before
      audioRef.current.play().catch(() => {
        // Ignore autoplay prevented errors
      });
    } else {
      // Pause music when sound is disabled
      audioRef.current.pause();
    }
  }, [isEnabled]);

  return (
    <audio
      ref={audioRef}
      src={musicPath}
      loop
      style={{ display: 'none' }}
    />
  );
};

export default BackgroundMusic;
