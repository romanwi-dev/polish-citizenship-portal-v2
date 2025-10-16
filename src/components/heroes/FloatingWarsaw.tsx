import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { Float, MeshDistortMaterial, Sparkles } from '@react-three/drei';

const Building = ({ position, size, color }: { position: [number, number, number], size: [number, number, number], color: string }) => {
  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.8}>
      <mesh position={position} castShadow>
        <boxGeometry args={size} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.7}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>
    </Float>
  );
};

const PalaceSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[2, 64, 64]} />
      <MeshDistortMaterial
        color="#c4a747"
        metalness={0.9}
        roughness={0.1}
        distort={0.3}
        speed={2}
      />
    </mesh>
  );
};

const FloatingRings = () => {
  const ringRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.2;
      ringRef.current.rotation.z = clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <group ref={ringRef} position={[0, 0, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3, 0.05, 16, 100]} />
        <meshPhysicalMaterial
          color="#ffffff"
          metalness={1}
          roughness={0}
          transparent
          opacity={0.6}
          emissive="#ffffff"
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[3.5, 0.05, 16, 100]} />
        <meshPhysicalMaterial
          color="#dc143c"
          metalness={1}
          roughness={0}
          transparent
          opacity={0.6}
          emissive="#dc143c"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
};

export const FloatingWarsaw = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-[#0a0520] via-[#1a1040] to-[#2a1a60]">
      <Canvas camera={{ position: [0, 0, 12], fov: 60 }} shadows>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#dc143c" />
        <spotLight position={[0, 10, 0]} angle={0.3} intensity={2} color="#c4a747" castShadow />
        
        <Sparkles count={200} scale={20} size={2} speed={0.3} color="#ffffff" />
        
        <PalaceSphere />
        <FloatingRings />
        
        <Building position={[-4, 2, -3]} size={[0.8, 3, 0.8]} color="#4a5568" />
        <Building position={[4, 1, -2]} size={[1, 4, 1]} color="#2d3748" />
        <Building position={[-3, -1, -4]} size={[0.6, 2.5, 0.6]} color="#1a202c" />
        <Building position={[3, -2, -5]} size={[0.7, 3.5, 0.7]} color="#374151" />
        <Building position={[0, 3, -6]} size={[1.2, 5, 1.2]} color="#4b5563" />
        
        <fog attach="fog" args={['#1a1040', 8, 25]} />
      </Canvas>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4 drop-shadow-2xl">Floating Warsaw</h1>
          <p className="text-xl opacity-80">Landmarks Suspended in Space</p>
        </div>
      </div>
    </div>
  );
};
