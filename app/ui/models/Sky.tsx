import React from 'react';
import { useGLTF } from '@react-three/drei';

// Suppress warnings from THREE.js and auto-scroll behavior
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const message = String(args[0]);
    // Suppress KHR_materials_pbrSpecularGlossiness warning
    if (message.includes('Unknown extension')) return;
    // Suppress Skipping auto-scroll behavior warning
    if (message.includes('Skipping auto-scroll behavior')) return;
    originalWarn(...args);
  };
}

const Sky = () => {
  const sky = useGLTF('/for-public-page/sky.glb');
  return (
    <mesh >
      <primitive object={sky.scene}  />
    </mesh>
  );
};

export default Sky;
