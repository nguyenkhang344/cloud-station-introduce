'use client';
import React, { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls as OrbitControlsComponent } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';

interface CloudStationSceneProps {
  onIslandClick?: (targetPosition: [number, number, number], targetRotation: [number, number, number], hillKey: string) => void;
  onDisableOrbitControls?: () => void;
  isOrbitControlsDraggingRef: React.MutableRefObject<boolean>;
  cameraScenePos?: Record<
    string,
    {
      pos: { x: string; y: string; z: string };
      rotation: { x: string; y: string; z: string };
    }
  >;
  isAnimatingCamera?: boolean;
}

// Scene content component
const CloudStationScene: React.FC<CloudStationSceneProps> = ({ onIslandClick, onDisableOrbitControls, isOrbitControlsDraggingRef, cameraScenePos, isAnimatingCamera }) => {
  const { scene, camera, gl } = useThree();
  const { scene: modelScene, animations } = useGLTF(
    '/3d/landing-page/cloud_station/scene.gltf'
  );

  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const clockRef = useRef(new THREE.Clock());
  const hillNodesRef = useRef<THREE.Object3D[]>([]);
  const composerRef = useRef<EffectComposer | null>(null);
  const outlinePassRef = useRef<OutlinePass | null>(null);
  const previousHoveredHillRef = useRef<THREE.Object3D | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  // Setup scene, mixer, and animations
  useEffect(() => {
    if (!modelScene) return;

    // Only setup if not already added
    if (modelScene.parent === scene) {
      return;
    }

    // Add model to scene
    scene.add(modelScene);

    // Setup skybox
    const skyboxGeo = modelScene.getObjectByName('skybox_GEO');
    const skyboxMat = modelScene.getObjectByName('skybox_GEO_sky_MAT_0');
    if (skyboxGeo && skyboxMat) {
      skyboxGeo.scale.set(6, 6, 6);
      skyboxMat.scale.set(6, 6, 6);
    }

    // Find hill nodes and store their original materials
    traverseAndFindHills(modelScene, hillNodesRef.current);

    // Setup EffectComposer with OutlinePass (only if not exists)
    if (!composerRef.current) {
      const composer = new EffectComposer(gl);
      composerRef.current = composer;

      const renderPass = new RenderPass(scene, camera);
      renderPass.renderToScreen = false;
      composer.addPass(renderPass);

      const outlinePass = new OutlinePass(new THREE.Vector2(gl.domElement.clientWidth, gl.domElement.clientHeight), scene, camera);
      outlinePass.edgeStrength = 3.0;
      outlinePass.edgeGlow = 1.5;
      outlinePass.edgeThickness = 2.0;
      outlinePass.pulsePeriod = 0;
      outlinePass.visibleEdgeColor.set(0xffffff);
      outlinePass.hiddenEdgeColor.set(0xffffff);
      outlinePass.selectedObjects = [];
      outlinePass.renderToScreen = true;
      composer.addPass(outlinePass);
      outlinePassRef.current = outlinePass;
    }

    // Setup mixer and play animations (only if not already created)
    if (!mixerRef.current && animations.length > 0) {
      mixerRef.current = new THREE.AnimationMixer(modelScene);
      animations.forEach((clip) => {
        mixerRef.current?.clipAction(clip).play();
      });
    }

    return () => {
      // Don't remove model - keep it in scene for persistent animation
    };
  }, [modelScene, scene, camera, gl, animations]);

  // Clear glow when camera starts animating (handles both mouse and touch)
  useEffect(() => {
    if (isAnimatingCamera && previousHoveredHillRef.current) {
      removeHillGlow(previousHoveredHillRef.current);
      previousHoveredHillRef.current = null;
    }
  }, [isAnimatingCamera]);

  // Handle mouse move for raycasting
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Disable hover when camera is animating
      if (isAnimatingCamera) {
        // Remove glow from previous hill
        if (previousHoveredHillRef.current) {
          removeHillGlow(previousHoveredHillRef.current);
          previousHoveredHillRef.current = null;
        }
        return;
      }

      const rect = gl.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(hillNodesRef.current, true);

      if (intersects.length > 0) {
        const hoveredHill = findRootHill(intersects[0].object, hillNodesRef.current);
        if (hoveredHill && hoveredHill !== previousHoveredHillRef.current) {
          // Remove glow from previous hill
          if (previousHoveredHillRef.current) {
            removeHillGlow(previousHoveredHillRef.current);
          }

          // Add glow to new hill
          previousHoveredHillRef.current = hoveredHill;
          addHillGlow(hoveredHill);
        }
      } else {
        if (previousHoveredHillRef.current) {
          removeHillGlow(previousHoveredHillRef.current);
          previousHoveredHillRef.current = null;
        }
      }
    };

    gl.domElement.addEventListener('mousemove', handleMouseMove);
    return () => {
      gl.domElement.removeEventListener('mousemove', handleMouseMove);
    };
  }, [gl, camera, isAnimatingCamera]);

  // Handle click for spawning fish
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      // Skip click if camera is animating
      if (isAnimatingCamera) {
        return;
      }

      // Skip click if OrbitControls was just dragging
      if (isOrbitControlsDraggingRef.current) {
        isOrbitControlsDraggingRef.current = false;
        return;
      }

      const rect = gl.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(hillNodesRef.current, true);

      if (intersects.length > 0) {
        const clickedHill = findRootHill(intersects[0].object, hillNodesRef.current);
        if (clickedHill) {
          // Extract hill number from name (e.g., "hill_1" -> "1")
          const hillMatch = clickedHill.name.match(/hill_(\d+)/i);
          if (hillMatch && cameraScenePos) {
            const hillNumber = hillMatch[1];
            const hillKey = `hill${hillNumber}`;
            const hillData = cameraScenePos[hillKey];

            if (hillData) {
              const targetPosition: [number, number, number] = [
                parseFloat(hillData.pos.x),
                parseFloat(hillData.pos.y),
                parseFloat(hillData.pos.z),
              ];
              const targetRotation: [number, number, number] = [
                parseFloat(hillData.rotation.x),
                parseFloat(hillData.rotation.y),
                parseFloat(hillData.rotation.z),
              ];
              // Disable OrbitControls immediately when clicking island
              onDisableOrbitControls?.();
              onIslandClick?.(targetPosition, targetRotation, hillKey);
            }
          }
        }
      }
    };

    gl.domElement.addEventListener('click', handleClick);
    return () => {
      gl.domElement.removeEventListener('click', handleClick);
    };
  }, [gl, camera, onIslandClick, onDisableOrbitControls, cameraScenePos, isOrbitControlsDraggingRef, isAnimatingCamera]);

  // Manual render loop - replaces Canvas default render
  useEffect(() => {
    // Disable Canvas rendering
    gl.setAnimationLoop(null);

    let frameId: number;

    const animate = () => {
      const delta = clockRef.current.getDelta();
      mixerRef.current?.update(delta);

      // Clear and render via composer (prevents dual rendering)
      gl.clear();
      if (composerRef.current) {
        composerRef.current.render();
      }

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [gl]);

  // Helper: Add outline to hill
  const addHillGlow = (hill: THREE.Object3D) => {
    if (outlinePassRef.current) {
      outlinePassRef.current.selectedObjects = [hill];
    }
  };

  // Helper: Remove outline from hill
  const removeHillGlow = (hill: THREE.Object3D) => {
    if (outlinePassRef.current) {
      outlinePassRef.current.selectedObjects = [];
    }
  };

  return null;
};

// CloudStation scene wrapper (without Canvas - used inside page Canvas)
interface CloudStationProps {
  onIslandClick?: (targetPosition: [number, number, number], targetRotation: [number, number, number], hillKey: string) => void;
  onDisableOrbitControls?: () => void;
  cameraScenePos?: Record<
    string,
    {
      pos: { x: string; y: string; z: string };
      rotation: { x: string; y: string; z: string };
    }
  >;
  isAnimatingCamera?: boolean;
}

const CloudStation = React.forwardRef<any, CloudStationProps>(({ onIslandClick, onDisableOrbitControls, cameraScenePos, isAnimatingCamera }, ref) => {
  const orbitControlsRef = useRef<any>(null);

  // Forward the ref to parent
  useEffect(() => {
    if (ref && typeof ref === 'object' && 'current' in ref) {
      ref.current = orbitControlsRef.current;
    }
  }, [ref]);
  const isOrbitControlsDraggingRef = useRef(false);
  const mouseDownPosRef = useRef({ x: 0, y: 0 });

  // Disable/Enable OrbitControls when camera is animating
  useEffect(() => {
    if (!orbitControlsRef.current) return;
    orbitControlsRef.current.enabled = !isAnimatingCamera;
  }, [isAnimatingCamera]);

  useEffect(() => {
    if (!orbitControlsRef.current) return;

    const controls = orbitControlsRef.current;

    // Pan limit bounds
    const panLimitX = { min: -3, max: 3 };
    const panLimitY = { min: -3, max: 3 };
    const panLimitZ = { min: -3, max: 3 };

    // Threshold for detecting drag (pixels)
    const DRAG_THRESHOLD = 5;

    // Track when user starts dragging
    const handleMouseDown = (event: MouseEvent) => {
      mouseDownPosRef.current = { x: event.clientX, y: event.clientY };
      isOrbitControlsDraggingRef.current = false;
    };

    // Track when user moves mouse
    const handleMouseMove = (event: MouseEvent) => {
      const dx = Math.abs(event.clientX - mouseDownPosRef.current.x);
      const dy = Math.abs(event.clientY - mouseDownPosRef.current.y);

      // If mouse moved beyond threshold, it's a drag
      if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
        isOrbitControlsDraggingRef.current = true;
      }
    };

    // Track when user stops dragging
    const handleMouseUp = () => {
      // Reset flag after a small delay to allow click event to be processed
      setTimeout(() => {
        isOrbitControlsDraggingRef.current = false;
      }, 0);
    };

    // Store the update handler to clamp position only when user is dragging
    const updateHandler = () => {
      // Only clamp when user is actually dragging
      if (isOrbitControlsDraggingRef.current && controls.target) {
        controls.target.x = Math.max(panLimitX.min, Math.min(panLimitX.max, controls.target.x));
        controls.target.y = Math.max(panLimitY.min, Math.min(panLimitY.max, controls.target.y));
        controls.target.z = Math.max(panLimitZ.min, Math.min(panLimitZ.max, controls.target.z));
      }
    };

    // Add listeners
    controls.addEventListener('change', updateHandler);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      controls.removeEventListener('change', updateHandler);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <>
      <directionalLight position={[1, 1, 1]} intensity={2} />
      <ambientLight intensity={0.5} />

      <OrbitControlsComponent
        ref={orbitControlsRef}
        enableDamping
        dampingFactor={0.25}
        enableZoom
        maxDistance={10}
        maxPolarAngle={Math.PI}
        minPolarAngle={0}
      />

      <CloudStationScene onIslandClick={onIslandClick} onDisableOrbitControls={onDisableOrbitControls} isOrbitControlsDraggingRef={isOrbitControlsDraggingRef} cameraScenePos={cameraScenePos} isAnimatingCamera={isAnimatingCamera} />
    </>
  );
});

CloudStation.displayName = 'CloudStation';

// Helper functions
const traverseAndFindHills = (object: THREE.Object3D, hillNodes: THREE.Object3D[]) => {
  object.traverse((node) => {
    if (node.name.match(/^hill_[1-3]$/i)) {
      hillNodes.push(node);
    }
  });
};

const findRootHill = (object: THREE.Object3D, hillNodes: THREE.Object3D[]): THREE.Object3D | null => {
  let current: THREE.Object3D | null = object;
  while (current) {
    if (hillNodes.includes(current)) {
      return current;
    }
    current = current.parent;
  }
  return null;
};

export default CloudStation;
