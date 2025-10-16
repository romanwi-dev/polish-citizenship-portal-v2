import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

const HeritageWave = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const geometry = new THREE.PlaneGeometry(16, 10, 80, 50);
  
  useFrame((state) => {
    if (meshRef.current) {
      const positions = meshRef.current.geometry.attributes.position;
      const time = state.clock.getElapsedTime();
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        
        const waveX = Math.sin(x * 0.2 + time * 0.8) * 0.15;
        const waveY = Math.cos(y * 0.25 + time * 0.6) * 0.15;
        
        positions.setZ(i, waveX + waveY);
      }
      
      positions.needsUpdate = true;
      meshRef.current.geometry.computeVertexNormals();
    }
  });

  const texture = createHeritageTexture();

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial 
        map={texture} 
        side={THREE.DoubleSide}
        metalness={0.1}
        roughness={0.6}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
};

const createHeritageTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark red to grey gradient
  const gradient = ctx.createLinearGradient(0, 0, 512, 512);
  gradient.addColorStop(0, '#3f1f1f');    // dark red
  gradient.addColorStop(0.3, '#5c2e2e');  // medium dark red
  gradient.addColorStop(0.6, '#4a4a4a');  // dark grey
  gradient.addColorStop(1, '#2d2d2d');    // darker grey

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  return new THREE.CanvasTexture(canvas);
};

export const RealisticHeritage = () => {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} />
        <HeritageWave />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={0.15}
        />
      </Canvas>
      <div className="absolute inset-0 opacity-40 blur-sm pointer-events-none" />
    </div>
  );
};
