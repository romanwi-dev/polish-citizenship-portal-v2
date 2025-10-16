import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { Cloud, Sparkles } from '@react-three/drei';

const StormClouds = () => {
  const cloudRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (cloudRef.current) {
      cloudRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.1) * 0.3;
    }
  });

  return (
    <group ref={cloudRef}>
      <Cloud
        position={[-5, 3, -8]}
        speed={0.2}
        opacity={0.8}
        color="#2c3e50"
        segments={40}
        bounds={[6, 3, 3]}
        volume={8}
      />
      <Cloud
        position={[5, 2, -10]}
        speed={0.15}
        opacity={0.7}
        color="#34495e"
        segments={40}
        bounds={[5, 3, 3]}
        volume={7}
      />
      <Cloud
        position={[0, 4, -12]}
        speed={0.25}
        opacity={0.9}
        color="#1a252f"
        segments={40}
        bounds={[7, 4, 4]}
        volume={10}
      />
    </group>
  );
};

const SunRays = () => {
  const raysRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (raysRef.current) {
      raysRef.current.rotation.z = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group ref={raysRef} position={[0, 3, -5]}>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
        const angle = (i / 12) * Math.PI * 2;
        const length = 15 + Math.random() * 5;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 2, Math.sin(angle) * 2, 0]}
            rotation={[0, 0, angle]}
          >
            <planeGeometry args={[0.3, length]} />
            <meshBasicMaterial
              color="#ffd700"
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
};

const Sun = () => {
  const sunRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (sunRef.current) {
      const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.05;
      sunRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <mesh ref={sunRef} position={[0, 3, -5]}>
      <sphereGeometry args={[1.5, 64, 64]} />
      <meshStandardMaterial
        color="#ffeb3b"
        emissive="#ffeb3b"
        emissiveIntensity={1}
      />
    </mesh>
  );
};

const Lightning = ({ position, delay }: { position: [number, number, number], delay: number }) => {
  const lightningRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (lightningRef.current) {
      const time = clock.getElapsedTime() + delay;
      const visible = Math.floor(time * 4) % 8 < 1;
      lightningRef.current.visible = visible;
    }
  });

  return (
    <group ref={lightningRef} position={position}>
      <mesh>
        <boxGeometry args={[0.1, 4, 0.1]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.3, -1.5, 0]}>
        <boxGeometry args={[0.08, 2, 0.08]} />
        <meshStandardMaterial color="#e0f7fa" emissive="#e0f7fa" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-0.2, -2.5, 0]}>
        <boxGeometry args={[0.08, 1.5, 0.08]} />
        <meshStandardMaterial color="#b3e5fc" emissive="#b3e5fc" emissiveIntensity={2} />
      </mesh>
    </group>
  );
};

const RainParticles = () => {
  const count = 2000;
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = Math.random() * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
  }

  const pointsRef = useRef<THREE.Points>(null);

  useFrame(() => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] -= 0.15;
        if (positions[i * 3 + 1] < -5) {
          positions[i * 3 + 1] = 15;
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
      <pointsMaterial size={0.05} color="#b3e5fc" transparent opacity={0.6} />
    </points>
  );
};

const PolishEagle = () => {
  const eagleRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (eagleRef.current) {
      eagleRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.3;
    }
  });

  return (
    <group ref={eagleRef} position={[0, 0, 2]}>
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial
          color="#ffd700"
          metalness={0.9}
          roughness={0.1}
          clearcoat={1}
          emissive="#ffa500"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      <mesh position={[-1.5, 0.3, 0]}>
        <boxGeometry args={[2, 0.5, 0.2]} />
        <meshPhysicalMaterial
          color="#ffffff"
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[1.5, 0.3, 0]}>
        <boxGeometry args={[2, 0.5, 0.2]} />
        <meshPhysicalMaterial
          color="#ffffff"
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
};

export const StormyRevelation = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[0, 10, 5]} intensity={0.5} color="#ffffff" />
        <pointLight position={[0, 3, -5]} intensity={5} color="#ffeb3b" />
        <pointLight position={[-8, 5, -8]} intensity={1} color="#ffffff" />
        <pointLight position={[8, 5, -8]} intensity={1} color="#ffffff" />
        
        <Sparkles count={150} scale={25} size={2} speed={0.1} color="#ffffff" />
        
        <RainParticles />
        <StormClouds />
        <SunRays />
        <Sun />
        <PolishEagle />
        
        <Lightning position={[-6, 8, -10]} delay={0} />
        <Lightning position={[6, 7, -12]} delay={1.5} />
        <Lightning position={[0, 9, -15]} delay={3} />
        
        <fog attach="fog" args={['#16213e', 8, 30]} />
      </Canvas>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4 drop-shadow-2xl">Stormy Revelation</h1>
          <p className="text-xl opacity-80">Hope Breaking Through Darkness</p>
        </div>
      </div>
    </div>
  );
};
