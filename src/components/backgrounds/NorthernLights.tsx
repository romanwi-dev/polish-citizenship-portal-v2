import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function EUFlag() {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = new THREE.PlaneGeometry(16, 10, 105, 70);
  
  useFrame((state) => {
    if (meshRef.current) {
      const positions = meshRef.current.geometry.attributes.position;
      const time = state.clock.getElapsedTime();
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        
        const aurora1 = Math.sin(x * 0.25 + time * 1.3 + y * 0.1) * 0.3;
        const aurora2 = Math.cos(x * 0.15 + time * 1.7 - y * 0.15) * 0.25;
        
        positions.setZ(i, aurora1 + aurora2);
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
        metalness={0.2}
        roughness={0.4}
        emissive="#003355"
        emissiveIntensity={0.3}
        transparent
        opacity={0.95}
      />
    </mesh>
  );
}

function createEUFlagTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d')!;
  
  // Aurora-like gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#004477');
  gradient.addColorStop(0.3, '#003366');
  gradient.addColorStop(0.7, '#002255');
  gradient.addColorStop(1, '#004477');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 300;
  const starSize = 81;
  
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    const starGradient = ctx.createRadialGradient(x, y, 0, x, y, starSize * 1.5);
    starGradient.addColorStop(0, '#FFEE88');
    starGradient.addColorStop(0.5, '#FFD700');
    starGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    
    ctx.fillStyle = starGradient;
    ctx.fillRect(x - starSize * 1.5, y - starSize * 1.5, starSize * 3, starSize * 3);
    
    drawStar(ctx, x, y, 5, starSize, starSize / 2, '#FFEE88');
  }
  
  return new THREE.CanvasTexture(canvas);
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number, color: string) {
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

export const NorthernLights = () => (
  <div className="w-full h-full opacity-20 blur-md">
    <Canvas camera={{ position: [0, 0, 13], fov: 73 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 8, 10]} intensity={1} color="#6699cc" />
      <pointLight position={[-8, 8, 12]} intensity={0.8} color="#88aaff" />
      <pointLight position={[8, -5, 10]} intensity={0.6} color="#99ccff" />
      <EUFlag />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.22} />
    </Canvas>
  </div>
);
