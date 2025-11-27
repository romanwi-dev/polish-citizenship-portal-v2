import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
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
  
  // Realistic ocean gradient with depth variation
  const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGradient.addColorStop(0, '#1a4d7a'); // Polar ocean (lighter)
  oceanGradient.addColorStop(0.15, '#2d6a9f'); 
  oceanGradient.addColorStop(0.3, '#3d7ab8');
  oceanGradient.addColorStop(0.4, '#2d5a8f'); // Mid-depth ocean
  oceanGradient.addColorStop(0.5, '#1e4a7a'); // Deep ocean
  oceanGradient.addColorStop(0.6, '#1e4a7a');
  oceanGradient.addColorStop(0.7, '#2d5a8f');
  oceanGradient.addColorStop(0.85, '#3d7ab8');
  oceanGradient.addColorStop(1, '#1a4d7a'); // Polar ocean
  
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
  
  // Draw continents with realistic shapes and terrain colors
  continents.forEach(cont => {
    const x = cont.x * canvas.width;
    const y = cont.y * canvas.height;
    const w = cont.w * canvas.width;
    const h = cont.h * canvas.height;
    
    // Determine terrain color based on latitude (y position)
    let baseColor = '#2d5016'; // Default green (temperate)
    if (y < canvas.height * 0.25 || y > canvas.height * 0.75) {
      // Polar regions - white/light gray
      baseColor = '#e8f0f0';
    } else if (y > canvas.height * 0.55 && y < canvas.height * 0.65) {
      // Desert regions - tan/brown
      baseColor = '#8b6f47';
    } else if (y < canvas.height * 0.35) {
      // Northern temperate - darker green
      baseColor = '#1e3d0f';
    } else if (y > canvas.height * 0.45) {
      // Tropical/southern - vibrant green
      baseColor = '#3d6b1f';
    }
    
    // Create more organic continent shape using bezier curves
    ctx.beginPath();
    const centerX = x;
    const centerY = y;
    const radiusX = w * 0.5;
    const radiusY = h * 0.5;
    
    // Create irregular shape with bezier curves
    ctx.moveTo(centerX + radiusX * 0.8, centerY);
    ctx.bezierCurveTo(
      centerX + radiusX, centerY - radiusY * 0.3,
      centerX + radiusX * 0.6, centerY - radiusY * 0.8,
      centerX, centerY - radiusY * 0.9
    );
    ctx.bezierCurveTo(
      centerX - radiusX * 0.6, centerY - radiusY * 0.8,
      centerX - radiusX, centerY - radiusY * 0.3,
      centerX - radiusX * 0.8, centerY
    );
    ctx.bezierCurveTo(
      centerX - radiusX, centerY + radiusY * 0.3,
      centerX - radiusX * 0.6, centerY + radiusY * 0.8,
      centerX, centerY + radiusY * 0.9
    );
    ctx.bezierCurveTo(
      centerX + radiusX * 0.6, centerY + radiusY * 0.8,
      centerX + radiusX, centerY + radiusY * 0.3,
      centerX + radiusX * 0.8, centerY
    );
    ctx.closePath();
    
    // Fill with base terrain color
    ctx.fillStyle = baseColor;
    ctx.globalAlpha = 0.95;
    ctx.fill();
    
    // Add terrain variation (mountains, forests, etc.)
    if (cont.detail === 'high') {
      for (let i = 0; i < 20; i++) {
        const variationX = x + (Math.random() - 0.5) * w;
        const variationY = y + (Math.random() - 0.5) * h;
        const variationSize = Math.random() * 40 + 15;
        
        // Mountains (darker)
        if (Math.random() > 0.7) {
          ctx.fillStyle = `rgba(60, 50, 40, ${0.4 + Math.random() * 0.3})`;
        } else {
          // Vegetation variation
          ctx.fillStyle = `rgba(45, 80, 30, ${0.2 + Math.random() * 0.3})`;
        }
        
        ctx.beginPath();
        ctx.arc(variationX, variationY, variationSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
  
  // Subtle city lights (much reduced for natural terrain focus)
  ctx.globalAlpha = 0.3; // Reduced opacity for subtlety
  
  // Only major cities with very subtle lighting
  const majorCities = [
    { x: 0.74, y: 0.34, size: 8 }, // NYC
    { x: 0.50, y: 0.40, size: 7 }, // London
    { x: 0.51, y: 0.39, size: 6 }, // Paris
    { x: 0.68, y: 0.31, size: 9 }, // Beijing
    { x: 0.48, y: 0.33, size: 5 }, // Warsaw/Poland
  ];
  
  majorCities.forEach(city => {
    // Very subtle glow
    const gradient = ctx.createRadialGradient(
      city.x * canvas.width, city.y * canvas.height,
      0,
      city.x * canvas.width, city.y * canvas.height,
      city.size
    );
    gradient.addColorStop(0, 'rgba(255, 255, 200, 0.4)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 200, 0.2)');
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(
      city.x * canvas.width - city.size,
      city.y * canvas.height - city.size,
      city.size * 2,
      city.size * 2
    );
    
    // Fewer, smaller city lights
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * city.size;
      const x = city.x * canvas.width + Math.cos(angle) * distance;
      const y = city.y * canvas.height + Math.sin(angle) * distance;
      const size = 0.5 + Math.random() * 1;
      
      ctx.fillStyle = `rgba(255, 255, 200, ${0.3 + Math.random() * 0.2})`;
      ctx.fillRect(x, y, size, size);
    }
  });
  
  // Subtle atmospheric terminator line (day/night boundary) - more realistic
  const terminatorGradient = ctx.createRadialGradient(
    canvas.width * 0.4, canvas.height * 0.5,
    0,
    canvas.width * 0.4, canvas.height * 0.5,
    canvas.width * 0.8
  );
  terminatorGradient.addColorStop(0, 'transparent');
  terminatorGradient.addColorStop(0.6, 'transparent');
  terminatorGradient.addColorStop(0.8, 'rgba(100, 150, 200, 0.08)');
  terminatorGradient.addColorStop(1, 'rgba(50, 100, 150, 0.12)');
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
const EarthGlobe = ({ targetCountry }: { targetCountry?: string }) => {
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
  
  // Calculate base rotation offset for target country
  const baseRotationOffset = useMemo(() => {
    if (targetCountry === 'PL') {
      // Poland is at 20°E longitude
      // In equirectangular projection, 0° longitude is typically at the center (50% of texture width)
      // The texture shows Europe at ~48% width, which suggests:
      // - Greenwich (0°) is at approximately 42-43% of texture width
      // - Poland (20°E) would be at approximately 48% + (20/360)*100% = 53.56%
      // To show Poland, we need to rotate the globe so that 20°E faces the camera
      // Since the texture wraps, we can rotate either direction
      // Using -1.3 radians (~-74°) to rotate the globe to show Europe/Poland more prominently
      // Adjusted to better center Poland in view
      return -1.3;
    }
    return 0;
  }, [targetCountry]);
  
  useFrame((state) => {
    if (meshRef.current) {
      if (targetCountry === 'PL') {
        // For Poland, keep it static with just the base offset (no continuous rotation)
        // This ensures Poland stays visible
        meshRef.current.rotation.y = baseRotationOffset;
      } else {
        // For other cases, use slow continuous rotation
        meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.05 + baseRotationOffset;
      }
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
        normalScale={new THREE.Vector2(0.8, 0.8)}
        metalness={0.05}
        roughness={0.85}
        emissive={new THREE.Color(0x001a33)}
        emissiveIntensity={0.15}
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
      
      // Brighter, more visible colors for better contrast
      const hue = (index * 15) % 60; // Wider hue range
      const saturation = 85 + (index % 3) * 10; // Higher saturation
      const lightness = 65 + (index % 2) * 10; // Brighter
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
    
    // Animate line opacity with flowing effect - brighter and more visible
    lineMaterialsRef.current.forEach((material, i) => {
      if (!material) return;
      material.opacity = 0.95 + Math.sin(time * 0.6 + i * 0.5) * 0.05; // Higher base opacity
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
            opacity={0.95} 
            transparent
            linewidth={5}
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
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial
              color={line.color}
              transparent
              opacity={1.0}
              emissive={line.color}
              emissiveIntensity={0.5}
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
  
  useFrame((state) => {
    if (!groupRef.current || !innerGroupRef.current) return;
    const time = state.clock.getElapsedTime();
    
    const waveSpeed = 0.25;
    const floatSpeed = 0.35;
    
    // Smooth floating motion - keep target country visible
    groupRef.current.rotation.x = 0.15 + Math.sin(time * waveSpeed) * 0.05;
    // Y rotation is now handled by EarthGlobe component when targetCountry is set
    // Only apply group rotation when no target country (for general rotation)
    if (targetCountry !== 'PL') {
      groupRef.current.rotation.y = time * 0.06 + Math.sin(time * waveSpeed * 0.6) * 0.05;
    } else {
      // For Poland, keep Y rotation minimal to avoid conflicting with EarthGlobe rotation
      groupRef.current.rotation.y = Math.sin(time * waveSpeed * 0.2) * 0.01;
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
            
            <group rotation={initialRotation || [0, 0, 0]}>
              <WavingGlobeGroup targetCountry={country}>
                <Atmosphere />
                <EarthGlobe targetCountry={country} />
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
            
            <group rotation={[0.3, 0, 0]}> 
              <Atmosphere />
              <EarthGlobe targetCountry={country} />
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