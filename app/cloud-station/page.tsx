'use client';

import Head from 'next/head';
import { useState, useCallback, useEffect, memo, useMemo, useRef, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import CloudStation from '../ui/models/CloudStation';
import Fish from '../ui/models/Fish';
import NextButton from '../ui/common/NextButton';
import HomeButton from '../ui/common/HomeButton';
import ExitZoomButton from '../ui/common/ExitZoomButton';
import HillInfo from '../ui/common/HillInfo';
import LoadingScreen from '../ui/common/LoadingScreen';
import TutorialBubbleCalculator from '../ui/common/TutorialBubbleCalculator';
import TutorialBubble from '../ui/common/TutorialBubble';
import InstructionCard from '../ui/common/InstructionCard';
import SoundToggle from '../ui/common/SoundToggle';
import gsap from 'gsap';

// Simple component to log camera position and rotation
const CameraLogger = () => {
  const { camera } = useThree();
  let logCount = 0;

  useFrame(() => {
    logCount++;
    if (logCount % 60 === 0) { // Log every 60 frames (~1 second at 60fps)
      const euler = camera.rotation;
      console.log('Camera:', {
        pos: {
          x: camera.position.x.toFixed(2),
          y: camera.position.y.toFixed(2),
          z: camera.position.z.toFixed(2),
        },
        rotation: {
          x: euler.x.toFixed(2),
          y: euler.y.toFixed(2),
          z: euler.z.toFixed(2),
        },
      });
    }
  });

  return null;
};

// Capture camera reference
interface CameraCaptureProps {
  onCameraCapture?: (camera: any) => void;
}

const CameraCapture = ({ onCameraCapture }: CameraCaptureProps) => {
  const { camera } = useThree();

  useEffect(() => {
    onCameraCapture?.(camera);
  }, [camera, onCameraCapture]);

  return null;
};

// Initialize camera target to sync with OrbitControls
interface CameraInitializerProps {
  orbitControlsRef: React.MutableRefObject<any>;
}

const CameraInitializer = ({ orbitControlsRef }: CameraInitializerProps) => {
  const { camera } = useThree();

  useEffect(() => {
    if (!orbitControlsRef.current) return;

    // Set camera target to origin (0, 0, 0)
    const targetPosition = new THREE.Vector3(0, 1, 0);

    // Sync OrbitControls target with camera lookAt
    orbitControlsRef.current.target.copy(targetPosition);
    orbitControlsRef.current.update();
  }, [orbitControlsRef]);

  return null;
};


interface SpawnedFish {
  id: string;
  fishPosition: [number, number, number];
  targetPosition: [number, number, number];
  targetRotation?: [number, number, number];
  isArrivedAtIsland?: boolean;
  hillName?: string;
}

const CloudStationContent = memo(({
  onIslandClick,
  fishList,
  onFishAnimationComplete,
  onCameraAnimationComplete,
  isExiting,
  lastFishId,
  onFishExitComplete,
  isAnimatingCamera,
  setIsAnimatingCamera,
  orbitControlsRef,
  onTutorialBubblePositionUpdate,
  cameraScenePos,
}: {
  onIslandClick: (targetPosition: [number, number, number], targetRotation: [number, number, number], hillKey: string) => void;
  fishList: SpawnedFish[];
  onFishAnimationComplete: (fishId: string, finalPosition: [number, number, number]) => void;
  onCameraAnimationComplete?: () => void;
  isExiting: boolean;
  lastFishId: string | null;
  onFishExitComplete: () => void;
  isAnimatingCamera: boolean;
  setIsAnimatingCamera: (value: boolean) => void;
  orbitControlsRef: React.MutableRefObject<any>;
  onTutorialBubblePositionUpdate?: (position: { x: number; y: number }) => void;
  cameraScenePos: Record<string, any> | null | undefined;
}) => {
  const { camera } = useThree();

  // Handle fish animation complete with camera zoom
  const handleFishComplete = useCallback(
    (fishId: string, finalPosition: [number, number, number]) => {
      // Get camera position and rotation from cameraScenePos based on the hill clicked
      // Find which hill the fish is at by matching the finalPosition
      let cameraPos = finalPosition; // fallback to final position
      let cameraRot = [0, 0, 0]; // fallback rotation

      if (cameraScenePos) {
        // Find the matching hill position from the JSON
        for (const [, hillData] of Object.entries(cameraScenePos)) {
          const hillPos: [number, number, number] = [
            parseFloat(hillData.pos.x),
            parseFloat(hillData.pos.y),
            parseFloat(hillData.pos.z),
          ];
          // Check if this hill position matches the final position
          if (
            Math.abs(hillPos[0] - finalPosition[0]) < 0.01 &&
            Math.abs(hillPos[1] - finalPosition[1]) < 0.01 &&
            Math.abs(hillPos[2] - finalPosition[2]) < 0.01
          ) {
            cameraPos = hillPos;
            cameraRot = [
              parseFloat(hillData.rotation.x),
              parseFloat(hillData.rotation.y),
              parseFloat(hillData.rotation.z),
            ];
            break;
          }
        }
      }

      const targetCameraPos = {
        x: cameraPos[0],
        y: cameraPos[1],
        z: cameraPos[2],
      };

      // Disable OrbitControls during animation
      setIsAnimatingCamera(true);

      // Animate both position and rotation
      gsap.to(camera.position, {
        x: targetCameraPos.x,
        y: targetCameraPos.y,
        z: targetCameraPos.z,
        duration: 1.5,
        ease: 'power2.inOut',
      });

      gsap.to(camera.rotation, {
        x: cameraRot[0],
        y: cameraRot[1],
        z: cameraRot[2],
        duration: 1.5,
        ease: 'power2.inOut',
        onComplete: () => {
          // Call parent callback to keep fish on island
          // Note: OrbitControls remains disabled until user clicks unlock button
          onFishAnimationComplete(fishId, finalPosition);
          // Call camera animation complete callback to show next button
          onCameraAnimationComplete?.();
        },
      });
    },
    [camera, onFishAnimationComplete, cameraScenePos, onCameraAnimationComplete, setIsAnimatingCamera]
  );

  const handleDisableOrbitControls = useCallback(() => {
    setIsAnimatingCamera(true);
  }, [setIsAnimatingCamera]);

  return (
    <>
      <CloudStation ref={orbitControlsRef} onIslandClick={onIslandClick} onDisableOrbitControls={handleDisableOrbitControls} cameraScenePos={cameraScenePos || undefined} isAnimatingCamera={isAnimatingCamera} />
      <CameraInitializer orbitControlsRef={orbitControlsRef} />
      {/* Tutorial bubble calculator - positioned at fish object */}
      {fishList.length === 0 && (
        <TutorialBubbleCalculator
          fishObjectName="hill_1"
          onPositionUpdate={onTutorialBubblePositionUpdate}
        />
      )}
      {/* Render fish components */}
      {fishList.map((fish) => (
        <Fish
          key={fish.id}
          fishPosition={fish.fishPosition}
          targetPosition={fish.targetPosition}
          fishScale={[1, 1, 1]}
          rotation={[0, 0, 0]}
          animationDuration={2}
          onAnimationComplete={() => handleFishComplete(fish.id, fish.targetPosition)}
          hillName={fish.hillName}
          isExiting={isExiting && fish.id === lastFishId}
          onExitComplete={onFishExitComplete}
        />
      ))}
    </>
  );
});

CloudStationContent.displayName = 'CloudStationContent';

const Page = () => {
  const [fishList, setFishList] = useState<SpawnedFish[]>([]);
  const [showNextButton, setShowNextButton] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [lastFishId, setLastFishId] = useState<string | null>(null);
  const [currentHillKey, setCurrentHillKey] = useState<string | null>(null);
  const [cameraScenePos, setCameraScenePos] = useState<Record<string, any> | null>(null);
  const [isZoomMode, setIsZoomMode] = useState(false);
  const [isAnimatingCamera, setIsAnimatingCamera] = useState(false);
  const [defaultCameraPos, setDefaultCameraPos] = useState<{ x: number; y: number; z: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tutorialBubblePosition, setTutorialBubblePosition] = useState<{ x: number; y: number; z?: number } | null>(null);
  const [hasUserClickedHill, setHasUserClickedHill] = useState(false);
  const [showInstructionCard, setShowInstructionCard] = useState(true);
  const exitTriggeredRef = useRef(false);
  const cameraRef = useRef<any>(null);
  const isExitingToHomeRef = useRef(false);

  // Load camera scene positions for auto-transition
  useEffect(() => {
    const loadCameraScenePos = async () => {
      try {
        const response = await fetch('/3d/landing-page/cloud_station/camera_scene_pos.json');
        const data = await response.json();
        setCameraScenePos(data);

        // Extract and store default camera position
        if (data.default_camera) {
          setDefaultCameraPos({
            x: parseFloat(data.default_camera.pos.x),
            y: parseFloat(data.default_camera.pos.y),
            z: parseFloat(data.default_camera.pos.z),
          });
        }
      } catch (error) {
        console.error('Failed to load camera scene positions:', error);
      }
    };
    loadCameraScenePos();
  }, []);

  const handleIslandClick = useCallback(
    (targetPosition: [number, number, number], targetRotation: [number, number, number], hillKey: string) => {
      // Mark that user has clicked a hill for the first time
      setHasUserClickedHill(true);

      // Reset button visibility when new island is clicked
      setShowNextButton(false);
      setCurrentHillKey(hillKey);
      const spawnPos: [number, number, number] = [
        cameraRef.current?.position.x || 0,
        cameraRef.current?.position.y || 0,
        cameraRef.current?.position.z  - 1.5|| 0,
      ];
      const newFish: SpawnedFish = {
        id: `fish-${Date.now()}`,
        fishPosition: spawnPos,
        targetPosition,
        targetRotation,
        isArrivedAtIsland: false,
        hillName: hillKey,
      };
      setLastFishId(newFish.id);
      setFishList((prev) => [...prev, newFish]);
    },
    []
  );

  const handleFishAnimationComplete = useCallback((fishId: string) => {
    // Keep only the latest fish, remove older ones that have arrived
    setFishList((prev) => prev.filter((fish) => fish.id === lastFishId));
  }, [lastFishId]);

  const handleCameraAnimationComplete = useCallback(() => {
    // Show next button when camera animation completes
    setShowNextButton(true);
    setIsZoomMode(true);
  }, []);

  const handleFishExitComplete = useCallback(() => {
    // Remove exiting fish from list
    setFishList((prev) => prev.filter((fish) => fish.id !== lastFishId));
    // Mark that exit is triggered, effect will handle auto-transition
    exitTriggeredRef.current = true;
    setIsExiting(false);
  }, [lastFishId]);

  const handleNextButtonClick = useCallback(() => {
    // Start exit animation
    setIsExiting(true);
    setIsZoomMode(false);
    setShowNextButton(false);
  }, []);

  const handleCameraCapture = useCallback((camera: any) => {
    cameraRef.current = camera;
  }, []);

  const handleLoadingComplete = () => {
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  const handleExitZoomMode = useCallback(() => {
    // Trigger fish exit animation and mark that we're exiting to home
    isExitingToHomeRef.current = true;
    setIsExiting(true);
  }, []);

  const handleDismissInstructionCard = useCallback(() => {
    setShowInstructionCard(false);
  }, []);

  // Auto-transition to next hill when fish exits
  useEffect(() => {
    if (exitTriggeredRef.current && currentHillKey && cameraScenePos) {
      exitTriggeredRef.current = false;

      // If exiting to home, navigate instead of transitioning to next hill
      if (isExitingToHomeRef.current) {
        isExitingToHomeRef.current = false;
        setIsZoomMode(false);
        setShowNextButton(false);
        setFishList([]);
        setCurrentHillKey(null);

        // Animate camera back to default position
        if (cameraRef.current && cameraScenePos?.default_camera) {
          const camera = cameraRef.current;
          const defaultCam = cameraScenePos.default_camera;
          const camPos = {
            x: parseFloat(defaultCam.pos.x),
            y: parseFloat(defaultCam.pos.y),
            z: parseFloat(defaultCam.pos.z),
          };

          gsap.to(camera.position, {
            x: camPos.x,
            y: camPos.y,
            z: camPos.z,
            duration: 1.5,
            ease: 'power2.inOut',
            onComplete: () => {
              setIsAnimatingCamera(false);
            },
          });
        }
        return;
      }

      // Extract hill number (e.g., "hill1" -> 1)
      const hillMatch = currentHillKey.match(/hill(\d+)/);
      if (hillMatch) {
        const currentNumber = parseInt(hillMatch[1], 10);
        // Cycle through hills 1, 2, 3
        const nextNumber = currentNumber === 3 ? 1 : currentNumber + 1;
        const nextHillKey = `hill${nextNumber}`;
        const nextHillData = cameraScenePos[nextHillKey];

        if (nextHillData) {
          const targetPosition: [number, number, number] = [
            parseFloat(nextHillData.pos.x),
            parseFloat(nextHillData.pos.y),
            parseFloat(nextHillData.pos.z),
          ];
          const targetRotation: [number, number, number] = [
            parseFloat(nextHillData.rotation.x),
            parseFloat(nextHillData.rotation.y),
            parseFloat(nextHillData.rotation.z),
          ];

          // Update state with next hill
          setCurrentHillKey(nextHillKey);
          setShowNextButton(false);
          const newFishId = `fish-${Date.now()}`;
          setLastFishId(newFishId);
          const spawnPos: [number, number, number] = [
            cameraRef.current?.position.x || 0,
            cameraRef.current?.position.y || 0,
            cameraRef.current?.position.z || 0,
          ];
          // Spawn new fish (old fish will be removed after it exits)
          setFishList((prev) => [
            ...prev,
            {
              id: newFishId,
              fishPosition: spawnPos,
              targetPosition,
              targetRotation,
              isArrivedAtIsland: false,
              hillName: nextHillKey,
            },
          ]);
        }
      }
    }
  }, [isExiting, currentHillKey, cameraScenePos, defaultCameraPos, setIsAnimatingCamera]);

  // Create orbitControlsRef for forwarding from CloudStation
  const orbitControlsRef = useRef<any>(null);

  // Memoize CloudStationContent props to prevent re-renders
  const cloudStationProps = useMemo(
    () => ({
      onIslandClick: handleIslandClick,
      fishList: fishList,
      onFishAnimationComplete: handleFishAnimationComplete,
      onCameraAnimationComplete: handleCameraAnimationComplete,
      isExiting,
      lastFishId,
      onFishExitComplete: handleFishExitComplete,
      isAnimatingCamera,
      setIsAnimatingCamera,
      orbitControlsRef,
      onTutorialBubblePositionUpdate: setTutorialBubblePosition,
      cameraScenePos,
    }),
    [fishList, isExiting, lastFishId, handleIslandClick, handleFishAnimationComplete, handleCameraAnimationComplete, handleFishExitComplete, isAnimatingCamera, setIsAnimatingCamera, orbitControlsRef, cameraScenePos]
  );

  return (
    <>
      <div className="h-screen w-full relative">
        <LoadingScreen isVisible={isLoading} />
        <Head>
          <title>Three.js with Next.js</title>
          <meta name="description" content="Integrating Three.js with Next.js" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className="h-full w-full">
        <Canvas
          camera={{
            position: defaultCameraPos
              ? [defaultCameraPos.x, defaultCameraPos.y, defaultCameraPos.z]
              : [0, 2, 3],
            near: 0.1,
            far: 1000,
          }}
          className="h-full w-full"
          gl={{ antialias: true }}
          onCreated={handleLoadingComplete}
        >
          <Suspense fallback={null}>
            <directionalLight position={[1, 1, 1]} intensity={2} />
            <ambientLight intensity={0.5} />

            <CameraLogger />
            <CameraCapture onCameraCapture={handleCameraCapture} />

            <CloudStationContent {...cloudStationProps} />
          </Suspense>
        </Canvas>
      </main>
      {isZoomMode && (
        <div className="fixed inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <HillInfo currentHill={currentHillKey} isVisible={isZoomMode} isExiting={isExiting} />
          </div>
        </div>
      )}
      {(showNextButton || isZoomMode) && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4">
          {isZoomMode && <ExitZoomButton isVisible={true} onClick={handleExitZoomMode} />}
          {showNextButton && <NextButton isVisible={true} onClick={handleNextButtonClick} />}
        </div>
      )}
      {/* Tutorial bubble overlay - only show on first visit */}
      <TutorialBubble
        screenPosition={tutorialBubblePosition}
        text="Click on a hill"
        isVisible={!hasUserClickedHill && !isLoading}
      />
      {/* Instruction card for navigation guidance */}
      <InstructionCard
        isVisible={showInstructionCard && !isLoading}
        onDismiss={handleDismissInstructionCard}
      />
      {/* Button group - center-aligned vertically */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-4">
        <HomeButton isVisible={true} className="!static !bottom-auto !right-auto" />
        <Suspense fallback={null}>
          <SoundToggle className="!static !bottom-auto !right-auto !text-white" />
        </Suspense>
      </div>
      </div>
    </>
  );
};

export default Page;