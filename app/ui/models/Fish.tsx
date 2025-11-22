import React, { useEffect, useRef, useState } from 'react';
import { useAnimations, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { useSound } from '@/app/lib/contexts/SoundContext';

interface FishProps {
  fishPosition: [number, number, number];
  fishScale: [number, number, number];
  rotation: [number, number, number];
  animationName?: string;
  targetPosition?: [number, number, number];
  animationDuration?: number;
  bezierConfig?: { x: number; y: number; z: number };
  onAnimationComplete?: () => void;
  hillName?: string; // e.g., "hill1" -> reads from fish1 in JSON
  isExiting?: boolean;
  onExitComplete?: () => void;
}

const Fish: React.FC<FishProps> = ({
  fishPosition,
  fishScale,
  rotation,
  animationName = 'take_swim',
  targetPosition,
  animationDuration = 3,
  bezierConfig,
  onAnimationComplete,
  hillName,
  isExiting = false,
  onExitComplete,
}) => {
  const [fishData, setFishData] = useState<{ pos: [number, number, number]; rotation: [number, number, number] } | null>(null);
  const ref = useRef<THREE.Group>(null);
  const lineRef = useRef<THREE.Line>(null) as React.MutableRefObject<THREE.Line | null>;
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const { scene, animations } = useGLTF('/3d/landing-page/cloud_station/showing_fish.glb');
  const { actions } = useAnimations(animations, ref);
  const gsapTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const currentPositionRef = useRef({ x: fishPosition[0], y: fishPosition[1], z: fishPosition[2] });
  const pathPointsRef = useRef<THREE.Vector3[]>([]);
  const tangentRef = useRef(new THREE.Vector3(0, 0, 1));
  const onAnimationCompleteRef = useRef(onAnimationComplete);
  const swimSoundRef = useRef<HTMLAudioElement | null>(null);
  const fadeOutTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isEnabled: isSoundEnabled } = useSound();

  // Fade out swim sound
  const fadeOutSwimSound = (duration: number = 500) => {
    if (!swimSoundRef.current) return;

    const audio = swimSoundRef.current;
    const startVolume = audio.volume;
    const startTime = Date.now();

    const animateFadeOut = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      audio.volume = startVolume * (1 - progress);

      if (progress < 1) {
        requestAnimationFrame(animateFadeOut);
      } else {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0.8; // Reset to original volume
      }
    };

    animateFadeOut();
  };

  // Load fish data from camera_scene_pos.json based on hillName
  useEffect(() => {
    if (!hillName) return;

    const loadFishData = async () => {
      try {
        const response = await fetch('/3d/landing-page/cloud_station/camera_scene_pos.json');
        const data = await response.json();

        // Convert hill name to fish key (hill1 -> fish1)
        const fishKey = `fish${hillName.replace(/\D/g, '')}`; // Extract number from hillName
        const fishDataFromJson = data[fishKey];

        if (fishDataFromJson) {
          setFishData({
            pos: [
              parseFloat(fishDataFromJson.pos.x),
              parseFloat(fishDataFromJson.pos.y),
              parseFloat(fishDataFromJson.pos.z),
            ],
            rotation: [
              parseFloat(fishDataFromJson.rotation.x),
              parseFloat(fishDataFromJson.rotation.y),
              parseFloat(fishDataFromJson.rotation.z),
            ],
          });
        }
      } catch (error) {
        console.error('Failed to load fish data:', error);
      }
    };

    loadFishData();
  }, [hillName]);

  // Update spawn position when fishPosition changes
  useEffect(() => {
    currentPositionRef.current = {
      x: fishPosition[0],
      y: fishPosition[1],
      z: fishPosition[2],
    };
  }, [fishPosition]);

  // Update ref when onAnimationComplete changes (for useEffect to use latest version)
  useEffect(() => {
    onAnimationCompleteRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  // Initialize swim sound
  useEffect(() => {
    swimSoundRef.current = new Audio('/sounds/effects/fish_swim.mp3');
    swimSoundRef.current.volume = 0.8;
    swimSoundRef.current.loop = true;

    return () => {
      // Clear fade out timeout if exists
      if (fadeOutTimeoutRef.current) {
        clearTimeout(fadeOutTimeoutRef.current);
      }
      if (swimSoundRef.current) {
        swimSoundRef.current.pause();
        swimSoundRef.current = null;
      }
    };
  }, []);

  // Play swimming animation
  useEffect(() => {
    if (actions[animationName]) {
      actions[animationName]?.play();
    }
  }, [actions, animationName]);

  // Handle exit animation when isExiting is true
  useEffect(() => {
    if (!isExiting || !ref.current) return;

    // Kill the swim animation timeline to stop any ongoing animations
    if (gsapTimelineRef.current) {
      gsapTimelineRef.current.kill();
    }

    // Play swim sound for exit animation
    if (swimSoundRef.current && isSoundEnabled) {
      swimSoundRef.current.currentTime = 0;
      swimSoundRef.current.play().catch((error) => {
        console.log('Fish exit swim sound play prevented:', error);
      });

      // Schedule fade out at (duration - 0.5s) = 0.5s
      const exitDuration = 1; // 1 second
      const fadeOutStartTime = (exitDuration - 0.5) * 1000; // 0.5s in milliseconds

      fadeOutTimeoutRef.current = setTimeout(() => {
        fadeOutSwimSound(500); // Fade out over 0.5s
      }, fadeOutStartTime);
    }

    // Store current rotation to keep it fixed during exit
    const exitStartRotation = ref.current.quaternion.clone();

    const exitTimeline = gsap.timeline({
      onComplete: () => {
        onExitComplete?.();
      },
    });

    // Use fishData position (where fish arrived) for accurate exit start position
    const startX = fishData?.pos ? fishData.pos[0] : currentPositionRef.current.x;
    const startY = fishData?.pos ? fishData.pos[1] : currentPositionRef.current.y;
    const startZ = fishData?.pos ? fishData.pos[2] : currentPositionRef.current.z;

    // Exit position: move 10 units in negative X direction
    const exitPos = {
      x: startX - 15,
      y: startY,
      z: startZ,
    };

    // Create exit animation object
    const exitAnimObj = {
      x: startX,
      y: startY,
      z: startZ,
    };

    // Animate exit movement
    exitTimeline.to(exitAnimObj, {
      x: exitPos.x,
      y: exitPos.y,
      z: exitPos.z,
      duration: 1,
      ease: 'power2.in',
      onUpdate: () => {
        if (ref.current) {
          ref.current.position.set(
            exitAnimObj.x,
            exitAnimObj.y,
            exitAnimObj.z
          );
          // Keep rotation fixed during exit
          ref.current.quaternion.copy(exitStartRotation);
        }
      },
    }, 0);

    return () => {
      exitTimeline.kill();
      // Clear fade out timeout if exists
      if (fadeOutTimeoutRef.current) {
        clearTimeout(fadeOutTimeoutRef.current);
        fadeOutTimeoutRef.current = null;
      }
      // Stop sound when exit animation is cleaned up
      if (swimSoundRef.current) {
        swimSoundRef.current.pause();
        swimSoundRef.current.volume = 0.8; // Reset volume
      }
    };
  }, [isExiting, onExitComplete, fishData, isSoundEnabled]);

  // Update line geometry on each frame
  useFrame(() => {
    if (geometryRef.current && pathPointsRef.current.length > 0) {
      // Create new position attribute
      const positions = new Float32Array(
        pathPointsRef.current.flatMap((p) => [p.x, p.y, p.z])
      );

      // Remove old position attribute if exists
      if (geometryRef.current.getAttribute('position')) {
        geometryRef.current.deleteAttribute('position');
      }

      // Add new position attribute
      const positionAttribute = new THREE.BufferAttribute(positions, 3);
      geometryRef.current.setAttribute('position', positionAttribute);
    }
  });

  // Handle GSAP position animation with curved path
  useEffect(() => {
    // Use fishData if available, otherwise use targetPosition
    const finalTargetPosition = fishData?.pos || targetPosition;

    if (!ref.current || !finalTargetPosition) return;

    // Play swim sound for swim to hill animation
    if (swimSoundRef.current && isSoundEnabled) {
      swimSoundRef.current.currentTime = 0;
      swimSoundRef.current.play().catch((error) => {
        console.log('Fish swim sound play prevented:', error);
      });

      // Schedule fade out at (animationDuration - 0.5s)
      const fadeOutStartTime = (animationDuration - 0.5) * 1000; // Convert to milliseconds

      fadeOutTimeoutRef.current = setTimeout(() => {
        fadeOutSwimSound(500); // Fade out over 0.5s
      }, fadeOutStartTime);
    }

    // Create GSAP timeline for movement
    const timeline = gsap.timeline({
      onComplete: () => {
        // Call callback when animation completes (using ref to avoid dependency)
        onAnimationCompleteRef.current?.();
      },
    });

    gsapTimelineRef.current = timeline;

    // Calculate control point for bezier curve
    const startPos = { x: currentPositionRef.current.x  , y: currentPositionRef.current.y, z: currentPositionRef.current.z };
    const endPos = { x: finalTargetPosition[0] , y: finalTargetPosition[1] , z: finalTargetPosition[2] };

    // Arc distance scales with distance from center (X = 0)
    // X = 0 or X = -5: arc = 10 (maximum)
    // X = 5: arc = 2 (minimum)
    // Arc decreases only when X moves towards positive side
    const arcDistance = startPos.x > 0 ? Math.max(2, 10 - (startPos.x * 1.6)) : 10;

    // Midpoint with arc offset based on X position
    const midX = (startPos.x + endPos.x) / 2 + arcDistance;
    const midY = (startPos.y + endPos.y) / 2  + 2;
    const midZ = (startPos.z + endPos.z) / 2 ;

    // Reset path points
    pathPointsRef.current = [];

    // Create bezier path with control point
    timeline.to(currentPositionRef.current, {
      x: endPos.x,
      y: endPos.y,
      z: endPos.z,
      duration: animationDuration,
      ease: 'power1.inOut',
      // Use onUpdate to interpolate along bezier curve
      onUpdate: function() {
        if (!ref.current) return;
        // Get progress (0 to 1)
        const progress = this.progress();
        const t = progress;
        const mt = 1 - t;

        // Quadratic bezier formula: B(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2
        const mt2 = mt * mt;
        const t2 = t * t;
        const mt2t2 = 2 * mt * t;

        // Calculate bezier curve position
        currentPositionRef.current.x = mt2 * startPos.x + mt2t2 * midX + t2 * endPos.x;
        currentPositionRef.current.y = mt2 * startPos.y + mt2t2 * midY + t2 * endPos.y;
        currentPositionRef.current.z = mt2 * startPos.z + mt2t2 * midZ + t2 * endPos.z;

        ref.current.position.set(
          currentPositionRef.current.x,
          currentPositionRef.current.y,
          currentPositionRef.current.z
        );

        // Hybrid rotation: 90% tangent-based, 10% transition to final rotation
        const transitionStartProgress = 0.75; // Start transition at 90%

        if (progress < transitionStartProgress) {
          // Phase 1: Use tangent-based rotation (0-90%)
          // Calculate tangent vector (derivative of bezier curve)
          // dB(t)/dt = 2(1-t)(P1-P0) + 2t(P2-P1)
          const tangentX = 2 * mt * (midX - startPos.x) + 2 * t * (endPos.x - midX);
          const tangentY = 2 * mt * (midY - startPos.y) + 2 * t * (endPos.y - midY);
          const tangentZ = 2 * mt * (midZ - startPos.z) + 2 * t * (endPos.z - midZ);

          tangentRef.current.set(tangentX, tangentY, tangentZ).normalize();

          // Calculate look-at target point (current position + tangent direction)
          const lookAtTarget = new THREE.Vector3(
            currentPositionRef.current.x + tangentRef.current.x,
            currentPositionRef.current.y + tangentRef.current.y,
            currentPositionRef.current.z + tangentRef.current.z
          );

          // Apply lookAt to orient fish along the path
          ref.current.lookAt(lookAtTarget);
        } else {
          // Phase 2: Transition from current tangent rotation to final rotation (90-100%)
          // Calculate final tangent at end position for smooth transition
          const finalT = 1.0;
          const finalMt = 1 - finalT;

          const finalTangentX = 2 * finalMt * (midX - startPos.x) + 2 * finalT * (endPos.x - midX);
          const finalTangentY = 2 * finalMt * (midY - startPos.y) + 2 * finalT * (endPos.y - midY);
          const finalTangentZ = 2 * finalMt * (midZ - startPos.z) + 2 * finalT * (endPos.z - midZ);

          const finalTangent = new THREE.Vector3(finalTangentX, finalTangentY, finalTangentZ).normalize();
          const finalLookAtTarget = new THREE.Vector3(
            endPos.x + finalTangent.x,
            endPos.y + finalTangent.y,
            endPos.z + finalTangent.z
          );

          // Interpolate between tangent-based rotation and final target rotation
          const transitionProgress = (progress - transitionStartProgress) / (1 - transitionStartProgress);

          // Get current rotation from tangent
          ref.current.lookAt(finalLookAtTarget);
          const tangentQuat = ref.current.quaternion.clone();

          // Get target rotation from JSON if available
          let targetQuat = new THREE.Quaternion();
          if (fishData?.rotation) {
            const targetEuler = new THREE.Euler(
              fishData.rotation[0],
              fishData.rotation[1],
              fishData.rotation[2],
              'XYZ'
            );
            targetQuat.setFromEuler(targetEuler);
          } else {
            targetQuat = tangentQuat.clone();
          }

          // SLERP between tangent rotation and target rotation
          tangentQuat.slerp(targetQuat, transitionProgress);
          ref.current.quaternion.copy(tangentQuat);
        }

        // Store path points for debug line
        pathPointsRef.current.push(
          new THREE.Vector3(
            currentPositionRef.current.x,
            currentPositionRef.current.y,
            currentPositionRef.current.z
          )
        );
      },
    }, 0);

    return () => {
      gsapTimelineRef.current?.kill();
      // Clear fade out timeout if exists
      if (fadeOutTimeoutRef.current) {
        clearTimeout(fadeOutTimeoutRef.current);
        fadeOutTimeoutRef.current = null;
      }
      // Stop sound when swim animation is cleaned up
      if (swimSoundRef.current) {
        swimSoundRef.current.pause();
        swimSoundRef.current.volume = 0.8; // Reset volume
      }
    };
  }, [fishData, targetPosition, animationDuration, bezierConfig, isSoundEnabled]);

  return (
    <>
      <group
        position={[currentPositionRef.current.x, currentPositionRef.current.y, currentPositionRef.current.z]}
        scale={fishScale}
        rotation={[rotation[0] , rotation[1], rotation[2]]}
        ref={ref}
      >
        <primitive object={scene} />
      </group>

      {/* Debug line showing swimming path */}
      <line ref={lineRef as any}>
        <bufferGeometry ref={geometryRef} />
        <lineBasicMaterial color={0xff0000} linewidth={2} />
      </line>
    </>
  );
};

export default Fish;
