import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function EUFlag() {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = new THREE.PlaneGeometry(16, 10, 95, 65);
  
  useFrame((state) => {
    if (meshRef.current) {
      const positions = meshRef.current.geometry.attributes.position;
      const time = state.clock.getElapsedTime();
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      
      // Shimmer effect on metalness
      material.metalness = 0.3 + Math.sin(time * 3) * 0.2;
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        
        const shimmer = Math.sin(x * 0.6 + time * 2.5) * Math.cos(y * 0.4 + time * 2) * 0.25;
        
        positions.setZ(i, shimmer);
      }
      
      positions.needsUpdate = true;
      meshRef.current.geometry.computeVertexNormals();
    }
  });

  const texture = createEUFlagTexture();

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial 
        map={texture}
        side={THREE.DoubleSide}
        metalness={0.5}
        roughness={0.25}
        emissive="#002266"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

function createEUFlagTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d')!;
  
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, '#0055dd');
  gradient.addColorStop(0.5, '#0033aa');
  gradient.addColorStop(1, '#0055dd');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 300;
  const starSize = 83;
  
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    const starGradient = ctx.createRadialGradient(x, y, 0, x, y, starSize);
    starGradient.addColorStop(0, '#FFFF00');
    starGradient.addColorStop(1, '#FFCC00');
    
    drawStar(ctx, x, y, 5, starSize, starSize / 2, starGradient);
  }
  
  return new THREE.CanvasTexture(canvas);
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number, color: string | CanvasGradient) {
  let rot = Math.PI / 2 * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    let x = cx + Math.cos(rot) * outerRadius;
    let y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;
    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

export const ShimmerEffect = () => (
  <div className="w-full h-full opacity-22 blur-[1px]">
    <Canvas camera={{ position: [0, 0, 11], fov: 74 }}>
      <ambientLight intensity={0.75} />
      <directionalLight position={[15, 10, 10]} intensity={1.6} color="#aaddff" />
      <pointLight position={[-10, 10, 8]} intensity={0.7} color="#ffffff" />
      <EUFlag />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.28} />
    </Canvas>
  </div>
);
