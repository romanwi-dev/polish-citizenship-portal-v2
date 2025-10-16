import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { Float, MeshTransmissionMaterial } from '@react-three/drei';

const Wing = ({ side }: { side: 'left' | 'right' }) => {
  const wingRef = useRef<THREE.Group>(null);
  const multiplier = side === 'left' ? -1 : 1;

  useFrame(({ clock }) => {
    if (wingRef.current) {
      const wave = Math.sin(clock.getElapsedTime() * 2) * 0.15;
      wingRef.current.rotation.z = wave * multiplier;
      wingRef.current.rotation.y = Math.sin(clock.getElapsedTime()) * 0.1;
    }
  });

  return (
    <group ref={wingRef} position={[multiplier * 2, 0, 0]}>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          position={[multiplier * i * 0.4, i * 0.3 - 0.6, i * 0.1]}
          rotation={[0, 0, (Math.PI / 8) * multiplier]}
        >
          <boxGeometry args={[2, 0.4, 0.05]} />
          <meshPhysicalMaterial
            color="#ffffff"
            metalness={0.3}
            roughness={0.2}
            transparent
            opacity={0.85}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
};

const EagleBody = () => {
  return (
    <group position={[0, 0, 0]}>
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshPhysicalMaterial
          color="#ffd700"
          metalness={0.9}
          roughness={0.1}
          clearcoat={1}
        />
      </mesh>
      <mesh position={[0, 0.6, 0.3]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshPhysicalMaterial
          color="#ffed4e"
          metalness={0.8}
          roughness={0.2}
          clearcoat={1}
        />
      </mesh>
    </group>
  );
};

const Crown = () => {
  const crownRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (crownRef.current) {
      crownRef.current.rotation.y = clock.getElapsedTime() * 0.5;
      crownRef.current.position.y = Math.sin(clock.getElapsedTime() * 2) * 0.1 + 1.2;
    }
  });

  return (
    <group ref={crownRef} position={[0, 1.2, 0]}>
      <mesh>
        <cylinderGeometry args={[0.5, 0.6, 0.3, 8]} />
        <meshPhysicalMaterial
          color="#ffd700"
          metalness={1}
          roughness={0}
          emissive="#ffd700"
          emissiveIntensity={0.3}
        />
      </mesh>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.5, 0.3, Math.sin(angle) * 0.5]}
          >
            <coneGeometry args={[0.1, 0.4, 4]} />
            <meshPhysicalMaterial
              color="#ffd700"
              metalness={1}
              roughness={0}
              emissive="#ffd700"
              emissiveIntensity={0.5}
            />
          </mesh>
        );
      })}
    </group>
  );
};

const LightRays = () => {
  return (
    <>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
        const angle = (i / 12) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 8, 0, Math.sin(angle) * 8]}
            rotation={[0, -angle, 0]}
          >
            <planeGeometry args={[0.1, 20]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.1}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </>
  );
};

export const WingsOfFreedom = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-[#1a4d80] via-[#87ceeb] to-[#ffffff]">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[0, 5, 5]} intensity={2} color="#ffd700" />
        <spotLight position={[0, 10, 0]} angle={0.5} intensity={3} color="#ffffff" />
        
        <LightRays />
        
        <Float speed={1} rotationIntensity={0.3} floatIntensity={0.5}>
          <group>
            <EagleBody />
            <Wing side="left" />
            <Wing side="right" />
            <Crown />
          </group>
        </Float>
      </Canvas>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 drop-shadow-2xl text-white">Wings of Freedom</h1>
          <p className="text-xl opacity-80 text-white">Majestic Polish Eagle</p>
        </div>
      </div>
    </div>
  );
};
