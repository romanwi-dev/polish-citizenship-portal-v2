import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

// --- Settings ---
const GLOBE_RADIUS = 2.5;
const POLAND_LAT = 52.0;
const POLAND_LON = 20.0;

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

// --- High-Quality Earth Texture Generator ---
const createRealisticEarthTexture = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 4096; // 4K resolution for sharp continents
    canvas.height = 2048;
    const ctx = canvas.getContext('2d', { alpha: false });
    
    if (!ctx) {
      console.warn('Failed to get 2D context for Earth texture');
      return null;
    }
  
    // Realistic ocean gradient - deep blue with depth variation
    const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    oceanGradient.addColorStop(0, '#0a1e3a'); // Polar ocean
    oceanGradient.addColorStop(0.15, '#1a3d6a'); 
    oceanGradient.addColorStop(0.3, '#2d5a8f');
    oceanGradient.addColorStop(0.4, '#1e4a7a'); // Deep ocean
    oceanGradient.addColorStop(0.5, '#153d6a'); // Deepest
    oceanGradient.addColorStop(0.6, '#153d6a');
    oceanGradient.addColorStop(0.7, '#1e4a7a');
    oceanGradient.addColorStop(0.85, '#2d5a8f');
    oceanGradient.addColorStop(1, '#0a1e3a'); // Polar ocean
    
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Realistic continent shapes with accurate positions
    const continents = [
      // North America
      { x: 0.22, y: 0.32, w: 0.18, h: 0.28, color: '#2d5016' },
      // South America
      { x: 0.26, y: 0.58, w: 0.09, h: 0.36, color: '#3d6b1f' },
      // Europe (including Poland)
      { x: 0.48, y: 0.33, w: 0.08, h: 0.15, color: '#1e3d0f' },
      // Africa
      { x: 0.50, y: 0.42, w: 0.10, h: 0.32, color: '#2d5016' },
      // Asia
      { x: 0.60, y: 0.22, w: 0.24, h: 0.42, color: '#1e3d0f' },
      // Australia
      { x: 0.78, y: 0.62, w: 0.12, h: 0.12, color: '#3d6b1f' },
      // Greenland
      { x: 0.30, y: 0.18, w: 0.06, h: 0.12, color: '#e8f0f0' },
    ];
    
    // Draw continents with realistic shapes
    continents.forEach(cont => {
      const x = cont.x * canvas.width;
      const y = cont.y * canvas.height;
      const w = cont.w * canvas.width;
      const h = cont.h * canvas.height;
      
      // Create organic continent shape
      ctx.beginPath();
      ctx.ellipse(x, y, w * 0.5, h * 0.5, Math.random() * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = cont.color;
      ctx.globalAlpha = 0.95;
      ctx.fill();
      
      // Add terrain variation
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = `rgba(45, 80, 30, ${0.2 + Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.arc(
          x + (Math.random() - 0.5) * w,
          y + (Math.random() - 0.5) * h,
          Math.random() * 25 + 10,
          0, Math.PI * 2
        );
        ctx.fill();
      }
    });
    
    // Highlight Poland region with subtle glow
    const polandX = 0.48 * canvas.width; // Europe region
    const polandY = 0.33 * canvas.height;
    const polandGlow = ctx.createRadialGradient(
      polandX, polandY,
      0,
      polandX, polandY,
      80
    );
    polandGlow.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    polandGlow.addColorStop(0.5, 'rgba(255, 255, 200, 0.08)');
    polandGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = polandGlow;
    ctx.fillRect(polandX - 80, polandY - 80, 160, 160);
    
    // Subtle city lights (very minimal for realism)
    ctx.globalAlpha = 0.4;
    const cities = [
      { x: 0.48, y: 0.33 }, // Warsaw/Poland
      { x: 0.50, y: 0.40 }, // London
      { x: 0.51, y: 0.39 }, // Paris
      { x: 0.74, y: 0.34 }, // NYC
    ];
    
    cities.forEach(city => {
      ctx.fillStyle = 'rgba(255, 255, 200, 0.6)';
      ctx.beginPath();
      ctx.arc(city.x * canvas.width, city.y * canvas.height, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Subtle atmospheric terminator
    const terminatorGradient = ctx.createRadialGradient(
      canvas.width * 0.4, canvas.height * 0.5,
      0,
      canvas.width * 0.4, canvas.height * 0.5,
      canvas.width * 0.8
    );
    terminatorGradient.addColorStop(0, 'transparent');
    terminatorGradient.addColorStop(0.6, 'transparent');
    terminatorGradient.addColorStop(0.8, 'rgba(100, 150, 200, 0.06)');
    terminatorGradient.addColorStop(1, 'rgba(50, 100, 150, 0.1)');
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

// --- Realistic Earth Globe ---
const EarthGlobe = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const earthTexture = useMemo(() => createRealisticEarthTexture(), []);
  
  // Rotate to show Poland (20°E = -1.25 radians rotation)
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y = -1.25; // Fixed rotation to show Poland
    }
  });
  
  if (!earthTexture) {
    return (
      <Sphere ref={meshRef} args={[GLOBE_RADIUS, 64, 64]}>
        <meshStandardMaterial
          color="#1a3d6a"
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
        metalness={0.05}
        roughness={0.85}
        emissive={new THREE.Color(0x001a33)}
        emissiveIntensity={0.2}
        emissiveMap={earthTexture}
      />
    </Sphere>
  );
};

// --- Atmospheric Glow ---
const Atmosphere = () => {
  return (
    <Sphere args={[GLOBE_RADIUS + 0.12, 64, 64]}>
      <meshBasicMaterial
        color="#4a90e2"
        transparent
        opacity={0.12}
        side={THREE.BackSide}
      />
    </Sphere>
  );
};

// --- Poland Marker ---
const PolandMarker = () => {
  const groupRef = useRef<THREE.Group>(null);
  const polandPos = getPosition(POLAND_LAT, POLAND_LON, GLOBE_RADIUS);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    const pulse = 1 + Math.sin(time * 2) * 0.1;
    groupRef.current.scale.setScalar(pulse);
  });
  
  return (
    <group ref={groupRef} position={polandPos}>
      {/* Soft glow sphere */}
      <mesh>
        <sphereGeometry args={[0.15, 24, 24]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>
      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.4}
        />
      </mesh>
      {/* Subtle ring */}
      <mesh>
        <torusGeometry args={[0.22, 0.015, 8, 32]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
};

// --- Main Component ---
interface RealisticGlobeProps {
  className?: string;
}

const RealisticGlobe = ({ className = '' }: RealisticGlobeProps) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-slate-400 text-sm">Loading globe...</div>
        </div>
      }>
        <Canvas 
          camera={{ position: [0, 0, 6], fov: 50 }}
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance",
            stencil: false,
            depth: true
          }}
          dpr={[1, 2]}
          style={{ background: 'transparent' }}
        >
          {/* Realistic lighting */}
          <ambientLight intensity={0.5} color="#ffffff" />
          <directionalLight 
            position={[5, 5, 5]} 
            intensity={1.5} 
            color="#ffffff"
          />
          <directionalLight 
            position={[-5, -5, -5]} 
            intensity={0.5} 
            color="#ffffff"
          />
          <pointLight 
            position={[0, 8, 0]} 
            intensity={0.6} 
            color="#ffffff"
            distance={30}
          />
          
          {/* Globe components */}
          <Atmosphere />
          <EarthGlobe />
          <PolandMarker />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default RealisticGlobe;

