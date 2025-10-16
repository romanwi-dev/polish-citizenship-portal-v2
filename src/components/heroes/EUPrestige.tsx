import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

function CrystalStar({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const prefersReducedMotion = useReducedMotion();

  useFrame((state) => {
    if (meshRef.current && !prefersReducedMotion) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
      meshRef.current.rotation.z = Math.sin(state.clock.getElapsedTime()) * 0.2;
    }
  });

  return (
    <Float speed={prefersReducedMotion ? 0 : 2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position}>
        <octahedronGeometry args={[0.5, 0]} />
        <meshPhysicalMaterial
          color="#003399"
          metalness={0.2}
          roughness={0}
          transmission={0.9}
          thickness={0.5}
          clearcoat={1}
          clearcoatRoughness={0}
          ior={1.5}
        />
      </mesh>
    </Float>
  );
}

function EUStarCircle() {
  const stars = [];
  const radius = 3;
  
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    stars.push(<CrystalStar key={i} position={[x, y, 0]} />);
  }
  
  return <>{stars}</>;
}

function BokehParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 300;
  const prefersReducedMotion = useReducedMotion();

  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    sizes[i] = Math.random() * 0.3 + 0.1;
  }

  useFrame((state) => {
    if (particlesRef.current && !prefersReducedMotion) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.01;
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
        <bufferAttribute
          attach="attributes-size"
          count={particleCount}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.2}
        color="#FFD700"
        transparent
        opacity={0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export const EUPrestige = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="w-full h-full bg-gradient-to-b from-[#001a4d] to-[#000814]">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
      >
        {/* Luxury lighting setup */}
        <ambientLight intensity={0.2} color="#003399" />
        <spotLight position={[5, 5, 5]} intensity={2} color="#FFD700" angle={0.3} penumbra={1} />
        <spotLight position={[-5, -5, 5]} intensity={1.5} color="#0055FF" angle={0.3} penumbra={1} />
        <pointLight position={[0, 0, 8]} intensity={1} color="#FFFFFF" />
        
        <EUStarCircle />
        <BokehParticles />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!prefersReducedMotion}
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 2.5}
        />
      </Canvas>
    </div>
  );
};
