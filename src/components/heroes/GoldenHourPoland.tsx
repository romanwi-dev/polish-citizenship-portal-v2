import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

function PolishEagle() {
  const meshRef = useRef<THREE.Mesh>(null);
  const prefersReducedMotion = useReducedMotion();

  useFrame((state) => {
    if (meshRef.current && !prefersReducedMotion) {
      meshRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.2;
    }
  });

  return (
    <Float speed={prefersReducedMotion ? 0 : 1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhysicalMaterial
          color="#d4af37"
          metalness={0.9}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
        />
      </mesh>
      {/* Crown of stars around eagle */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 3.5, Math.sin(angle) * 3.5, 0]}
            scale={0.15}
          >
            <sphereGeometry args={[1, 16, 16]} />
            <meshPhysicalMaterial
              color="#FFD700"
              emissive="#FFD700"
              emissiveIntensity={0.5}
              metalness={1}
              roughness={0}
            />
          </mesh>
        );
      })}
    </Float>
  );
}

function VolumetricRays() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 500;
  const prefersReducedMotion = useReducedMotion();

  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 15;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }

  useFrame((state) => {
    if (particlesRef.current && !prefersReducedMotion) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
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
        size={0.08}
        color="#FFE4B5"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export const GoldenHourPoland = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
      >
        {/* Warm golden lighting */}
        <ambientLight intensity={0.3} color="#FFE4B5" />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#FFA500" castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#FF8C00" />
        <pointLight position={[0, 0, 5]} intensity={1} color="#FFD700" />
        
        <PolishEagle />
        <VolumetricRays />
        
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
