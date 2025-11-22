import { useState, useEffect } from 'react';

export const useTouchDevice = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Multiple detection methods for reliability
    const touchSupported =
      navigator.maxTouchPoints > 0 ||
      matchMedia('(pointer:coarse)').matches;

    setIsTouchDevice(touchSupported);
  }, []);

  return { isTouchDevice, mounted };
};
