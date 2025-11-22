import React from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const Sky = () => {
  const sky = useGLTF('/for-public-page/sky.glb');
  return (
    // <mesh>
    //     <boxGeometry args={[100, 100, 100]} />
    //     <meshBasicMaterial color="#f7f7c6" side={THREE.BackSide} />
    // </mesh>
    <mesh >
      <primitive object={sky.scene}  />
    </mesh>
  );
};

export default Sky;
