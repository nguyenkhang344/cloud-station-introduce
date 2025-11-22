'use client';

import { MdMusicNote, MdMusicOff } from 'react-icons/md';
import { useSound } from '@/app/lib/contexts/SoundContext';
import { liquidGlassStyle } from '@/app/lib/utils';

interface SoundToggleProps {
  className?: string;
}

const SoundToggle = ({ className = '' }: SoundToggleProps) => {
  const { isEnabled, toggleSound } = useSound();

  return (
    <button
      onClick={toggleSound}
      className={`fixed bottom-6 right-6 z-50 p-3 rounded-full text-gray-800 transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none ${className}`}
      style={{
        ...liquidGlassStyle,
        outline: 'none',
      }}
      aria-label={isEnabled ? 'Disable sound' : 'Enable sound'}
      title={isEnabled ? 'Disable sound' : 'Enable sound'}
    >
      {isEnabled ? (
        <MdMusicNote size={24} />
      ) : (
        <MdMusicOff size={24} />
      )}
    </button>
  );
};

export default SoundToggle;
