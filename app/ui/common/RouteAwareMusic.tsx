'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useSound } from '@/app/lib/contexts/SoundContext';

const ROUTE_MUSIC_MAP: Record<string, string> = {
  '/': '/sounds/musics/piano 02 ill leave the light on.ogg',
  '/cloud-station': '/sounds/musics/piano 01 walking on the ocean floor.ogg',
};

const RouteAwareMusic = () => {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasPlayedRef = useRef(false);
  const currentPathRef = useRef<string>('');
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

  const fadeOut = (duration: number = 2000): Promise<void> => {
    return new Promise((resolve) => {
      if (!audioRef.current) {
        resolve();
        return;
      }

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
          resolve();
        }
      };

      animateFadeOut();
    });
  };

  // Handle route changes
  useEffect(() => {
    const musicPath = ROUTE_MUSIC_MAP[pathname];

    // If no music configured for this route, fade out and stop
    if (!musicPath) {
      if (audioRef.current && !audioRef.current.paused) {
        fadeOut(2000);
      }
      return;
    }

    // If same route, no need to change
    if (currentPathRef.current === pathname) {
      return;
    }

    const switchMusic = async () => {
      if (audioRef.current) {
        // Fade out current music if playing
        if (!audioRef.current.paused) {
          await fadeOut(2000);
        }

        // Update source
        audioRef.current.src = musicPath;
        currentPathRef.current = pathname;

        // Play new music if enabled and user has interacted
        if (isEnabled && hasPlayedRef.current) {
          audioRef.current.volume = 0;
          audioRef.current.play().catch(() => {
            // Ignore autoplay prevented errors
          });
          fadeIn(5000);
        }
      }
    };

    switchMusic();
  }, [pathname, isEnabled]);

  // Initial user interaction handler
  useEffect(() => {
    const handleUserInteraction = () => {
      const musicPath = ROUTE_MUSIC_MAP[pathname];

      if (audioRef.current && musicPath && !hasPlayedRef.current && isEnabled) {
        hasPlayedRef.current = true;
        currentPathRef.current = pathname;

        // Set volume to 0 before playing to prevent loud initial sound
        audioRef.current.volume = 0;
        audioRef.current.src = musicPath;

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
  }, [pathname, isEnabled]);

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
      loop
      style={{ display: 'none' }}
    />
  );
};

export default RouteAwareMusic;
