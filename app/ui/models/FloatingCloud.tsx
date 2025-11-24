'use client';

import { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import gsap from 'gsap';
import * as THREE from 'three';

interface FloatingCloudProps {
  shouldAnimate: boolean;
  onAnimationComplete?: () => void;
}

export function FloatingCloud({ shouldAnimate, onAnimationComplete }: FloatingCloudProps) {
  const { scene } = useGLTF('/for-public-page/cloud.glb');
  const groupRef = useRef<THREE.Group>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (shouldAnimate && !hasAnimated.current && groupRef.current) {
      hasAnimated.current = true;

      // Reset position before animation
      groupRef.current.position.y = -6  ;
      groupRef.current.position.x = 0;
      groupRef.current.position.z = 2;

      // Animate cloud floating up from bottom to center
      gsap.to(groupRef.current.position, {
        y: -2,
        duration: 2,
        ease: 'power2.inOut',
        onComplete: () => {
          onAnimationComplete?.();
        },
      });

      // Add subtle floating animation after it reaches center
      gsap.to(groupRef.current.position, {
        y: -2.1,
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

  if (!shouldAnimate) return null;

  return (
    <group ref={groupRef} position={[0, -10, 0]} scale={[0.5, 0.5, 0.5]}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload('/for-public-page/cloud.glb');
