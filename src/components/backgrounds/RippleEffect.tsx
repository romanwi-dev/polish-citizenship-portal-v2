import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function EUFlag() {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = new THREE.PlaneGeometry(16, 10, 120, 80);
  
  useFrame((state) => {
    if (meshRef.current) {
      const positions = meshRef.current.geometry.attributes.position;
      const time = state.clock.getElapsedTime();
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        
        const distance = Math.sqrt(x * x + y * y);
        const ripple = Math.sin(distance - time * 3) * 0.4 * Math.exp(-distance * 0.1);
        
        positions.setZ(i, ripple);
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
        metalness={0.3}
        roughness={0.3}
      />
    </mesh>
  );
}

function createEUFlagTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#0055cc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 300;
  const starSize = 85;
  
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    const starGradient = ctx.createRadialGradient(x, y, 0, x, y, starSize);
    starGradient.addColorStop(0, '#FFEE00');
    starGradient.addColorStop(1, '#FFAA00');
    
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

export const RippleEffect = () => (
  <div className="w-full h-full opacity-12 blur-sm">
    <Canvas camera={{ position: [0, 0, 10], fov: 80 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 8, 10]} intensity={1.2} color="#ffffff" />
      <pointLight position={[0, 0, 12]} intensity={0.6} color="#6699ff" />
      <EUFlag />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.4} />
    </Canvas>
  </div>
);
