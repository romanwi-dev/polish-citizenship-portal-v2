import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Stars } from '@react-three/drei';
import * as THREE from 'three';

// --- Settings ---
const GLOBE_RADIUS = 2.2;
const BRAND_RED = "#DC2626"; 

// --- Country Coordinates (Lat, Lon) ---
const COORDINATES: Record<string, { lat: number; lon: number; name: string }> = {
  PL: { lat: 52.0, lon: 20.0, name: "Poland" },
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

// --- Ultra High Quality Earth Texture Generator ---
const createEarthTexture = () => {
  // SSR guard: canvas API only available in browser
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 4096; // 4K resolution
    canvas.height = 2048;
    const ctx = canvas.getContext('2d', { alpha: false });
    
    if (!ctx) {
      console.warn('Failed to get 2D context for Earth texture');
      return null;
    }
  
  // Deep space ocean gradient with realistic color variation
  const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGradient.addColorStop(0, '#050814'); // Polar darkness
  oceanGradient.addColorStop(0.15, '#0a1220'); 
  oceanGradient.addColorStop(0.3, '#0f1a2c');
  oceanGradient.addColorStop(0.4, '#162438'); // Deep ocean
  oceanGradient.addColorStop(0.5, '#1a2d44');
  oceanGradient.addColorStop(0.6, '#1a2d44');
  oceanGradient.addColorStop(0.7, '#162438');
  oceanGradient.addColorStop(0.85, '#0f1a2c');
  oceanGradient.addColorStop(1, '#050814');
  
  ctx.fillStyle = oceanGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Realistic continent shapes with varied textures
  const continents = [
    // North America - detailed shape
    { x: 0.22, y: 0.32, w: 0.18, h: 0.28, detail: 'high' },
    // South America
    { x: 0.26, y: 0.58, w: 0.09, h: 0.36, detail: 'medium' },
    // Europe
    { x: 0.48, y: 0.33, w: 0.08, h: 0.15, detail: 'high' },
    // Africa
    { x: 0.50, y: 0.42, w: 0.10, h: 0.32, detail: 'medium' },
    // Asia - large continent
    { x: 0.60, y: 0.22, w: 0.24, h: 0.42, detail: 'high' },
    // Australia
    { x: 0.78, y: 0.62, w: 0.12, h: 0.12, detail: 'low' },
    // Greenland
    { x: 0.30, y: 0.18, w: 0.06, h: 0.12, detail: 'low' },
  ];
  
  // Draw continents with realistic shapes
  ctx.fillStyle = '#0a1515';
  ctx.globalAlpha = 0.95;
  
  continents.forEach(cont => {
    // Create more organic shapes with bezier curves
    ctx.beginPath();
    const x = cont.x * canvas.width;
    const y = cont.y * canvas.height;
    const w = cont.w * canvas.width;
    const h = cont.h * canvas.height;
    
    // Create irregular continent shape
    ctx.ellipse(x, y, w * 0.5, h * 0.5, Math.random() * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Add texture variation within continents
    if (cont.detail === 'high') {
      for (let i = 0; i < 15; i++) {
        ctx.fillStyle = `rgba(15, 25, 25, ${0.3 + Math.random() * 0.4})`;
        ctx.beginPath();
        ctx.arc(
          x + (Math.random() - 0.5) * w,
          y + (Math.random() - 0.5) * h,
          Math.random() * 30 + 10,
          0, Math.PI * 2
        );
        ctx.fill();
      }
    }
  });
  
  // Ultra-realistic city lights with glow effects
  ctx.globalAlpha = 1;
  
  // Major metropolitan areas with dense lighting
  const megaCities = [
    { x: 0.74, y: 0.34, intensity: 1.0, size: 25, color: '#ffffff' }, // NYC
    { x: 0.50, y: 0.40, intensity: 1.0, size: 22, color: '#ffffff' }, // London
    { x: 0.51, y: 0.39, intensity: 0.9, size: 20, color: '#ffffff' }, // Paris
    { x: 0.68, y: 0.31, intensity: 1.0, size: 28, color: '#fffbeb' }, // Beijing
    { x: 0.64, y: 0.29, intensity: 0.95, size: 26, color: '#fffbeb' }, // India
    { x: 0.14, y: 0.34, intensity: 0.85, size: 18, color: '#ffffff' }, // LA
    { x: 0.80, y: 0.61, intensity: 0.7, size: 15, color: '#ffffff' }, // Sydney
    { x: 0.55, y: 0.38, intensity: 0.8, size: 16, color: '#ffffff' }, // Berlin
    { x: 0.29, y: 0.45, intensity: 0.75, size: 14, color: '#ffffff' }, // São Paulo
    { x: 0.57, y: 0.14, intensity: 0.9, size: 20, color: '#ffffff' }, // Moscow
    { x: 0.52, y: 0.51, intensity: 0.8, size: 12, color: '#ffffff' }, // Dubai
  ];
  
  megaCities.forEach(city => {
    // Core bright center
    const gradient = ctx.createRadialGradient(
      city.x * canvas.width, city.y * canvas.height,
      0,
      city.x * canvas.width, city.y * canvas.height,
      city.size
    );
    gradient.addColorStop(0, city.color);
    gradient.addColorStop(0.3, `rgba(255, 255, 255, ${city.intensity * 0.7})`);
    gradient.addColorStop(0.6, `rgba(255, 255, 200, ${city.intensity * 0.4})`);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(
      city.x * canvas.width - city.size,
      city.y * canvas.height - city.size,
      city.size * 2,
      city.size * 2
    );
    
    // Dense city lights around center
    for (let i = 0; i < city.intensity * 200; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * city.size * 1.5;
      const x = city.x * canvas.width + Math.cos(angle) * distance;
      const y = city.y * canvas.height + Math.sin(angle) * distance;
      const size = 0.8 + Math.random() * 2.5;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + Math.random() * 0.4})`;
      ctx.fillRect(x, y, size, size);
      
      // Add glow around individual lights
      if (Math.random() > 0.7) {
        ctx.fillStyle = `rgba(255, 255, 200, 0.3)`;
        ctx.beginPath();
        ctx.arc(x, y, size * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
  
  // Secondary cities with medium intensity
  const secondaryCities = [
    { x: 0.47, y: 0.41, count: 80 }, // Central Europe
    { x: 0.33, y: 0.46, count: 60 }, // South America
    { x: 0.58, y: 0.25, count: 90 }, // Eastern Asia
    { x: 0.43, y: 0.52, count: 50 }, // Middle East
    { x: 0.53, y: 0.35, count: 70 }, // Eastern Europe
  ];
  
  secondaryCities.forEach(region => {
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.7;
    for (let i = 0; i < region.count; i++) {
      const spread = 0.12;
      const x = (region.x + (Math.random() - 0.5) * spread) * canvas.width;
      const y = (region.y + (Math.random() - 0.5) * spread) * canvas.height;
      const size = 1 + Math.random() * 2;
      ctx.fillRect(x, y, size, size);
    }
  });
  
  // Minor city lights scattered across continents
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 800; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = 0.5 + Math.random() * 1.5;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + Math.random() * 0.4})`;
    ctx.fillRect(x, y, size, size);
  }
  
  // Atmospheric terminator line glow (day/night boundary)
  const terminatorGradient = ctx.createRadialGradient(
    canvas.width * 0.4, canvas.height * 0.5,
    0,
    canvas.width * 0.4, canvas.height * 0.5,
    canvas.width * 0.8
  );
  terminatorGradient.addColorStop(0, 'transparent');
  terminatorGradient.addColorStop(0.5, 'transparent');
  terminatorGradient.addColorStop(0.7, 'rgba(100, 150, 255, 0.15)');
  terminatorGradient.addColorStop(1, 'rgba(50, 100, 200, 0.25)');
  ctx.globalAlpha = 1;
  ctx.fillStyle = terminatorGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    
    return texture;
  } catch (error) {
    console.error('Error creating Earth texture:', error);
    return null;
  }
};

// --- Ultra High Quality Earth Globe ---
const EarthGlobe = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create ultra-high quality textures
  const earthTexture = useMemo(() => createEarthTexture(), []);
  
  // Create specular map for ocean reflections
  const specularMap = useMemo(() => {
    // SSR guard: canvas API only available in browser
    if (typeof window === 'undefined') {
      return null;
    }
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    // Oceans are reflective, land is not
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(0.5, '#808080');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);
  
  // Create normal map for terrain depth
  const normalMap = useMemo(() => {
    // SSR guard: canvas API only available in browser
    if (typeof window === 'undefined') {
      return null;
    }
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    // Create subtle terrain variation
    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add subtle noise for terrain detail
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 10;
      imageData.data[i] = Math.max(0, Math.min(255, 128 + noise)); // R
      imageData.data[i + 1] = Math.max(0, Math.min(255, 128 + noise)); // G
      imageData.data[i + 2] = 255; // B
      imageData.data[i + 3] = 255; // A
    }
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Very slow, smooth rotation
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });
  
  if (!earthTexture) {
    // Fallback if texture creation fails
    return (
      <Sphere ref={meshRef} args={[GLOBE_RADIUS, 64, 64]}>
        <meshStandardMaterial
          color="#0a1220"
          emissive={new THREE.Color(0x001122)}
          emissiveIntensity={0.2}
          metalness={0.1}
          roughness={0.9}
        />
      </Sphere>
    );
  }
  
  return (
    <Sphere ref={meshRef} args={[GLOBE_RADIUS, 128, 128]}>
      <meshStandardMaterial
        map={earthTexture}
        normalMap={normalMap || undefined}
        normalScale={new THREE.Vector2(0.5, 0.5)}
        metalness={0.1}
        roughness={0.9}
        emissive={new THREE.Color(0x001122)}
        emissiveIntensity={0.3}
        emissiveMap={earthTexture}
      />
    </Sphere>
  );
};

// --- Atmospheric Glow (Earth's atmosphere) ---
const Atmosphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });
  
  return (
    <Sphere ref={meshRef} args={[GLOBE_RADIUS + 0.15, 64, 64]}>
      <meshBasicMaterial
        color="#4a90e2"
        transparent
        opacity={0.15}
        side={THREE.BackSide}
      />
    </Sphere>
  );
};

// --- Enhanced Country Marker ---
const CountryMarker = ({ 
  position, 
  isPoland = false 
}: { 
  position: THREE.Vector3; 
  isPoland?: boolean;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!groupRef.current || !glowRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Smooth pulsing
    const pulse = 1 + Math.sin(time * 2) * 0.15;
    groupRef.current.scale.setScalar(pulse);
    
    // Rotating glow ring
    glowRef.current.rotation.z = time * 0.5;
  });

  const markerSize = isPoland ? 0.12 : 0.08;
  const glowColor = isPoland ? "#ffffff" : BRAND_RED;

  return (
    <group ref={groupRef} position={position}>
      {/* Core bright sphere */}
      <mesh>
        <sphereGeometry args={[markerSize, 24, 24]} />
        <meshStandardMaterial
          color={glowColor}
          emissive={glowColor}
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>
      
      {/* Outer glow spheres */}
      <mesh>
        <sphereGeometry args={[markerSize * 1.3, 16, 16]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Rotating glow ring */}
      <mesh ref={glowRef}>
        <torusGeometry args={[markerSize * 1.6, 0.02, 8, 32]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {/* Particle effect around marker */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / 8) * Math.PI * 2) * markerSize * 2.5,
            Math.sin((i / 8) * Math.PI * 2) * markerSize * 2.5,
            0
          ]}
        >
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial
            color={glowColor}
            transparent
            opacity={0.4}
          />
        </mesh>
      ))}
    </group>
  );
};

// --- Enhanced Migration Lines with Particles ---
const MigrationLines = ({ targetCountry }: { targetCountry?: string }) => {
  const groupRef = useRef<THREE.Group>(null);
  const polandPos = getPosition(COORDINATES.PL.lat, COORDINATES.PL.lon, GLOBE_RADIUS);

  const lines = useMemo(() => {
    let startPoints: Array<{ point: THREE.Vector3; countryCode: string }> = [];
    
    if (targetCountry && COORDINATES[targetCountry]) {
      const center = COORDINATES[targetCountry];
      for(let i=0; i<15; i++) {
        const spreadLat = center.lat + (Math.random() - 0.5) * 10;
        const spreadLon = center.lon + (Math.random() - 0.5) * 10;
        startPoints.push({
          point: getPosition(spreadLat, spreadLon, GLOBE_RADIUS),
          countryCode: targetCountry
        });
      }
    } else {
      const keys = Object.keys(COORDINATES).filter(k => k !== 'PL');
      startPoints = keys.map(k => ({
        point: getPosition(COORDINATES[k].lat, COORDINATES[k].lon, GLOBE_RADIUS),
        countryCode: k
      }));
    }

    return startPoints.map(({ point: start, countryCode }, index) => {
      const end = polandPos;
      const dist = start.distanceTo(end);
      const archHeight = 0.5 + (index % 4) * 0.15;
      const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(GLOBE_RADIUS + (dist * archHeight));
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      
      // Color variation based on distance
      const hue = (index * 10) % 20;
      const saturation = 75 + (index % 3) * 10;
      const lightness = 55 + (index % 2) * 5;
      const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      
      return { 
        points: curve.getPoints(80),
        countryCode,
        color,
        curve
      };
    });
  }, [targetCountry]);

  const lineMaterialsRef = useRef<(THREE.LineBasicMaterial | null)[]>([]);
  const particleRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Animate line opacity with flowing effect
    lineMaterialsRef.current.forEach((material, i) => {
      if (!material) return;
      material.opacity = 0.8 + Math.sin(time * 0.6 + i * 0.5) * 0.2;
    });
    
    // Animate particles along lines
    lines.forEach((line, lineIndex) => {
      const particleIndex = lineIndex * 3;
      const progress = (time * 0.3 + lineIndex * 0.2) % 1;
      const pointIndex = Math.floor(progress * (line.points.length - 1));
      const point = line.points[pointIndex];
      
      for (let i = 0; i < 3; i++) {
        const particle = particleRefs.current[particleIndex + i];
        if (particle && point) {
          const offset = (time * 0.5 + i * 0.3) % (line.points.length - 1);
          const offsetPoint = line.points[Math.floor(offset)];
          if (offsetPoint) {
            particle.position.copy(offsetPoint);
            particle.position.multiplyScalar(1.01); // Slightly above the line
          }
        }
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* Connection Lines */}
      {lines.map(({ points, countryCode, color }, i) => (
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
              if (mat) lineMaterialsRef.current[i] = mat;
            }}
            color={color}
            opacity={0.85} 
            transparent
            linewidth={3}
          />
        </line>
      ))}
      
      {/* Animated particles along lines */}
      {lines.map((line, lineIndex) => {
        const particleIndex = lineIndex * 3;
        return Array.from({ length: 3 }).map((_, i) => (
          <mesh
            key={`particle-${lineIndex}-${i}`}
            ref={(el) => {
              if (el) particleRefs.current[particleIndex + i] = el;
            }}
          >
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial
              color={line.color}
              transparent
              opacity={0.9}
            />
          </mesh>
        ));
      })}
      
      {/* Country Markers */}
      {(targetCountry ? [targetCountry] : Object.keys(COORDINATES).filter(k => k !== 'PL')).map((code) => {
        const coord = COORDINATES[code];
        const pos = getPosition(coord.lat, coord.lon, GLOBE_RADIUS);
        return (
          <CountryMarker
            key={code}
            position={pos}
            isPoland={false}
          />
        );
      })}
      
      {/* Poland Marker */}
      <CountryMarker
        position={polandPos}
        isPoland={true}
      />
    </group>
  );
};

// --- Enhanced Waving Animation ---
const WavingGlobeGroup = ({ children, targetCountry }: { children: React.ReactNode; targetCountry?: string }) => {
  const groupRef = useRef<THREE.Group>(null);
  const innerGroupRef = useRef<THREE.Group>(null);
  
  // Calculate base rotation to show target country (Poland at 20°E)
  const baseRotationY = useMemo(() => {
    if (targetCountry === 'PL') {
      // Poland is at 20°E longitude. The globe texture typically has 0° at the front.
      // To show Poland (20°E), we need to rotate the globe counter-clockwise (negative Y rotation).
      // However, if the texture is oriented with 0° at a different position, we may need to adjust.
      // Trying a significant rotation: -2.0 radians ≈ -115° to ensure Poland's side is visible
      // This should rotate the globe enough to show Europe/Poland instead of the Pacific/dark side
      return -2.0;
    }
    return 0;
  }, [targetCountry]);
  
  useFrame((state) => {
    if (!groupRef.current || !innerGroupRef.current) return;
    const time = state.clock.getElapsedTime();
    
    const waveSpeed = 0.25;
    const floatSpeed = 0.35;
    
    // Smooth floating motion - keep target country visible
    groupRef.current.rotation.x = 0.15 + Math.sin(time * waveSpeed) * 0.05;
    // Keep Poland visible - minimal Y rotation animation when target is PL
    if (targetCountry === 'PL') {
      // Keep Poland in view with very minimal oscillation
      groupRef.current.rotation.y = baseRotationY + Math.sin(time * waveSpeed * 0.2) * 0.01;
    } else {
      groupRef.current.rotation.y = time * 0.06 + Math.sin(time * waveSpeed * 0.6) * 0.05;
    }
    groupRef.current.rotation.z = Math.sin(time * waveSpeed * 0.7) * 0.02;
    
    // Gentle floating
    groupRef.current.position.y = Math.sin(time * floatSpeed) * 0.18;
    groupRef.current.position.x = Math.cos(time * floatSpeed * 0.6) * 0.1;
    groupRef.current.position.z = Math.sin(time * floatSpeed * 0.4) * 0.06;
    
    // Subtle inner rotation
    innerGroupRef.current.rotation.x = Math.sin(time * waveSpeed * 0.5) * 0.03;
    innerGroupRef.current.rotation.y = Math.cos(time * waveSpeed * 0.4) * 0.02;
  });
  
  return (
    <group ref={groupRef}>
      <group ref={innerGroupRef}>
        {children}
      </group>
    </group>
  );
};

// --- Main Component ---
interface GlobeProps {
  country?: string;
  title?: string;
  asBackground?: boolean;
  cameraFov?: number;
  cameraPosition?: [number, number, number];
  initialRotation?: [number, number, number];
}

const HeritageGlobe = ({ country, title, asBackground = false, cameraFov = 50, cameraPosition = [0, 0, 6], initialRotation }: GlobeProps) => {
  const displayTitle = title || (country && COORDINATES[country] ? `${COORDINATES[country].name} to Poland` : "Global Reach");

  // Background version - no text, full height, behind content
  if (asBackground) {
    return (
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-slate-400 text-sm">Loading globe...</div>
          </div>
        }>
          <Canvas 
            camera={{ position: cameraPosition, fov: cameraFov }}
            gl={{ 
              antialias: true, 
              alpha: true,
              powerPreference: "high-performance",
              stencil: false,
              depth: true
            }}
            dpr={[1, 2]}
            style={{ background: 'transparent' }}
            onError={(error) => {
              console.error('Canvas error:', error);
            }}
          >
            {/* Consistent lighting setup - uniform illumination */}
            <ambientLight intensity={0.5} color="#ffffff" />
            <directionalLight 
              position={[5, 5, 5]} 
              intensity={1.2} 
              color="#ffffff"
            />
            <directionalLight 
              position={[-5, -5, -5]} 
              intensity={0.5} 
              color="#ffffff"
            />
            <pointLight 
              position={[10, 10, 10]} 
              intensity={0.8} 
              color="#ffffff" 
              distance={30} 
              decay={2}
            />
            <pointLight 
              position={[-10, -10, -10]} 
              intensity={0.4} 
              color="#ffffff"
              distance={30}
            />
            
            {/* Starfield background */}
            <Stars radius={100} depth={60} count={2000} factor={6} fade speed={0.5} />
            
            <group rotation={initialRotation || [0, 0, 0]}>
              <WavingGlobeGroup targetCountry={country}>
                <Atmosphere />
                <EarthGlobe />
                <MigrationLines targetCountry={country} />
              </WavingGlobeGroup>
            </group>
            
            <OrbitControls 
              enableZoom={false} 
              autoRotate={false} 
              enablePan={false}
              minDistance={4}
              maxDistance={8}
            />
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
            camera={{ position: [0, 0, 6], fov: 45 }}
            gl={{ 
              antialias: true, 
              alpha: false,
              powerPreference: "high-performance"
            }}
            dpr={[1, 2]}
          >
            {/* Consistent lighting - uniform shades */}
            <ambientLight intensity={0.5} color="#ffffff" />
            <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
            <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#ffffff" />
            <pointLight position={[10, 10, 10]} intensity={0.8} color="#ffffff" distance={30} decay={2} />
            <pointLight position={[-10, -10, -10]} intensity={0.4} color="#ffffff" distance={30} />
            
            <Stars radius={80} depth={50} count={2000} factor={5} fade speed={0.5} />
            
            <group rotation={[0.3, 0, 0]}> 
              <Atmosphere />
              <EarthGlobe />
              <MigrationLines targetCountry={country} />
            </group>
            
            <OrbitControls 
              enableZoom={false} 
              autoRotate 
              autoRotateSpeed={0.3} 
              enablePan={false}
            />
          </Canvas>
        </Suspense>
      </div>
    </div>
  );
};

export default HeritageGlobe;