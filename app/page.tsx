'use client';
import { Canvas } from '@react-three/fiber';
import { Suspense, useState, useEffect, useRef } from 'react';
import Kitchen from './ui/models/Kitchen';
import Sky from './ui/models/Sky';
import Plane from './ui/models/Plane';
import HomeInfo from './ui/common/HomeInfo';
import InstructionOverlay from './ui/common/InstructionOverlay';
import LoadingScreen from './ui/common/LoadingScreen';
import BlurOverlay from './ui/common/BlurOverlay';
import SoundToggle from './ui/common/SoundToggle';

const Page = () => {
  const [isRotating, setIsRotating] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [rotationDirection, setRotationDirection] = useState(-1); // 1 for clockwise, -1 for counter-clockwise
  const [showBlurOverlay, setShowBlurOverlay] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const preventHorizontalSwipe = (e: TouchEvent) => {
      if (Math.abs(e.touches[0].clientY - e.touches[0].screenY) > 0) {
        e.preventDefault();
      }
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('touchmove', preventHorizontalSwipe, {
        passive: false,
      });
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('touchmove', preventHorizontalSwipe);
      }
    };
  }, []);

  // Expose blur overlay trigger to window for HomeInfo
  useEffect(() => {
    (window as any).__showBlurOverlay = setShowBlurOverlay;
    return () => {
      delete (window as any).__showBlurOverlay;
    };
  }, []);

  const adjust3DSceneForScreenSize = (): [
    [number, number, number],
    [number, number, number],
    [number, number, number],
  ] => {
    let screenScale: [number, number, number] = [1, 1, 1];
    const screenPosition: [number, number, number] = [0, -1.2, -0.5];
    const screenRotation: [number, number, number] = [0, -1.4, 0];
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      screenScale = [0.7, 0.7, 0.7];
    } else {
      screenScale = [1, 1, 1];
    }
    return [screenScale, screenPosition, screenRotation];
  };

  const adjustPlaneForScreenSize = (): [
    [number, number, number],
    [number, number, number],
  ] => {
    let screenScale: [number, number, number] = [1, 1, 1];
    let screenPosition: [number, number, number] = [0, -0.5, 0];
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      screenScale = [0.5, 0.5, 0.5];
      screenPosition = [-0.5, -0.7, 2.5];
    } else {
      screenScale = [0.5, 0.5, 0.5];
      screenPosition = [-2, -0.7, 2.5];
    }
    return [screenScale, screenPosition];
  };

  const [screenScale, screenPosition, screenRotation] =
    adjust3DSceneForScreenSize();
  const [planeScale, planePosition] = adjustPlaneForScreenSize();

  // Handle loading completion
  const handleLoadingComplete = () => {
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  return (
    <>
      <Suspense fallback={null}>
        <SoundToggle />
      </Suspense>
      <section className="relative h-screen w-full">
        <LoadingScreen isVisible={isLoading} />
        <Canvas
          ref={canvasRef}
          className={`absolute inset-0 z-0 h-full w-full bg-transparent ${isRotating ? 'cursor-grabbing' : 'cursor-grab'}`}
          camera={{ near: 0.1, far: 1000 }}
        >
          <Suspense fallback={null}>
            <directionalLight position={[1, 1, 1]} intensity={2} />
            <ambientLight intensity={0.5} />
            {/* <pointLight position={[10, 10, 10]} /> */}
            {/* <spotLight position={[0, 0, 10]} /> */}
            <hemisphereLight groundColor="#fcad03" intensity={1} />

            <Sky />
            <Plane
              planeScale={planeScale}
              planePosition={planePosition}
              isRotating={isRotating}
              rotation={[0, 20, 0]}
              rotationDirection={rotationDirection}
            />
            <Kitchen
              position={screenPosition}
              scale={screenScale}
              rotation={screenRotation}
              isRotating={isRotating}
              setRotating={setIsRotating}
              setCurrentStage={setCurrentStage}
              onUserInteraction={() => setHasUserInteracted(true)}
              onLoad={handleLoadingComplete}
              setRotationDirection={setRotationDirection}
            />
          </Suspense>
        </Canvas>
      </section>
      {currentStage && <HomeInfo currentStage={currentStage} />}
      <InstructionOverlay isVisible={!hasUserInteracted && !isLoading} />
      <BlurOverlay isActive={showBlurOverlay} duration={1000} />
    </>
  );
};

export default Page;
