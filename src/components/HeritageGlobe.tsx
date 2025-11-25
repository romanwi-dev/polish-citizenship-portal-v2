import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// --- Settings ---
const GLOBE_RADIUS = 2;
const BRAND_RED = "#DC2626"; 
const DOT_COLOR = "#475569"; // Slate 600

// --- Country Coordinates (Lat, Lon) ---
const COORDINATES: Record<string, { lat: number; lon: number; name: string }> = {
  PL: { lat: 52.0, lon: 20.0, name: "Poland" }, // The Destination
  US: { lat: 40.7, lon: -74.0, name: "USA" },
  GB: { lat: 51.5, lon: -0.1, name: "UK" },
  BR: { lat: -23.5, lon: -46.6, name: "Brazil" },
  IL: { lat: 32.0, lon: 34.8, name: "Israel" },
  CA: { lat: 43.6, lon: -79.3, name: "Canada" },
  AU: { lat: -33.8, lon: 151.2, name: "Australia" },
  ZA: { lat: -30.5, lon: 22.9, name: "South Africa" },
  FR: { lat: 48.8, lon: 2.3, name: "France" },
  DE: { lat: 52.5, lon: 13.4, name: "Germany" },
  AR: { lat: -34.6, lon: -58.3, name: "Argentina" },
  MX: { lat: 19.4, lon: -99.1, name: "Mexico" },
  UA: { lat: 48.3, lon: 31.1, name: "Ukraine" },
  RU: { lat: 55.7, lon: 37.6, name: "Russia" },
  VE: { lat: 10.5, lon: -66.9, name: "Venezuela" },
  CO: { lat: 4.6, lon: -74.1, name: "Colombia" },
};

// --- Helper: Lat/Lon to 3D Vector ---
const getPosition = (lat: number, lon: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

// --- 1. The World Dots ---
const Dots = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 3500; 
  
  const { transform, positions } = useMemo(() => {
    const transform = new THREE.Matrix4();
    const positions: THREE.Vector3[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); 
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const vec = new THREE.Vector3(Math.cos(theta) * radius, y, Math.sin(theta) * radius).multiplyScalar(GLOBE_RADIUS);
      positions.push(vec);
    }
    return { transform, positions };
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (!meshRef.current) return;
    meshRef.current.rotation.y = time * 0.02; 
    
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const scale = (Math.sin(i * 0.1 + time) * 0.5 + 1) * 0.5; 
      dummy.position.copy(positions[i]);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.012, 8, 8]} />
      <meshBasicMaterial color={DOT_COLOR} transparent opacity={0.4} />
    </instancedMesh>
  );
};

// --- 2. The Dynamic Lines (Roots to Poland) ---
const MigrationLines = ({ targetCountry }: { targetCountry?: string }) => {
  const groupRef = useRef<THREE.Group>(null);
  const polandPos = getPosition(COORDINATES.PL.lat, COORDINATES.PL.lon, GLOBE_RADIUS);

  const lines = useMemo(() => {
    let startPoints: THREE.Vector3[] = [];
    
    if (targetCountry && COORDINATES[targetCountry]) {
      // CASE A: Specific Country (15 lines from that region)
      const center = COORDINATES[targetCountry];
      for(let i=0; i<15; i++) {
        // Add random spread so lines don't overlap perfectly
        const spreadLat = center.lat + (Math.random() - 0.5) * 10;
        const spreadLon = center.lon + (Math.random() - 0.5) * 10;
        startPoints.push(getPosition(spreadLat, spreadLon, GLOBE_RADIUS));
      }
    } else {
      // CASE B: Global View (1 line from each major country)
      const keys = Object.keys(COORDINATES).filter(k => k !== 'PL');
      startPoints = keys.map(k => getPosition(COORDINATES[k].lat, COORDINATES[k].lon, GLOBE_RADIUS));
    }

    // Draw Curve to Poland
    return startPoints.map(start => {
      const end = polandPos;
      const dist = start.distanceTo(end);
      // The "Arch" height depends on distance
      const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(GLOBE_RADIUS + (dist * 0.5));
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      return curve.getPoints(40);
    });
  }, [targetCountry]);

  useFrame((state) => {
    if(groupRef.current) groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
  });

  return (
    <group ref={groupRef}>
      {lines.map((points, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={points.length} array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))} itemSize={3} />
          </bufferGeometry>
          <lineBasicMaterial color={BRAND_RED} opacity={0.6} transparent linewidth={1} />
        </line>
      ))}
      
      {/* Poland Marker */}
      <mesh position={polandPos}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color="white" toneMapped={false} />
      </mesh>
    </group>
  );
};

// --- Waving Animation Component ---
const WavingGlobeGroup = ({ children, targetCountry }: { children: React.ReactNode; targetCountry?: string }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Subtle waving/floating animation
    groupRef.current.rotation.x = 0.3 + Math.sin(time * 0.3) * 0.05;
    groupRef.current.rotation.y = time * 0.1 + Math.sin(time * 0.2) * 0.03;
    groupRef.current.position.y = Math.sin(time * 0.4) * 0.1;
  });
  
  return <group ref={groupRef}>{children}</group>;
};

// --- 3. Main Component ---
interface GlobeProps {
  country?: string;
  title?: string;
  asBackground?: boolean;
}

const HeritageGlobe = ({ country, title, asBackground = false }: GlobeProps) => {
  const displayTitle = title || (country && COORDINATES[country] ? `${COORDINATES[country].name} to Poland` : "Global Reach");

  // Background version - no text, full height, behind content
  if (asBackground) {
    return (
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <Suspense fallback={null}>
          <Canvas 
            camera={{ position: [0, 0, 5.5], fov: 50 }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 2]}
            style={{ background: 'transparent' }}
          >
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <pointLight position={[-10, -10, -10]} intensity={0.4} />
            <WavingGlobeGroup targetCountry={country}>
              <Dots />
              <MigrationLines targetCountry={country} />
              <Sphere args={[GLOBE_RADIUS - 0.05, 32, 32]}>
                <meshBasicMaterial color="#020617" transparent opacity={0.3} />
              </Sphere>
            </WavingGlobeGroup>
            <OrbitControls enableZoom={false} autoRotate={false} enablePan={false} />
          </Canvas>
        </Suspense>
      </div>
    );
  }

  // Regular version with text overlay
  return (
    <div className="w-full h-[500px] md:h-[600px] bg-slate-950 rounded-xl overflow-hidden relative shadow-2xl border border-slate-800 z-10">
      <div className="absolute top-8 left-8 z-20 pointer-events-none">
        <h3 className="text-white text-2xl font-bold tracking-tight uppercase">{displayTitle}</h3>
        <p className="text-slate-400 text-sm mt-1">Visualizing the path home.</p>
      </div>
      
      <div className="absolute inset-0 z-0">
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center bg-slate-950">
            <div className="text-slate-400">Loading globe...</div>
          </div>
        }>
          <Canvas 
            camera={{ position: [0, 0, 5.5], fov: 45 }}
            gl={{ antialias: true, alpha: false }}
            dpr={[1, 2]}
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <group rotation={[0.3, 0, 0]}> 
              <Dots />
              <MigrationLines targetCountry={country} />
              <Sphere args={[GLOBE_RADIUS - 0.05, 32, 32]}>
                 <meshBasicMaterial color="#020617" />
              </Sphere>
            </group>
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} enablePan={false} />
          </Canvas>
        </Suspense>
      </div>
    </div>
  );
};

export default HeritageGlobe;