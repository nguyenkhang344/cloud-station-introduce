'use client';

import React from 'react';
import { useTouchDevice } from '../../lib/hooks/useTouchDevice';

interface TutorialBubbleProps {
  screenPosition: { x: number; y: number; z?: number } | null;
  text: string;
  isVisible?: boolean;
}

const TutorialBubble: React.FC<TutorialBubbleProps> = ({
  screenPosition,
  text,
  isVisible = true,
}) => {
  const { isTouchDevice, mounted } = useTouchDevice();

  if (!mounted || !isVisible || !screenPosition) return null;

  // Determine text based on device type
  const displayText = isTouchDevice ? 'Tap on a hill' : text;

  return (
    <div
      style={{
        position: 'fixed',
        left: `${screenPosition.x}px`,
        top: `${screenPosition.y}px`,
        transform: 'translate(-70%, -100%)',
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      <div style={{ position: 'relative', width: 'fit-content' }}>
        <div
          style={{
            position: 'relative',
            width: 'fit-content',
            borderRadius: '16px',
            padding: '8px 24px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            zIndex: 10,
          }}
        >
          {/* Text content */}
          <p
            style={{
              fontSize: '0.9375rem',
              fontWeight: '600',
              color: '#ffffff',
              margin: 0,
              lineHeight: '1.4',
              whiteSpace: 'nowrap',
            }}
          >
            {displayText}
          </p>
        </div>

        {/* Chat Bubble pointer */}
        <svg
          width="30"
          height="30"
          viewBox="0 0 30 30"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            bottom: '-15px',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        >
          <path
            d="M 0 0 L 15 30 L 30 0 Z"
            fill="rgba(255, 255, 255, 0.1)"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1"
          />
        </svg>
      </div>
    </div>
  );
};

export default TutorialBubble;
