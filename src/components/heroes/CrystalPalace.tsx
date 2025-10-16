import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { Float, MeshTransmissionMaterial, Sparkles } from '@react-three/drei';

const EUStarCrystal = ({ position, scale, delay }: { position: [number, number, number], scale: number, delay: number }) => {
  const starRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (starRef.current) {
      starRef.current.rotation.y = clock.getElapsedTime() * 0.3 + delay;
      starRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() + delay) * 0.3;
    }
  });

  const points: [number, number][] = [];
  const numPoints = 5;
  const outerRadius = 1;
  const innerRadius = 0.4;

  for (let i = 0; i < numPoints * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / numPoints;
    points.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
  }

  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  points.forEach((point) => shape.lineTo(point[0], point[1]));
  shape.closePath();

  return (
    <group ref={starRef} position={position} scale={scale}>
      <mesh>
        <extrudeGeometry
          args={[
            shape,
            {
              depth: 0.2,
              bevelEnabled: true,
              bevelThickness: 0.05,
              bevelSize: 0.05,
              bevelSegments: 3,
            },
          ]}
        />
        <MeshTransmissionMaterial
          background={new THREE.Color('#003399')}
          backside
          samples={16}
          resolution={512}
          transmission={1}
          roughness={0.1}
          thickness={0.5}
          ior={1.5}
          chromaticAberration={0.06}
          anisotropy={0.3}
          distortion={0.1}
          distortionScale={0.2}
          temporalDistortion={0.1}
          clearcoat={1}
          attenuationDistance={0.5}
          attenuationColor="#ffcc00"
          color="#003399"
        />
      </mesh>
    </group>
  );
};

const CrystalPillar = ({ position, height }: { position: [number, number, number], height: number }) => {
  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.6}>
      <mesh position={position}>
        <cylinderGeometry args={[0.3, 0.4, height, 6]} />
        <MeshTransmissionMaterial
          background={new THREE.Color('#ffffff')}
          backside
          samples={8}
          resolution={256}
          transmission={0.95}
          roughness={0.05}
          thickness={1}
          ior={2.4}
          chromaticAberration={0.1}
          clearcoat={1}
          color="#e6f3ff"
        />
      </mesh>
    </Float>
  );
};

const HolographicFlag = () => {
  const flagRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (flagRef.current) {
      const geometry = flagRef.current.geometry as THREE.PlaneGeometry;
      const positions = geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        positions[i + 2] = Math.sin(x * 2 + clock.getElapsedTime() * 2) * 0.1 +
                          Math.cos(y * 2 + clock.getElapsedTime()) * 0.1;
      }
      
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
    }
  });

  return (
    <mesh ref={flagRef} position={[0, 3, -3]}>
      <planeGeometry args={[4, 2.5, 32, 32]} />
      <meshPhysicalMaterial
        color="#003399"
        metalness={0.7}
        roughness={0.3}
        transparent
        opacity={0.7}
        side={THREE.DoubleSide}
        emissive="#ffcc00"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
};

const ReflectiveFloor = () => {
  return (
    <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshPhysicalMaterial
        color="#e6f3ff"
        metalness={1}
        roughness={0.05}
        clearcoat={1}
        clearcoatRoughness={0.1}
        envMapIntensity={1}
      />
    </mesh>
  );
};

export const CrystalPalace = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-[#001a4d] via-[#003399] to-[#0059b3]">
      <Canvas camera={{ position: [0, 2, 12], fov: 60 }} shadows>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" castShadow />
        <pointLight position={[0, 8, 0]} intensity={2} color="#ffcc00" />
        <pointLight position={[-5, 5, 5]} intensity={1.5} color="#003399" />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#003399" />
        <spotLight position={[0, 15, 0]} angle={0.5} intensity={3} color="#ffffff" castShadow />
        
        <Sparkles count={300} scale={15} size={3} speed={0.2} color="#ffffff" />
        
        <ReflectiveFloor />
        <HolographicFlag />
        
        <EUStarCrystal position={[0, 0, 0]} scale={1.5} delay={0} />
        <EUStarCrystal position={[-4, 1, -2]} scale={0.8} delay={1} />
        <EUStarCrystal position={[4, 1.5, -2]} scale={0.9} delay={2} />
        <EUStarCrystal position={[-3, -1, 2]} scale={0.7} delay={3} />
        <EUStarCrystal position={[3, 0.5, 2]} scale={0.85} delay={4} />
        
        <CrystalPillar position={[-6, 0, -4]} height={8} />
        <CrystalPillar position={[6, 0, -4]} height={8} />
        <CrystalPillar position={[-6, 0, 4]} height={6} />
        <CrystalPillar position={[6, 0, 4]} height={6} />
        
        <fog attach="fog" args={['#003399', 10, 30]} />
      </Canvas>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4 drop-shadow-2xl">Crystal Palace</h1>
          <p className="text-xl opacity-80">Holographic EU Chamber</p>
        </div>
      </div>
    </div>
  );
};
