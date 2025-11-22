'use client';

import React from 'react';
import { ArrowUturnLeftIcon } from '@heroicons/react/24/solid';

interface ExitZoomButtonProps {
  isVisible: boolean;
  onClick?: () => void;
  className?: string;
}

const ExitZoomButton: React.FC<ExitZoomButtonProps> = ({ isVisible, onClick, className = '' }) => {
  if (!isVisible) return null;

  return (
    <button
      onClick={onClick}
      className={`
        btn btn-lg btn-circle
        bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 hover:border-white/50
        transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl
        text-white hover:text-white
        ${className}
      `}
      aria-label="Exit zoom mode"
    >
      <ArrowUturnLeftIcon className="h-6 w-6" />
    </button>
  );
};

export default ExitZoomButton;
