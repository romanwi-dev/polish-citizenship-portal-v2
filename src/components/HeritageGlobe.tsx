import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

// --- Settings ---
const GLOBE_RADIUS = 2;
const BRAND_RED = "#DC2626"; 
const DOT_COLOR = "#475569"; // Slate 600

// --- Country Flag Emojis ---
const FLAG_EMOJIS: Record<string, string> = {
  PL: "🇵🇱",
  US: "🇺🇸",
  GB: "🇬🇧",
  BR: "🇧🇷",
  IL: "🇮🇱",
  CA: "🇨🇦",
  AU: "🇦🇺",
  ZA: "🇿🇦",
  FR: "🇫🇷",
  DE: "🇩🇪",
  AR: "🇦🇷",
  MX: "🇲🇽",
  UA: "🇺🇦",
  RU: "🇷🇺",
  VE: "🇻🇪",
  CO: "🇨🇴",
};

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

// --- Realistic Earth Globe with Texture ---
const EarthGlobe = () => {
  // Create a realistic Earth texture programmatically (night view with city lights)
  const earthTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;
    
    // Base dark ocean color
    const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    oceanGradient.addColorStop(0, '#0a0f1a'); // Dark blue-black at poles
    oceanGradient.addColorStop(0.2, '#152530'); // Darker blue
    oceanGradient.addColorStop(0.4, '#1e3442'); // Ocean blue
    oceanGradient.addColorStop(0.6, '#1e3442');
    oceanGradient.addColorStop(0.8, '#152530');
    oceanGradient.addColorStop(1, '#0a0f1a');
    
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add continent shapes (dark landmasses)
    ctx.fillStyle = '#0f1f1f';
    const continents = [
      // North America
      { x: 0.25, y: 0.35, w: 0.15, h: 0.25 },
      // South America
      { x: 0.28, y: 0.58, w: 0.08, h: 0.35 },
      // Europe/Africa
      { x: 0.48, y: 0.35, w: 0.12, h: 0.55 },
      // Asia
      { x: 0.58, y: 0.25, w: 0.20, h: 0.40 },
      // Australia
      { x: 0.75, y: 0.60, w: 0.12, h: 0.15 },
    ];
    
    continents.forEach(cont => {
      ctx.beginPath();
      ctx.ellipse(
        cont.x * canvas.width,
        cont.y * canvas.height,
        cont.w * canvas.width * 0.5,
        cont.h * canvas.height * 0.5,
        0, 0, Math.PI * 2
      );
      ctx.fill();
    });
    
    // Add night city lights (bright dots for major cities)
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.9;
    
    // Major city clusters with more lights
    const cityRegions = [
      { x: 0.75, y: 0.35, count: 80 }, // USA East Coast
      { x: 0.15, y: 0.35, count: 60 }, // USA West Coast
      { x: 0.50, y: 0.40, count: 100 }, // Europe
      { x: 0.65, y: 0.30, count: 120 }, // Asia (China/India)
      { x: 0.30, y: 0.45, count: 40 }, // South America
      { x: 0.80, y: 0.62, count: 20 }, // Australia
      { x: 0.52, y: 0.52, count: 15 }, // Middle East
      { x: 0.55, y: 0.15, count: 30 }, // Russia
    ];
    
    cityRegions.forEach(region => {
      for (let i = 0; i < region.count; i++) {
        const spreadX = (Math.random() - 0.5) * 0.15;
        const spreadY = (Math.random() - 0.5) * 0.15;
        const x = (region.x + spreadX) * canvas.width;
        const y = (region.y + spreadY) * canvas.height;
        const size = 0.5 + Math.random() * 1.5;
        ctx.fillRect(x, y, size, size);
      }
    });
    
    // Add some larger city clusters (megacities)
    ctx.globalAlpha = 1;
    const megaCities = [
      { x: 0.75, y: 0.35, radius: 8 }, // New York area
      { x: 0.50, y: 0.42, radius: 10 }, // London/Paris region
      { x: 0.68, y: 0.32, radius: 12 }, // Beijing area
      { x: 0.64, y: 0.30, radius: 10 }, // India region
      { x: 0.52, y: 0.38, radius: 6 }, // Central Europe
    ];
    
    megaCities.forEach(city => {
      ctx.beginPath();
      ctx.arc(
        city.x * canvas.width,
        city.y * canvas.height,
        city.radius,
        0, Math.PI * 2
      );
      ctx.fill();
    });
    
    // Add atmospheric glow at edges (terminator line)
    const glowGradient = ctx.createRadialGradient(
      canvas.width * 0.5, canvas.height * 0.5,
      0,
      canvas.width * 0.5, canvas.height * 0.5,
      canvas.width * 0.6
    );
    glowGradient.addColorStop(0, 'transparent');
    glowGradient.addColorStop(0.7, 'transparent');
    glowGradient.addColorStop(1, 'rgba(0, 100, 200, 0.2)');
    ctx.fillStyle = glowGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    return new THREE.CanvasTexture(canvas);
  }, []);
  
  if (!earthTexture) return <FallbackEarthGlobe />;
  
  return (
    <Sphere args={[GLOBE_RADIUS, 64, 64]}>
      <meshPhongMaterial
        map={earthTexture}
        emissive={new THREE.Color(0x001122)}
        emissiveIntensity={0.2}
        shininess={15}
        specular={new THREE.Color(0x111111)}
      />
    </Sphere>
  );
};

// Fallback Earth Globe (if textures fail to load)
const FallbackEarthGlobe = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textureRef = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create a dark Earth-like gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0a1628'); // Dark blue-black at poles
      gradient.addColorStop(0.3, '#1a2a3a'); // Darker blue
      gradient.addColorStop(0.5, '#2a3a4a'); // Ocean blue
      gradient.addColorStop(0.7, '#1a2a3a');
      gradient.addColorStop(1, '#0a1628');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add continent-like shapes with subtle colors
      ctx.fillStyle = '#1a4a2a'; // Dark green for continents
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = 50 + Math.random() * 150;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.globalAlpha = 0.3;
        ctx.fill();
      }
      
      // Add night lights (city lights) as bright dots
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.8;
      for (let i = 0; i < 500; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = 1 + Math.random() * 2;
        ctx.fillRect(x, y, size, size);
      }
      
      // Add some larger city clusters
      ctx.globalAlpha = 0.6;
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = 3 + Math.random() * 5;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    return new THREE.CanvasTexture(canvas);
  }, []);
  
  return (
    <Sphere args={[GLOBE_RADIUS, 64, 64]}>
      <meshPhongMaterial
        map={textureRef}
        emissive={new THREE.Color(0x001122)}
        emissiveIntensity={0.15}
        shininess={5}
      />
    </Sphere>
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
    // Slower rotation
    meshRef.current.rotation.y = time * 0.01; // Half the speed
    
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const scale = (Math.sin(i * 0.1 + time * 0.5) * 0.5 + 1) * 0.5; // Slower pulse
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

// --- Country Marker (No Flags) ---
const CountryMarker = ({ 
  position, 
  countryCode, 
  countryName, 
  isPoland = false 
}: { 
  position: THREE.Vector3; 
  countryCode: string; 
  countryName: string;
  isPoland?: boolean;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    // Gentle pulsing animation
    const pulse = 1 + Math.sin(time * 1.5 + (position.x || 0)) * 0.12;
    meshRef.current.scale.setScalar(pulse);
  });

  const markerSize = isPoland ? 0.1 : 0.07;
  const glowColor = isPoland ? "#ffffff" : BRAND_RED;

  return (
    <group position={position}>
      {/* Glowing marker sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[markerSize, 16, 16]} />
        <meshBasicMaterial 
          color={glowColor} 
          toneMapped={false}
          transparent
          opacity={0.95}
        />
      </mesh>
      
      {/* Outer glow ring */}
      <mesh>
        <ringGeometry args={[markerSize * 1.4, markerSize * 1.7, 32]} />
        <meshBasicMaterial 
          color={glowColor}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// --- 2. The Dynamic Lines (Roots to Poland) ---
const MigrationLines = ({ targetCountry }: { targetCountry?: string }) => {
  const groupRef = useRef<THREE.Group>(null);
  const polandPos = getPosition(COORDINATES.PL.lat, COORDINATES.PL.lon, GLOBE_RADIUS);

  const lines = useMemo(() => {
    let startPoints: Array<{ point: THREE.Vector3; countryCode: string }> = [];
    
    if (targetCountry && COORDINATES[targetCountry]) {
      // CASE A: Specific Country (12 lines from that region)
      const center = COORDINATES[targetCountry];
      for(let i=0; i<12; i++) {
        const spreadLat = center.lat + (Math.random() - 0.5) * 8;
        const spreadLon = center.lon + (Math.random() - 0.5) * 8;
        startPoints.push({
          point: getPosition(spreadLat, spreadLon, GLOBE_RADIUS),
          countryCode: targetCountry
        });
      }
    } else {
      // CASE B: Global View (1 line from each major country)
      const keys = Object.keys(COORDINATES).filter(k => k !== 'PL');
      startPoints = keys.map(k => ({
        point: getPosition(COORDINATES[k].lat, COORDINATES[k].lon, GLOBE_RADIUS),
        countryCode: k
      }));
    }

    // Draw Curve to Poland with different styles based on country
    const connectionStyles = ['solid', 'dashed', 'dotted', 'glow'];
    
    return startPoints.map(({ point: start, countryCode }, index) => {
      const end = polandPos;
      const dist = start.distanceTo(end);
      
      // Vary the arch height for visual interest
      const archHeight = 0.4 + (index % 3) * 0.2; // Different heights
      const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(GLOBE_RADIUS + (dist * archHeight));
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      
      // Assign different styles to lines
      const styleIndex = index % connectionStyles.length;
      const style = connectionStyles[styleIndex];
      
      // Vary colors slightly for different countries
      const hueShift = (index * 15) % 30; // Rotate through red hues
      const color = style === 'glow' 
        ? `hsl(${0 + hueShift}, 85%, 60%)` // Brighter for glow
        : style === 'dotted'
        ? `hsl(${0 + hueShift}, 75%, 55%)` // Slightly different
        : BRAND_RED;
      
      return { 
        points: curve.getPoints(60), // More points for smoother curves
        countryCode,
        style,
        color
      };
    });
  }, [targetCountry]);

  const lineMaterialsRef = useRef<(THREE.LineBasicMaterial | null)[]>([]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Animate lines with flowing effect - slower animation
    lineMaterialsRef.current.forEach((material, i) => {
      if (!material) return;
      const baseOpacity = parseFloat(material.opacity.toString()) || 0.75;
      // Slower, more subtle flowing opacity effect
      const flowSpeed = 0.8; // Slower than before
      material.opacity = baseOpacity + Math.sin(time * flowSpeed + (i * 0.4)) * 0.2;
    });
  });

  return (
    <group ref={groupRef}>
      {lines.map(({ points, countryCode, style, color }, i) => {
        // Create different line styles
        const isDashed = style === 'dashed';
        const isDotted = style === 'dotted';
        const isGlow = style === 'glow';
        
        // For dashed/dotted, we'll use opacity variation
        const baseOpacity = isGlow ? 0.9 : isDotted ? 0.6 : 0.75;
        
        return (
          <line key={`line-${i}-${countryCode}`}>
            <bufferGeometry>
              <bufferAttribute 
                attach="attributes-position" 
                count={points.length} 
                array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))} 
                itemSize={3} 
              />
            </bufferGeometry>
            <lineBasicMaterial 
              ref={(mat: THREE.LineBasicMaterial | null) => {
                if (mat) {
                  lineMaterialsRef.current[i] = mat;
                }
              }}
              color={color}
              opacity={baseOpacity} 
              transparent 
            />
          </line>
        );
      })}
      
      {/* Country Markers */}
      {(targetCountry ? [targetCountry] : Object.keys(COORDINATES).filter(k => k !== 'PL')).map((code) => {
        const coord = COORDINATES[code];
        const pos = getPosition(coord.lat, coord.lon, GLOBE_RADIUS);
        return (
          <CountryMarker
            key={code}
            position={pos}
            countryCode={code}
            countryName={coord.name}
            isPoland={false}
          />
        );
      })}
      
      {/* Poland Marker (highlighted) */}
      <CountryMarker
        position={polandPos}
        countryCode="PL"
        countryName="Poland"
        isPoland={true}
      />
    </group>
  );
};

// --- Waving Animation Component with Enhanced 3D Motion ---
const WavingGlobeGroup = ({ children, targetCountry }: { children: React.ReactNode; targetCountry?: string }) => {
  const groupRef = useRef<THREE.Group>(null);
  const innerGroupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!groupRef.current || !innerGroupRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Slower, more gentle 3D waving/floating animation
    const waveSpeed = 0.3; // Slower wave speed
    const floatSpeed = 0.4; // Slower floating
    
    // Main rotation with gentle wave modulation
    groupRef.current.rotation.x = 0.25 + Math.sin(time * waveSpeed) * 0.1;
    groupRef.current.rotation.y = time * 0.08 + Math.sin(time * waveSpeed * 0.7) * 0.06; // Much slower spin
    groupRef.current.rotation.z = Math.sin(time * waveSpeed * 0.8) * 0.03;
    
    // Gentle floating motion - more pronounced
    groupRef.current.position.y = Math.sin(time * floatSpeed) * 0.2;
    groupRef.current.position.x = Math.cos(time * floatSpeed * 0.7) * 0.12;
    groupRef.current.position.z = Math.sin(time * floatSpeed * 0.5) * 0.08;
    
    // Inner group subtle rotation for depth
    innerGroupRef.current.rotation.x = Math.sin(time * waveSpeed * 0.6) * 0.04;
    innerGroupRef.current.rotation.y = Math.cos(time * waveSpeed * 0.5) * 0.03;
  });
  
  return (
    <group ref={groupRef}>
      <group ref={innerGroupRef}>
        {children}
      </group>
    </group>
  );
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
            {/* Realistic lighting for Earth from space */}
            <ambientLight intensity={0.3} color="#ffffff" />
            <directionalLight position={[5, 3, 5]} intensity={1.2} color="#ffffff" />
            <pointLight position={[-5, -3, -5]} intensity={0.3} color="#4a90e2" />
            {/* Sun-like light for day/night effect */}
            <pointLight position={[10, 10, 10]} intensity={0.8} color="#ffeb3b" distance={20} decay={2} />
            <WavingGlobeGroup targetCountry={country}>
              <EarthGlobe />
              <MigrationLines targetCountry={country} />
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
            {/* Realistic lighting for Earth from space */}
            <ambientLight intensity={0.3} color="#ffffff" />
            <directionalLight position={[5, 3, 5]} intensity={1.2} color="#ffffff" />
            <pointLight position={[-5, -3, -5]} intensity={0.3} color="#4a90e2" />
            <pointLight position={[10, 10, 10]} intensity={0.8} color="#ffeb3b" distance={20} decay={2} />
            <group rotation={[0.3, 0, 0]}> 
              <EarthGlobe />
              <MigrationLines targetCountry={country} />
            </group>
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} enablePan={false} />
          </Canvas>
        </Suspense>
      </div>
    </div>
  );
};

export default HeritageGlobe;