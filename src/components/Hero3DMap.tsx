import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import heroEuFlag from '@/assets/hero-eu-flag.jpg';

function FloatingStars() {
  const starsRef = useRef<THREE.Group>(null);
  
  const starPositions = useMemo(() => [
    { x: -3, y: 2, z: 0, size: 0.4 },
    { x: -2, y: 3, z: -1, size: 0.35 },
    { x: -1, y: 1.5, z: 0.5, size: 0.3 },
    { x: 1, y: 2.5, z: -0.5, size: 0.35 },
    { x: 2.5, y: 1, z: 0, size: 0.3 },
    { x: 3, y: 3, z: -1, size: 0.4 },
    { x: 0, y: -2, z: 0.5, size: 0.35 },
    { x: -2.5, y: -1, z: -0.5, size: 0.3 },
    { x: 2, y: -2.5, z: 0, size: 0.35 },
    { x: 0.5, y: 0, z: 1, size: 0.3 },
    { x: -1.5, y: 0.5, z: 1, size: 0.32 },
    { x: 1.5, y: -0.5, z: 1, size: 0.28 },
  ], []);

  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1;
    }
  });

  return (
    <group ref={starsRef}>
      {starPositions.map((star, i) => (
        <Float 
          key={i} 
          speed={1.5 + Math.random()} 
          rotationIntensity={0.5} 
          floatIntensity={0.5}
        >
          <mesh position={[star.x, star.y, star.z]}>
            {/* Star shape using extruded geometry */}
            <mesh>
              <cylinderGeometry args={[0.05, 0.15, star.size, 5]} />
              <meshStandardMaterial 
                color="#ffd700" 
                emissive="#ffd700" 
                emissiveIntensity={0.6}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
            {/* Star glow */}
            <mesh scale={1.5}>
              <sphereGeometry args={[star.size * 0.6, 16, 16]} />
              <meshBasicMaterial 
                color="#ffd700" 
                transparent 
                opacity={0.3}
              />
            </mesh>
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function MapPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, heroEuFlag);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1;
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial 
          map={texture} 
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
    </Float>
  );
}

function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 1000;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
      particlesRef.current.rotation.x = state.clock.getElapsedTime() * 0.01;
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
        color="#5b8dce" 
        transparent 
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export const Hero3DMap = () => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#5b8dce" />
        <spotLight 
          position={[0, 5, 5]} 
          intensity={1} 
          angle={0.5} 
          penumbra={1} 
          color="#ffd700" 
        />
        
        <MapPlane />
        <FloatingStars />
        <ParticleField />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 1.5} 
          minPolarAngle={Math.PI / 2.5} 
        />
      </Canvas>
    </div>
  );
};
