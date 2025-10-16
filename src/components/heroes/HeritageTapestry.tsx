import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

function FabricWave() {
  const meshRef = useRef<THREE.Mesh>(null);
  const prefersReducedMotion = useReducedMotion();

  const geometry = new THREE.PlaneGeometry(12, 8, 80, 60);

  useFrame((state) => {
    if (meshRef.current && !prefersReducedMotion) {
      const positions = meshRef.current.geometry.attributes.position;
      const time = state.clock.getElapsedTime();

      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);

        const waveX1 = Math.sin(x * 0.5 + time * 1.2) * 0.3;
        const waveY1 = Math.sin(y * 0.5 + time * 1.5) * 0.2;

        const z = waveX1 + waveY1;
        positions.setZ(i, z);
      }

      positions.needsUpdate = true;
      meshRef.current.geometry.computeVertexNormals();
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshPhysicalMaterial
        color="#DC143C"
        roughness={0.7}
        metalness={0.1}
        side={THREE.DoubleSide}
        normalScale={new THREE.Vector2(0.5, 0.5)}
      />
    </mesh>
  );
}

function PolishPattern({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={1} rotationIntensity={0.3} floatIntensity={0.5}>
      <group position={position}>
        {/* Folk pattern elements */}
        <mesh>
          <torusGeometry args={[0.4, 0.1, 16, 32]} />
          <meshPhysicalMaterial
            color="#FFD700"
            emissive="#FFD700"
            emissiveIntensity={0.3}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <octahedronGeometry args={[0.25, 0]} />
          <meshPhysicalMaterial
            color="#FFFFFF"
            emissive="#FFFFFF"
            emissiveIntensity={0.2}
            roughness={0.3}
          />
        </mesh>
      </group>
    </Float>
  );
}

function LightThreads() {
  const linesRef = useRef<THREE.LineSegments>(null);
  const prefersReducedMotion = useReducedMotion();

  const points = [];
  const colors = [];
  
  for (let i = 0; i < 50; i++) {
    const t = i / 50;
    const x = (Math.random() - 0.5) * 10;
    const y = (Math.random() - 0.5) * 6;
    const z = (Math.random() - 0.5) * 4;
    
    points.push(new THREE.Vector3(x, y, z));
    
    const color = new THREE.Color();
    color.setHSL(0, 0.8, 0.5 + Math.random() * 0.3);
    colors.push(color.r, color.g, color.b);
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  useFrame((state) => {
    if (linesRef.current && !prefersReducedMotion) {
      linesRef.current.rotation.z = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.4}
        linewidth={2}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

export const HeritageTapestry = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="w-full h-full bg-gradient-to-b from-[#2C0A0A] to-[#0A0202]">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
      >
        {/* Museum exhibition lighting */}
        <ambientLight intensity={0.3} color="#FFE4E1" />
        <spotLight position={[5, 8, 5]} intensity={2} color="#FFD700" angle={0.4} penumbra={1} />
        <spotLight position={[-5, 5, 3]} intensity={1.5} color="#DC143C" angle={0.4} penumbra={1} />
        <directionalLight position={[0, 5, 2]} intensity={1} color="#FFFFFF" />
        
        <FabricWave />
        <PolishPattern position={[-3, 2, 2]} />
        <PolishPattern position={[3, -1, 2]} />
        <PolishPattern position={[0, 1, 3]} />
        <PolishPattern position={[-2, -2, 2.5]} />
        <LightThreads />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!prefersReducedMotion}
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 2.5}
        />
      </Canvas>
    </div>
  );
};
