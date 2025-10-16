import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { MeshDistortMaterial } from '@react-three/drei';

const Portal = () => {
  const portalRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (portalRef.current) {
      portalRef.current.rotation.z = clock.getElapsedTime() * 0.5;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <group>
      <mesh ref={portalRef}>
        <torusGeometry args={[3, 0.8, 32, 100]} />
        <MeshDistortMaterial
          color="#4169e1"
          metalness={0.9}
          roughness={0.1}
          distort={0.4}
          speed={3}
          emissive="#4169e1"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      <group ref={ringRef}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 3.5, Math.sin(angle) * 3.5, 0]}
            >
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshPhysicalMaterial
                color="#ffd700"
                metalness={1}
                roughness={0}
                emissive="#ffd700"
                emissiveIntensity={1}
              />
            </mesh>
          );
        })}
      </group>
      
      <mesh>
        <circleGeometry args={[2.2, 64]} />
        <meshBasicMaterial color="#000033" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const HistoricalElements = ({ side }: { side: 'past' | 'present' }) => {
  const groupRef = useRef<THREE.Group>(null);
  const xPosition = side === 'past' ? -6 : 6;
  const rotationDirection = side === 'past' ? 1 : -1;

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003 * rotationDirection;
    }
  });

  const colors = side === 'past' 
    ? ['#8b4513', '#a0522d', '#cd853f'] 
    : ['#c0c0c0', '#d3d3d3', '#ffffff'];

  return (
    <group ref={groupRef} position={[xPosition, 0, -5]}>
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[1, 2, 1]} />
        <meshPhysicalMaterial
          color={colors[0]}
          metalness={0.6}
          roughness={0.4}
          transparent
          opacity={0.7}
        />
      </mesh>
      <mesh position={[1.5, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 3, 8]} />
        <meshPhysicalMaterial
          color={colors[1]}
          metalness={0.7}
          roughness={0.3}
          transparent
          opacity={0.7}
        />
      </mesh>
      <mesh position={[-1.5, -1, 0]}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshPhysicalMaterial
          color={colors[2]}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
};

const EnergyParticles = () => {
  const count = 800;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const radius = 2 + Math.random() * 3;
    
    positions[i * 3] = Math.cos(theta) * radius;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
    positions[i * 3 + 2] = Math.sin(theta) * radius;
    
    const color = new THREE.Color();
    color.setHSL(Math.random() * 0.2 + 0.55, 1, 0.5);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  const pointsRef = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const theta = Math.atan2(positions[i * 3 + 2], positions[i * 3]);
        const newTheta = theta + 0.01;
        const radius = Math.sqrt(positions[i * 3] ** 2 + positions[i * 3 + 2] ** 2);
        
        positions[i * 3] = Math.cos(newTheta) * radius;
        positions[i * 3 + 2] = Math.sin(newTheta) * radius;
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
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.08} vertexColors transparent opacity={0.8} />
    </points>
  );
};

export const TimePortal = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-[#000033] via-[#191970] to-[#4169e1]">
      <Canvas camera={{ position: [0, 0, 10], fov: 65 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 0, 5]} intensity={2} color="#4169e1" />
        <pointLight position={[0, 0, -5]} intensity={1.5} color="#ffd700" />
        <spotLight position={[0, 10, 0]} angle={0.6} intensity={2} color="#ffffff" />
        
        <Portal />
        <EnergyParticles />
        <HistoricalElements side="past" />
        <HistoricalElements side="present" />
        
        <fog attach="fog" args={['#191970', 8, 20]} />
      </Canvas>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4 drop-shadow-2xl">Time Portal</h1>
          <p className="text-xl opacity-80">Past Meets Present</p>
        </div>
      </div>
    </div>
  );
};
