'use client';

import React from 'react';
import Link from 'next/link';
import { HomeIcon } from '@heroicons/react/24/solid';

interface HomeButtonProps {
  isVisible?: boolean;
  className?: string;
}

const HomeButton: React.FC<HomeButtonProps> = ({ isVisible = true, className = '' }) => {
  if (!isVisible) return null;

  return (
    <Link href="/">
      <button
        className={`
          fixed bottom-8 right-8 z-50
          btn btn-lg btn-circle
          bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 hover:border-white/50
          transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl
          text-white hover:text-white
          ${className}
        `}
        aria-label="Return to home"
      >
        <HomeIcon className="h-6 w-6" />
      </button>
    </Link>
  );
};

export default HomeButton;
