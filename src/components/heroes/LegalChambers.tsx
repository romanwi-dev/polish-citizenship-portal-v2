import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

function FloatingDocument({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const prefersReducedMotion = useReducedMotion();

  useFrame((state) => {
    if (meshRef.current && !prefersReducedMotion) {
      meshRef.current.rotation.y = rotation[1] + Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={prefersReducedMotion ? 0 : 1} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} rotation={rotation} castShadow receiveShadow>
        <planeGeometry args={[1.2, 1.6]} />
        <meshPhysicalMaterial
          color="#F5F5DC"
          roughness={0.8}
          metalness={0}
          clearcoat={0.1}
          side={THREE.DoubleSide}
        />
        {/* Text lines simulation */}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[0.9, 0.05]} />
          <meshBasicMaterial color="#2C1810" opacity={0.6} transparent />
        </mesh>
        <mesh position={[0, -0.15, 0.01]}>
          <planeGeometry args={[0.9, 0.05]} />
          <meshBasicMaterial color="#2C1810" opacity={0.6} transparent />
        </mesh>
        <mesh position={[0, -0.3, 0.01]}>
          <planeGeometry args={[0.9, 0.05]} />
          <meshBasicMaterial color="#2C1810" opacity={0.6} transparent />
        </mesh>
      </mesh>
    </Float>
  );
}

function DeskLamp() {
  return (
    <group position={[4, 2, 0]}>
      <spotLight
        position={[0, 0, 0]}
        intensity={3}
        angle={0.6}
        penumbra={1}
        color="#FFE4B5"
        castShadow
        target-position={[0, -2, 0]}
      />
      <mesh position={[0, 0, 0]}>
        <coneGeometry args={[0.3, 0.5, 8]} />
        <meshPhysicalMaterial
          color="#2C1810"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

function DustParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 200;
  const prefersReducedMotion = useReducedMotion();

  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }

  useFrame((state) => {
    if (particlesRef.current && !prefersReducedMotion) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] -= 0.005;
        if (positions[i * 3 + 1] < -4) {
          positions[i * 3 + 1] = 4;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
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
        size={0.05}
        color="#D4AF37"
        transparent
        opacity={0.3}
      />
    </points>
  );
}

export const LegalChambers = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="w-full h-full bg-gradient-to-b from-[#1a0f0a] to-[#0a0502]">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        shadows
        gl={{ alpha: true, antialias: true }}
      >
        {/* Dramatic noir lighting */}
        <ambientLight intensity={0.1} color="#4A3728" />
        <DeskLamp />
        <directionalLight position={[-5, 3, 2]} intensity={0.5} color="#8B7355" />
        
        <FloatingDocument position={[-2, 0.5, 0]} rotation={[0, 0.3, 0]} />
        <FloatingDocument position={[1.5, -0.5, -1]} rotation={[0, -0.4, 0]} />
        <FloatingDocument position={[-0.5, 1.5, 1]} rotation={[0, 0.2, 0]} />
        <FloatingDocument position={[2.5, 0.8, 0.5]} rotation={[0, -0.3, 0]} />
        
        <DustParticles />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!prefersReducedMotion}
          autoRotateSpeed={0.2}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 2.5}
        />
      </Canvas>
    </div>
  );
};
