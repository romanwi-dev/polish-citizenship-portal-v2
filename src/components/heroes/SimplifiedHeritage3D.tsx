import { memo, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Simplified 3D for tablets/low-power devices
 * - Reduced vertex count: 40×30 (vs 80×60)
 * - No particle system
 * - No floating patterns
 * - Just the iconic fabric wave
 */
const SimplifiedFabricWave = memo(() => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Reduced grid: 40×30 (75% fewer vertices than full version)
  const geometry = useMemo(
    () => new THREE.PlaneGeometry(20, 15, 40, 30),
    []
  );

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;
    const positions = geometry.attributes.position;

    // Simplified wave calculation
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);

      const waveX = Math.sin(x * 0.3 + time * 0.3) * 0.3;
      const waveY = Math.sin(y * 0.3 + time * 0.2) * 0.3;
      
      positions.setZ(i, waveX + waveY);
    }

    positions.needsUpdate = true;
  });

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, 0, -5]}>
      <meshPhysicalMaterial
        color="#8B0000"
        metalness={0.3}
        roughness={0.4}
        transparent
        opacity={0.15}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
});

SimplifiedFabricWave.displayName = 'SimplifiedFabricWave';

export const SimplifiedHeritage3D = memo(() => {
  return (
    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-background via-background to-background/95">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        dpr={[0.5, 1]} // Lower pixel ratio for performance
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.4} />
        
        <SimplifiedFabricWave />
      </Canvas>
    </div>
  );
});

SimplifiedHeritage3D.displayName = 'SimplifiedHeritage3D';
