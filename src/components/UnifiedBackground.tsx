import { lazy, Suspense, useState, useEffect, memo } from "react";
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { StaticHeritagePlaceholder } from "@/components/heroes/StaticHeritagePlaceholder";
import { StaticHeritageLightTheme } from "@/components/heroes/StaticHeritageLightTheme";
import { ANIMATION_CONFIG } from "@/config/animations";

// Unified 3D particle system - combines background + hero particles
const UnifiedParticles = memo(() => {
  const groupRef = useRef<THREE.Group>(null);
  const prefersReducedMotion = useReducedMotion();

  useFrame((state) => {
    if (prefersReducedMotion || !groupRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    groupRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      
      // Differentiate background (0-39) vs hero particles (40-79)
      const isHeroParticle = i >= 40;
      
      if (isHeroParticle) {
        // Hero particles: gentle flowing motion
        mesh.position.x += Math.sin(time * 0.1 + i) * 0.002;
        mesh.position.y += Math.cos(time * 0.15 + i) * 0.002;
        mesh.rotation.z = time * 0.05 + i;
        
        const material = mesh.material as THREE.MeshStandardMaterial;
        material.opacity = 0.3 + Math.sin(time * 0.5 + i) * 0.2;
      } else {
        // Background particles: subtle rotation
        const radius = 4 + Math.sin(time * 0.2 + i * 0.3) * 0.5;
        const angle = (i / 40) * Math.PI * 2 + time * 0.05;
        
        mesh.position.x = Math.cos(angle) * radius;
        mesh.position.y = Math.sin(angle) * radius;
        mesh.rotation.x = time * 0.1 + i * 0.1;
        mesh.rotation.y = time * 0.15 + i * 0.1;
      }
    });
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (groupRef.current) {
        groupRef.current.children.forEach((child) => {
          const mesh = child as THREE.Mesh;
          mesh.geometry.dispose();
          (mesh.material as THREE.Material).dispose();
        });
      }
    };
  }, []);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.3} />
      
      <group ref={groupRef}>
        {/* Background particles (40) */}
        {[...Array(40)].map((_, i) => {
          const angle = (i / 40) * Math.PI * 2;
          const radius = 4;
          
          return (
            <mesh
              key={`bg-${i}`}
              position={[
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                -8 + (i % 8)
              ]}
            >
              <sphereGeometry args={[0.08, 12, 12]} />
              <meshStandardMaterial 
                color="#dc2626"
                emissive="#dc2626"
                emissiveIntensity={0.3}
                transparent
                opacity={0.25}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
          );
        })}
        
        {/* Hero particles (40) - only visible in hero section */}
        {[...Array(40)].map((_, i) => {
          const angle = (i / 40) * Math.PI * 2;
          const radius = 2 + (i % 3) * 2;
          const height = Math.sin(i * 0.5) * 3;
          
          return (
            <mesh
              key={`hero-${i}`}
              position={[
                Math.cos(angle) * radius,
                Math.sin(angle) * radius + height,
                -5 + (i % 5)
              ]}
            >
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial 
                color={i % 2 === 0 ? "#3b82f6" : "#8b5cf6"}
                emissive={i % 2 === 0 ? "#3b82f6" : "#8b5cf6"}
                emissiveIntensity={0.4}
                transparent
                opacity={0.4}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
          );
        })}
      </group>
    </>
  );
});

UnifiedParticles.displayName = 'UnifiedParticles';

// Lazy-loaded 3D Canvas wrapper
const Unified3DCanvas = memo(() => (
  <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
    <UnifiedParticles />
  </Canvas>
));

Unified3DCanvas.displayName = 'Unified3DCanvas';

export const UnifiedBackground = memo(() => {
  const [show3D, setShow3D] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();
    
    // Watch for theme changes with proper cleanup
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    // Cleanup observer on unmount
    return () => observer.disconnect();
  }, []);

  // Delay 3D background loading for dark themes only
  useEffect(() => {
    if (isDark) {
      const timer = setTimeout(() => {
        setShow3D(true);
      }, ANIMATION_CONFIG.BACKGROUND_3D_DELAY);
      return () => clearTimeout(timer);
    } else {
      setShow3D(false);
    }
  }, [isDark]);

  // LIGHT theme: Show immediate light background
  if (!isDark) {
    return (
      <div className="fixed inset-0 z-0">
        <StaticHeritageLightTheme />
      </div>
    );
  }

  // DARK theme: Show 3D background with loading state
  return (
    <div className="fixed inset-0 z-0">
      {show3D ? (
        <Suspense fallback={<StaticHeritagePlaceholder />}>
          <Unified3DCanvas />
        </Suspense>
      ) : (
        <StaticHeritagePlaceholder />
      )}
    </div>
  );
});

UnifiedBackground.displayName = 'UnifiedBackground';
