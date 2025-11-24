'use client';

import { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import gsap from 'gsap';
import * as THREE from 'three';

interface FloatingCloudProps {
  shouldAnimate: boolean;
  onAnimationComplete?: () => void;
  shouldExit?: boolean;
}

export function FloatingCloud({ shouldAnimate, onAnimationComplete, shouldExit }: FloatingCloudProps) {
  const { scene } = useGLTF('/for-public-page/cloud.glb');
  const groupRef = useRef<THREE.Group>(null);
  const hasAnimated = useRef(false);
  const hasExited = useRef(false);

  useEffect(() => {
    if (shouldExit && !hasExited.current && groupRef.current) {
      hasExited.current = true;
      // Kill all running animations
      gsap.killTweensOf(groupRef.current.position);

      // Animate cloud flying up and out of screen
      gsap.to(groupRef.current.position, {
        y: 8,
        duration: 1.5,
        ease: 'power2.in',
        onComplete: () => {
          // Reset state for next animation
          hasAnimated.current = false;
          hasExited.current = false;
        },
      });
    }
  }, [shouldExit]);

  useEffect(() => {
    if (shouldAnimate && !hasAnimated.current && groupRef.current) {
      hasAnimated.current = true;

      // Reset position before animation
      groupRef.current.position.y = -6  ;
      groupRef.current.position.x = 0;
      groupRef.current.position.z = 2;

      // Animate cloud floating up from bottom to center
      gsap.to(groupRef.current.position, {
        y: -1.8,
        duration: 2,
        ease: 'power2.inOut',
        onComplete: () => {
          // Mark animation as complete
          (window as any).__setCloudAnimationComplete?.(true);
          onAnimationComplete?.();
        },
      });

      // Add subtle floating animation after it reaches center
      gsap.to(groupRef.current.position, {
        y: -1.84,
        duration: 2,
        delay: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }
  }, [shouldAnimate, onAnimationComplete]);

  // Add emission material to all meshes
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const material = child.material as THREE.Material;

        if (material instanceof THREE.MeshStandardMaterial) {
          material.emissive = new THREE.Color(0xffffff);
          material.emissiveIntensity = 0.4;
          material.toneMapped = false;
        } else if (material instanceof THREE.MeshPhongMaterial) {
          material.emissive = new THREE.Color(0xffffff);
          material.emissiveIntensity = 0.4;
        }
      }
    });
  }, [scene]);

  if (!shouldAnimate) {
    return null;
  }

  return (
    <group ref={groupRef} position={[0, -10, 0]} scale={[0.5, 0.5, 0.5]}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload('/for-public-page/cloud.glb');
