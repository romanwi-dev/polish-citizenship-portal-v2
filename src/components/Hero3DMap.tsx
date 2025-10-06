import { useRef, useMemo, memo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import heroEuFlag from '@/assets/hero-eu-flag.jpg';

const MapPlane = memo(function MapPlane() {
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
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial 
          map={texture} 
          transparent
          opacity={0.95}
          side={THREE.DoubleSide}
          metalness={0.2}
          roughness={0.5}
        />
      </mesh>
    </Float>
  );
});

const Hero3DMap = memo(() => {
  return (
    <div className="w-full h-full">
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 75 }}
        dpr={[1, 1.5]} // Limit pixel ratio for better performance
        performance={{ min: 0.5 }} // Allow frame rate throttling
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.6} color="#5b8dce" />
        
        <MapPlane />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate
          autoRotateSpeed={0.2}
          maxPolarAngle={Math.PI / 1.8} 
          minPolarAngle={Math.PI / 2.2}
          enableDamping={false} // Disable damping for better performance
        />
      </Canvas>
    </div>
  );
});

Hero3DMap.displayName = "Hero3DMap";

export default Hero3DMap;
