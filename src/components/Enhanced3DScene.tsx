import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, Sphere, Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedPassport() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.3;
      groupRef.current.rotation.x = Math.cos(state.clock.getElapsedTime() * 0.2) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={groupRef}>
        {/* Passport book */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2, 2.8, 0.15]} />
          <meshStandardMaterial 
            color="#3b5998" 
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
        {/* EU Stars circle */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const radius = 0.7;
          return (
            <mesh 
              key={i}
              position={[
                Math.cos(angle) * radius,
                Math.sin(angle) * radius + 0.3,
                0.08
              ]}
            >
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial 
                color="#ffd700"
                emissive="#ffd700"
                emissiveIntensity={0.5}
              />
            </mesh>
          );
        })}
      </group>
    </Float>
  );
}

function FloatingDocuments() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: 20 }).map((_, i) => {
        const radius = 4 + Math.random() * 2;
        const theta = (i / 20) * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        return (
          <Float 
            key={i}
            speed={2 + Math.random()} 
            rotationIntensity={0.5}
            floatIntensity={2}
          >
            <mesh
              position={[
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.sin(phi) * Math.sin(theta),
                radius * Math.cos(phi)
              ]}
            >
              <planeGeometry args={[0.3, 0.4]} />
              <meshStandardMaterial 
                color="#5b8dce"
                transparent
                opacity={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
          </Float>
        );
      })}
    </group>
  );
}

function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 800;
  
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }

  useFrame((state) => {
    if (particlesRef.current) {
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
      <pointsMaterial size={0.02} color="#5b8dce" transparent opacity={0.4} />
    </points>
  );
}

export const Enhanced3DScene = () => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 6], fov: 75 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#5b8dce" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
        <spotLight position={[0, 5, 5]} intensity={0.5} angle={0.3} penumbra={1} color="#5b8dce" />
        
        <AnimatedPassport />
        <FloatingDocuments />
        <ParticleField />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.8} 
          minPolarAngle={Math.PI / 2.5} 
        />
      </Canvas>
    </div>
  );
};
