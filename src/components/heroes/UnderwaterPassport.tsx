import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { Float } from '@react-three/drei';

const Passport = () => {
  const passportRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (passportRef.current) {
      passportRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.2;
      passportRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.4) * 0.1;
    }
  });

  return (
    <group ref={passportRef} position={[0, 0, 0]}>
      <mesh>
        <boxGeometry args={[2, 2.8, 0.1]} />
        <meshPhysicalMaterial
          color="#8b0000"
          metalness={0.3}
          roughness={0.4}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
        />
      </mesh>
      
      <mesh position={[0, 0.5, 0.06]}>
        <circleGeometry args={[0.6, 32]} />
        <meshPhysicalMaterial
          color="#ffd700"
          metalness={0.9}
          roughness={0.1}
          emissive="#ffa500"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      <mesh position={[0, -0.3, 0.06]}>
        <boxGeometry args={[1.5, 0.2, 0.02]} />
        <meshPhysicalMaterial
          color="#ffffff"
          metalness={0.1}
          roughness={0.9}
        />
      </mesh>
      
      <mesh position={[0, -0.6, 0.06]}>
        <boxGeometry args={[1.3, 0.15, 0.02]} />
        <meshPhysicalMaterial
          color="#ffffff"
          metalness={0.1}
          roughness={0.9}
        />
      </mesh>
    </group>
  );
};

const Fish = ({ position, scale, speed, color }: { position: [number, number, number], scale: number, speed: number, color: string }) => {
  const fishRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (fishRef.current) {
      const time = clock.getElapsedTime() * speed;
      fishRef.current.position.x = position[0] + Math.sin(time) * 3;
      fishRef.current.position.y = position[1] + Math.cos(time * 0.7) * 1.5;
      fishRef.current.rotation.y = Math.sin(time) * 0.5;
    }
  });

  return (
    <group ref={fishRef} position={position} scale={scale}>
      <mesh>
        <coneGeometry args={[0.3, 1, 8]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.6}
          roughness={0.3}
          transparent
          opacity={0.85}
          clearcoat={1}
        />
      </mesh>
      <mesh position={[-0.4, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <coneGeometry args={[0.2, 0.5, 3]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.6}
          roughness={0.3}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
};

const CoralReef = ({ position, color }: { position: [number, number, number], color: string }) => {
  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group position={position}>
        {[0, 1, 2, 3].map((i) => {
          const angle = (i / 4) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.3, i * 0.3, Math.sin(angle) * 0.3]}
            >
              <cylinderGeometry args={[0.1 + i * 0.05, 0.05, 0.8, 8]} />
              <meshPhysicalMaterial
                color={color}
                metalness={0.2}
                roughness={0.8}
              />
            </mesh>
          );
        })}
      </group>
    </Float>
  );
};

const Bubbles = () => {
  const count = 100;
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 15;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    scales[i] = Math.random() * 0.2 + 0.05;
  }

  const bubblesRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (bubblesRef.current) {
      bubblesRef.current.children.forEach((bubble, i) => {
        bubble.position.y += 0.01 + scales[i] * 0.02;
        if (bubble.position.y > 6) {
          bubble.position.y = -6;
        }
      });
    }
  });

  return (
    <group ref={bubblesRef}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh
          key={i}
          position={[positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]]}
        >
          <sphereGeometry args={[scales[i], 16, 16]} />
          <meshPhysicalMaterial
            color="#ffffff"
            metalness={0}
            roughness={0}
            transparent
            opacity={0.3}
            clearcoat={1}
            clearcoatRoughness={0}
          />
        </mesh>
      ))}
    </group>
  );
};

const CausticLight = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.time.value = clock.getElapsedTime();
    }
  });

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float time;
    varying vec2 vUv;
    
    void main() {
      vec2 uv = vUv * 5.0;
      float wave1 = sin(uv.x * 3.0 + time) * 0.5 + 0.5;
      float wave2 = sin(uv.y * 3.0 - time * 0.7) * 0.5 + 0.5;
      float caustic = wave1 * wave2;
      
      vec3 color = vec3(0.4, 0.7, 1.0);
      float alpha = caustic * 0.2;
      
      gl_FragColor = vec4(color, alpha);
    }
  `;

  return (
    <mesh ref={meshRef} position={[0, -4, -5]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[20, 20]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{ time: { value: 0 } }}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export const UnderwaterPassport = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-[#001a33] via-[#003d5c] to-[#006994]">
      <Canvas camera={{ position: [0, 0, 8], fov: 70 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[0, 10, 5]} intensity={1} color="#4da6d6" />
        <pointLight position={[0, 5, 5]} intensity={2} color="#66ccff" />
        <pointLight position={[-5, 0, 3]} intensity={1} color="#4da6d6" />
        <pointLight position={[5, 0, 3]} intensity={1} color="#4da6d6" />
        
        <CausticLight />
        <Bubbles />
        
        <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.3}>
          <Passport />
        </Float>
        
        <Fish position={[-3, 2, -2]} scale={1} speed={0.5} color="#ff6b35" />
        <Fish position={[3, 1, -3]} scale={0.8} speed={0.7} color="#f7931e" />
        <Fish position={[-2, -1, 1]} scale={1.2} speed={0.4} color="#c1292e" />
        <Fish position={[2, -2, 0]} scale={0.9} speed={0.6} color="#ff8c42" />
        
        <CoralReef position={[-5, -3, -4]} color="#ff6b9d" />
        <CoralReef position={[5, -3, -5]} color="#c06c84" />
        <CoralReef position={[-3, -3, -2]} color="#6c5b7b" />
        <CoralReef position={[4, -3, -3]} color="#f67280" />
        
        <fog attach="fog" args={['#006994', 5, 20]} />
      </Canvas>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4 drop-shadow-2xl">Underwater Journey</h1>
          <p className="text-xl opacity-80">Passport to New Depths</p>
        </div>
      </div>
    </div>
  );
};
