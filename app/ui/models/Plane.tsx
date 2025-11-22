import React, { useEffect, useRef, useState } from 'react';
import { useAnimations, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSound } from '@/app/lib/contexts/SoundContext';

interface PlaneProps {
  planePosition: [number, number, number];
  planeScale: [number, number, number];
  isRotating: boolean;
  rotation: [number, number, number];
  rotationDirection: number;
}

const Plane: React.FC<PlaneProps> = ({
  planePosition,
  planeScale,
  isRotating,
  rotation,
  rotationDirection,
}) => {
  const ref = useRef<THREE.Mesh>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { isEnabled } = useSound();
  const { scene, animations } = useGLTF('/for-public-page/plane.glb');
  const { actions } = useAnimations(animations, ref);

  // Track current and target rotation for smooth interpolation
  const [currentRotationY, setCurrentRotationY] = useState(rotation[1]);
  const targetRotationY = useRef(rotation[1]);

  useEffect(() => {
    if (isRotating) {
      actions['Take 001']?.play();

      // Play propeller sound starting from 2 seconds into the audio file (if sound is enabled)
      if (isEnabled) {
        if (!audioRef.current) {
          audioRef.current = new Audio('/sounds/effects/propeller.m4a');
          audioRef.current.loop = true;
          audioRef.current.volume = 0.5;
        }
        audioRef.current.currentTime = 2;
        audioRef.current.play().catch((error) => {
          console.log('Propeller sound autoplay prevented:', error);
        });
      }
    } else {
      actions['Take 001']?.stop();

      // Stop propeller sound
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [isRotating, actions, isEnabled]);

  // Handle sound enable/disable while animation is playing
  useEffect(() => {
    if (!audioRef.current || !isRotating) return;

    if (isEnabled) {
      audioRef.current.play().catch((error) => {
        console.log('Propeller sound autoplay prevented:', error);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isEnabled, isRotating]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Update target rotation based on direction
  useEffect(() => {
    // When direction is negative (counter-clockwise), plane keeps original rotation (flying forward)
    // When direction is positive (clockwise), plane rotates 180° (flying backward)
    targetRotationY.current = rotationDirection < 0 ? rotation[1] : rotation[1] + Math.PI;
  }, [rotationDirection, rotation]);

  // Smooth rotation interpolation
  useFrame(() => {
    if (ref.current) {
      const lerpSpeed = 0.1; // Adjust this value for faster/slower rotation (0.1 = smooth, 0.3 = faster)

      // Calculate the shortest path between current and target rotation
      let diff = targetRotationY.current - currentRotationY;

      // Normalize the difference to be between -PI and PI for shortest rotation path
      while (diff > Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;

      const newRotationY = currentRotationY + diff * lerpSpeed;
      setCurrentRotationY(newRotationY);

      ref.current.rotation.y = newRotationY;
    }
  });

  return (
    <mesh
      position={planePosition}
      scale={planeScale}
      rotation={[rotation[0], currentRotationY, rotation[2]]}
      ref={ref}
    >
      <primitive object={scene} />
    </mesh>
  );
};

export default Plane;
