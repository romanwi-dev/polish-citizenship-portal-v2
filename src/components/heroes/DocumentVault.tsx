import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { Float, useTexture } from '@react-three/drei';

const Document = ({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) => {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh position={position} rotation={rotation} castShadow>
        <boxGeometry args={[1.5, 2, 0.02]} />
        <meshPhysicalMaterial
          color="#f5f5dc"
          metalness={0.1}
          roughness={0.8}
          clearcoat={0.5}
          clearcoatRoughness={0.3}
        />
      </mesh>
    </Float>
  );
};

const LightBeams = () => {
  const beamRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (beamRef.current) {
      beamRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group ref={beamRef}>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 2, 5, Math.sin(angle) * 2]}
            rotation={[Math.PI, 0, 0]}
          >
            <coneGeometry args={[0.3, 10, 32, 1, true]} />
            <meshBasicMaterial
              color="#ffd700"
              transparent
              opacity={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
};

const VaultWalls = () => {
  return (
    <group>
      <mesh position={[0, 0, -8]} receiveShadow>
        <planeGeometry args={[20, 15]} />
        <meshPhysicalMaterial
          color="#1a1a1a"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[-8, 0, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[16, 15]} />
        <meshPhysicalMaterial
          color="#252525"
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[8, 0, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[16, 15]} />
        <meshPhysicalMaterial
          color="#252525"
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 16]} />
        <meshPhysicalMaterial
          color="#0d0d0d"
          metalness={0.7}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
};

const DustParticles = () => {
  const count = 1000;
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 15;
    positions[i * 3 + 1] = Math.random() * 10 - 3;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
  }

  const pointsRef = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] -= 0.005;
        if (positions[i * 3 + 1] < -5) {
          positions[i * 3 + 1] = 5;
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#ffd700" transparent opacity={0.4} />
    </points>
  );
};

export const DocumentVault = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} shadows>
        <ambientLight intensity={0.1} />
        <spotLight position={[0, 8, 0]} angle={0.4} intensity={3} color="#ffd700" castShadow />
        <pointLight position={[5, 3, 5]} intensity={0.5} color="#ffffff" />
        <pointLight position={[-5, 3, 5]} intensity={0.5} color="#ffffff" />
        
        <VaultWalls />
        <LightBeams />
        <DustParticles />
        
        <Document position={[-2, 1, 0]} rotation={[0.2, 0.3, 0]} />
        <Document position={[2, 0.5, -1]} rotation={[-0.1, -0.4, 0.1]} />
        <Document position={[0, -1, 1]} rotation={[0.3, 0, -0.2]} />
        <Document position={[-1, 2, -2]} rotation={[-0.2, 0.5, 0.1]} />
        <Document position={[1.5, -0.5, 0.5]} rotation={[0.1, -0.2, 0]} />
        
        <fog attach="fog" args={['#0a0a0a', 5, 20]} />
      </Canvas>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4 drop-shadow-2xl">Document Vault</h1>
          <p className="text-xl opacity-80">Secure Archive Chamber</p>
        </div>
      </div>
    </div>
  );
};
