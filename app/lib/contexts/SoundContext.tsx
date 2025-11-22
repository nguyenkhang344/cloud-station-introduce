'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SoundContextType {
  isEnabled: boolean;
  toggleSound: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Load sound preference from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const savedPreference = localStorage.getItem('soundEnabled');
    if (savedPreference !== null) {
      setIsEnabled(JSON.parse(savedPreference));
    }
  }, []);

  const toggleSound = () => {
    setIsEnabled((prev) => {
      const newValue = !prev;
      localStorage.setItem('soundEnabled', JSON.stringify(newValue));
      return newValue;
    });
  };

  // Prevent rendering until client is mounted
  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <SoundContext.Provider value={{ isEnabled, toggleSound }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    // During SSR/prerendering, return a default value instead of throwing
    return { isEnabled: true, toggleSound: () => {} };
  }
  return context;
};
