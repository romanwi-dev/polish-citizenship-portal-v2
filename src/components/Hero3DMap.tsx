import { useRef, memo, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import heroEuFlag from '@/assets/hero-eu-flag.jpg';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useIsMobile } from '@/hooks/use-mobile';

const MapPlane = memo(function MapPlane({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, heroEuFlag);

  useFrame((state) => {
    if (meshRef.current && !prefersReducedMotion) {
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
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  
  // Lower quality on mobile for better performance
  const dpr = useMemo<[number, number]>(() => isMobile ? [0.5, 1] : [1, 1.5], [isMobile]);

  return (
    <div className="w-full h-full">
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 75 }}
        dpr={dpr}
        performance={{ min: 0.5 }}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.6} color="#5b8dce" />
        
        <MapPlane prefersReducedMotion={prefersReducedMotion} />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate={!prefersReducedMotion}
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
