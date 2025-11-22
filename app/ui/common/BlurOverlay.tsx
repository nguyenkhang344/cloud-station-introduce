'use client';

import React, { useEffect, useRef } from 'react';

interface BlurOverlayProps {
  isActive: boolean;
  duration?: number; // Duration in milliseconds
  onComplete?: () => void;
}

const BlurOverlay = ({ isActive, duration = 1000, onComplete }: BlurOverlayProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const overlay = overlayRef.current;
    if (!overlay) return;

    // Reset styles
    overlay.style.opacity = '0';
    overlay.style.backdropFilter = 'blur(0px)';
    overlay.style.display = 'block';

    // Trigger animation
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Blur animation: 0px to 15px
      const blurAmount = progress * 15;
      overlay.style.backdropFilter = `blur(${blurAmount}px)`;

      // Opacity animation: 0 to 1 (full white overlay)
      overlay.style.opacity = String(progress);

      // Background color fade to white - increase from 0.5 to 1
      overlay.style.backgroundColor = `rgba(255, 255, 255, ${0.5 + progress * 0.5})`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete
        onComplete?.();
      }
    };

    requestAnimationFrame(animate);
  }, [isActive, duration, onComplete]);

  if (!isActive) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 pointer-events-none"
      style={{
        opacity: 0,
        backgroundColor: 'rgba(255, 255, 255, 0)',
        backdropFilter: 'blur(0px)',
      }}
    />
  );
};

export default BlurOverlay;
