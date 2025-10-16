import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { Stars, Float } from '@react-three/drei';

const AuroraWaves = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime();
    }
  });

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float time;
    
    void main() {
      vUv = uv;
      vPosition = position;
      
      vec3 pos = position;
      pos.z += sin(pos.x * 2.0 + time) * 0.3;
      pos.z += cos(pos.y * 1.5 + time * 0.7) * 0.2;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float time;
    
    void main() {
      vec2 uv = vUv;
      
      float wave1 = sin(uv.x * 3.0 + time * 0.5) * 0.5 + 0.5;
      float wave2 = sin(uv.x * 5.0 - time * 0.3) * 0.5 + 0.5;
      float wave3 = sin(uv.y * 2.0 + time * 0.4) * 0.5 + 0.5;
      
      vec3 color1 = vec3(0.0, 1.0, 0.5); // Green
      vec3 color2 = vec3(0.0, 0.5, 1.0); // Blue
      vec3 color3 = vec3(0.5, 0.0, 1.0); // Purple
      
      vec3 finalColor = mix(color1, color2, wave1);
      finalColor = mix(finalColor, color3, wave2 * wave3);
      
      float alpha = (wave1 + wave2 + wave3) / 3.0 * 0.7;
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

  return (
    <mesh ref={meshRef} position={[0, 2, -5]} rotation={[0.3, 0, 0]}>
      <planeGeometry args={[20, 8, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          time: { value: 0 }
        }}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const SnowParticles = () => {
  const count = 500;
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = Math.random() * 20 - 5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }

  const pointsRef = useRef<THREE.Points>(null);

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0002;
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
      <pointsMaterial size={0.05} color="#ffffff" transparent opacity={0.6} />
    </points>
  );
};

const PolishLandscape = () => {
  return (
    <group position={[0, -2, -8]}>
      <mesh position={[-3, 0, 0]}>
        <coneGeometry args={[1.5, 3, 8]} />
        <meshStandardMaterial color="#1a2f1a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, -2]}>
        <coneGeometry args={[2, 4, 8]} />
        <meshStandardMaterial color="#0d1f0d" roughness={0.8} />
      </mesh>
      <mesh position={[3, 0, -1]}>
        <coneGeometry args={[1.8, 3.5, 8]} />
        <meshStandardMaterial color="#1a2f1a" roughness={0.8} />
      </mesh>
    </group>
  );
};

export const AuroraBorealis = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#2a2a4a]">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[0, 5, 5]} intensity={0.5} color="#ffffff" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
        <AuroraWaves />
        <SnowParticles />
        <PolishLandscape />
        
        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
          <pointLight position={[0, 3, 0]} intensity={2} color="#00ff88" distance={10} />
        </Float>
      </Canvas>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4 drop-shadow-2xl">Aurora Borealis</h1>
          <p className="text-xl opacity-80">Northern Lights over Polish Landscapes</p>
        </div>
      </div>
    </div>
  );
};
