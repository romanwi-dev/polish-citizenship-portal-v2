import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

function MinimalGeometry({ position, color, delay = 0 }: { position: [number, number, number]; color: string; delay?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const prefersReducedMotion = useReducedMotion();

  useFrame((state) => {
    if (meshRef.current && !prefersReducedMotion) {
      const time = state.clock.getElapsedTime() + delay;
      meshRef.current.position.y = position[1] + Math.sin(time * 0.8) * 0.3;
      meshRef.current.rotation.y = time * 0.3;
      meshRef.current.rotation.x = Math.sin(time * 0.4) * 0.2;
    }
  });

  return (
    <RoundedBox
      ref={meshRef}
      args={[1.5, 1.5, 1.5]}
      radius={0.1}
      smoothness={4}
      position={position}
      castShadow
      receiveShadow
    >
      <meshPhysicalMaterial
        color={color}
        metalness={0.1}
        roughness={0.1}
        clearcoat={1}
        clearcoatRoughness={0}
        reflectivity={0.9}
      />
    </RoundedBox>
  );
}

function AccentSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const prefersReducedMotion = useReducedMotion();

  useFrame((state) => {
    if (meshRef.current && !prefersReducedMotion) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} castShadow>
      <sphereGeometry args={[0.8, 64, 64]} />
      <meshPhysicalMaterial
        color="#6366f1"
        metalness={1}
        roughness={0}
        clearcoat={1}
        clearcoatRoughness={0}
      />
    </mesh>
  );
}

function MinimalParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 100;
  const prefersReducedMotion = useReducedMotion();

  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 15;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }

  useFrame((state) => {
    if (particlesRef.current && !prefersReducedMotion) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.03;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#6366f1"
        transparent
        opacity={0.5}
      />
    </points>
  );
}

export const ModernMinimalist = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="w-full h-full bg-gradient-to-b from-[#f8f9fa] to-[#e9ecef]">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        shadows
        gl={{ alpha: true, antialias: true }}
      >
        {/* Perfect studio lighting */}
        <ambientLight intensity={0.5} color="#ffffff" />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.5}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-5, 5, -3]} intensity={0.8} color="#f0f0f0" />
        <pointLight position={[0, 0, 5]} intensity={0.5} color="#ffffff" />
        
        <MinimalGeometry position={[-3, 0, -1]} color="#ffffff" delay={0} />
        <MinimalGeometry position={[3, 0.5, -1]} color="#f8f9fa" delay={1} />
        <AccentSphere />
        <MinimalParticles />
        
        {/* Subtle ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <shadowMaterial opacity={0.1} />
        </mesh>
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!prefersReducedMotion}
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 2.5}
        />
      </Canvas>
    </div>
  );
};
