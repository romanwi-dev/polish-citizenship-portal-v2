import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { Float, Sparkles, MeshDistortMaterial } from '@react-three/drei';

const Crown = () => {
  const crownRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (crownRef.current) {
      crownRef.current.rotation.y = clock.getElapsedTime() * 0.3;
      crownRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.2;
    }
  });

  return (
    <group ref={crownRef} position={[0, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[2, 2.3, 1, 16]} />
        <meshPhysicalMaterial
          color="#ffd700"
          metalness={1}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0}
          emissive="#ffa500"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <group key={i}>
            <mesh
              position={[Math.cos(angle) * 2.2, 0.8, Math.sin(angle) * 2.2]}
              rotation={[0, angle, 0]}
            >
              <coneGeometry args={[0.3, 1.5, 4]} />
              <meshPhysicalMaterial
                color="#ffd700"
                metalness={1}
                roughness={0}
                emissive="#ffd700"
                emissiveIntensity={0.5}
              />
            </mesh>
            
            <mesh position={[Math.cos(angle) * 2.2, 1.6, Math.sin(angle) * 2.2]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshPhysicalMaterial
                color="#dc143c"
                metalness={0.3}
                roughness={0.1}
                transparent
                opacity={0.9}
                emissive="#dc143c"
                emissiveIntensity={0.8}
                clearcoat={1}
              />
            </mesh>
          </group>
        );
      })}
      
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshPhysicalMaterial
          color="#ffffff"
          metalness={0.2}
          roughness={0}
          transparent
          opacity={1}
          clearcoat={1}
          emissive="#ffffff"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
};

const Scepter = () => {
  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={1}>
      <group position={[-4, -1, 2]} rotation={[0, 0, -Math.PI / 6]}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.1, 4, 16]} />
          <meshPhysicalMaterial
            color="#ffd700"
            metalness={1}
            roughness={0.2}
            clearcoat={1}
          />
        </mesh>
        
        <mesh position={[0, 2.2, 0]}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <MeshDistortMaterial
            color="#4169e1"
            metalness={0.5}
            roughness={0.1}
            distort={0.3}
            speed={2}
            emissive="#4169e1"
            emissiveIntensity={0.5}
          />
        </mesh>
        
        {[0, 1, 2, 3].map((i) => {
          const angle = (i / 4) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * 0.3,
                1.8,
                Math.sin(angle) * 0.3
              ]}
            >
              <coneGeometry args={[0.08, 0.5, 4]} />
              <meshPhysicalMaterial
                color="#ffd700"
                metalness={1}
                roughness={0}
              />
            </mesh>
          );
        })}
      </group>
    </Float>
  );
};

const Orb = () => {
  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.8}>
      <group position={[4, -0.5, 1]}>
        <mesh>
          <sphereGeometry args={[0.8, 64, 64]} />
          <meshPhysicalMaterial
            color="#ffd700"
            metalness={1}
            roughness={0.1}
            clearcoat={1}
            clearcoatRoughness={0}
          />
        </mesh>
        
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.9, 0.05, 16, 100]} />
          <meshPhysicalMaterial
            color="#ffd700"
            metalness={1}
            roughness={0}
            emissive="#ffd700"
            emissiveIntensity={0.3}
          />
        </mesh>
        
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.5, 16]} />
          <meshPhysicalMaterial
            color="#ffd700"
            metalness={1}
            roughness={0}
          />
        </mesh>
        
        <mesh position={[0, 1.5, 0]}>
          <coneGeometry args={[0.2, 0.4, 4]} />
          <meshPhysicalMaterial
            color="#ffd700"
            metalness={1}
            roughness={0}
          />
        </mesh>
      </group>
    </Float>
  );
};

const VelvetBase = () => {
  return (
    <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshPhysicalMaterial
        color="#8b0000"
        metalness={0.1}
        roughness={0.9}
      />
    </mesh>
  );
};

const GoldenRays = () => {
  return (
    <>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => {
        const angle = (i / 16) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 10, 0, Math.sin(angle) * 10]}
            rotation={[0, -angle, 0]}
          >
            <planeGeometry args={[0.15, 25]} />
            <meshBasicMaterial
              color="#ffd700"
              transparent
              opacity={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </>
  );
};

export const CrownJewels = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-[#1a0000] via-[#4d0000] to-[#800000]">
      <Canvas camera={{ position: [0, 2, 10], fov: 60 }} shadows>
        <ambientLight intensity={0.3} />
        <spotLight position={[0, 10, 0]} angle={0.4} intensity={5} color="#ffd700" castShadow />
        <pointLight position={[5, 5, 5]} intensity={2} color="#ffd700" />
        <pointLight position={[-5, 5, 5]} intensity={2} color="#ffd700" />
        <directionalLight position={[0, 5, 10]} intensity={1} color="#ffffff" />
        
        <Sparkles count={400} scale={20} size={4} speed={0.2} color="#ffd700" />
        <GoldenRays />
        
        <VelvetBase />
        <Crown />
        <Scepter />
        <Orb />
        
        <fog attach="fog" args={['#4d0000', 8, 25]} />
      </Canvas>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4 drop-shadow-2xl">Crown Jewels</h1>
          <p className="text-xl opacity-80">Royal Regalia of Poland</p>
        </div>
      </div>
    </div>
  );
};
