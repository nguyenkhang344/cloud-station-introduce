'use client'
import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const Model = () => {
  const gltf = useGLTF('/3d-girl/scene.gltf');
  return <primitive object={gltf.scene} />;
};

const ThreeScene = () => {
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const directionalLightRef = useRef<THREE.DirectionalLight>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);

  useEffect(() => {
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = 0.6;
    }
    if (directionalLightRef.current) {
      directionalLightRef.current.intensity = 0.8;
      directionalLightRef.current.position.set(5, 5, 5).normalize();
    }
    if (pointLightRef.current) {
      pointLightRef.current.intensity = 0.8;
      pointLightRef.current.position.set(10, 10, 10);
    }
  }, []);

  return (
    <Canvas style={{ width: '100%', height: '100vh' }} camera={{ position: [0, 2, 3], fov: 75 }}>
      <color attach="background" args={[0xeeeeee]} />
      <ambientLight ref={ambientLightRef} />
      <directionalLight ref={directionalLightRef} />
      <pointLight ref={pointLightRef} distance={100} />
      <Model />
      <OrbitControls enableDamping dampingFactor={0.25} enableZoom />
    </Canvas>
  );
};

export default ThreeScene;
