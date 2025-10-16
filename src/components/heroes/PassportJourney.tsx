import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

function PolishPassport() {
  const meshRef = useRef<THREE.Group>(null);
  const prefersReducedMotion = useReducedMotion();

  useFrame((state) => {
    if (meshRef.current && !prefersReducedMotion) {
      meshRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.15;
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return (
    <group ref={meshRef} rotation={[0.2, 0, 0]}>
      {/* Passport cover */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.5, 3.5, 0.1]} />
        <meshPhysicalMaterial
          color="#8B0000"
          roughness={0.6}
          metalness={0.1}
          clearcoat={0.3}
        />
      </mesh>
      
      {/* Polish Eagle emblem */}
      <mesh position={[0, 0.8, 0.06]}>
        <circleGeometry args={[0.5, 32]} />
        <meshPhysicalMaterial
          color="#D4AF37"
          metalness={0.9}
          roughness={0.1}
          emissive="#D4AF37"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* "PASZPORT" text simulation */}
      <mesh position={[0, -0.5, 0.06]}>
        <planeGeometry args={[1.8, 0.3]} />
        <meshBasicMaterial color="#D4AF37" />
      </mesh>
      
      {/* "POLSKA" text simulation */}
      <mesh position={[0, -1, 0.06]}>
        <planeGeometry args={[1.2, 0.25]} />
        <meshBasicMaterial color="#D4AF37" />
      </mesh>
    </group>
  );
}

function TravelStamps() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 150;
  const prefersReducedMotion = useReducedMotion();

  const positions = new Float32Array(particleCount * 3);
  const opacities = new Float32Array(particleCount);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 15;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    opacities[i] = Math.random();
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
        size={0.15}
        color="#4A90E2"
        transparent
        opacity={0.3}
        map={createStampTexture()}
      />
    </points>
  );
}

function createStampTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#4A90E2';
  ctx.beginPath();
  ctx.arc(32, 32, 28, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(32, 32, 25, 0, Math.PI * 2);
  ctx.stroke();
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export const PassportJourney = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="w-full h-full bg-gradient-to-b from-[#1a2332] to-[#0a0e1a]">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 55 }}
        shadows
        gl={{ alpha: true, antialias: true }}
      >
        {/* Cinematic blue lighting */}
        <ambientLight intensity={0.3} color="#4A90E2" />
        <directionalLight position={[5, 5, 5]} intensity={1.5} color="#FFFFFF" castShadow />
        <directionalLight position={[-3, 3, -3]} intensity={0.5} color="#6BB6FF" />
        <pointLight position={[0, 0, 5]} intensity={1} color="#B0D4FF" />
        
        <PolishPassport />
        <TravelStamps />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!prefersReducedMotion}
          autoRotateSpeed={0.4}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 2.5}
        />
      </Canvas>
    </div>
  );
};
