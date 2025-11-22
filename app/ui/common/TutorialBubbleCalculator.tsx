'use client';

import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TutorialBubbleCalculatorProps {
  fishObjectName?: string;
  yOffset?: number; // Offset to move bubble higher/lower
  onPositionUpdate?: (position: { x: number; y: number; z: number }) => void;
}

const TutorialBubbleCalculator: React.FC<TutorialBubbleCalculatorProps> = ({
  fishObjectName = 'hill_1',
  yOffset = 1.5, // Default offset of 2 units up
  onPositionUpdate,
}) => {
  const { camera, size, scene } = useThree();
  const fishObjectRef = useRef<THREE.Object3D | null>(null);
  const vectorRef = useRef(new THREE.Vector3());

  // Find fish object in scene
  useEffect(() => {
    if (!scene) return;

    scene.traverse((object) => {
      if (object.name === fishObjectName) {
        fishObjectRef.current = object;
      }
    });
  }, [scene, fishObjectName]);

  useFrame(() => {
    if (!fishObjectRef.current) return;

    // Get world position of fish object
    fishObjectRef.current.getWorldPosition(vectorRef.current);

    // Apply Y offset to move bubble higher/lower
    vectorRef.current.y += yOffset;

    // Store original z for reference
    const fishWorldZ = vectorRef.current.z;

    // Project 3D position to 2D screen coordinates
    vectorRef.current.project(camera);

    // Convert from normalized device coordinates to screen pixels
    const x = (vectorRef.current.x * size.width) / 2 + size.width / 2;
    const y = -(vectorRef.current.y * size.height) / 2 + size.height / 2;

    onPositionUpdate?.({ x, y, z: fishWorldZ });
  });

  return null;
};

export default TutorialBubbleCalculator;
