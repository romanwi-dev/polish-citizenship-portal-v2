import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function EUFlag() {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = new THREE.PlaneGeometry(16, 10, 85, 55);
  
  useFrame((state) => {
    if (meshRef.current) {
      const positions = meshRef.current.geometry.attributes.position;
      const time = state.clock.getElapsedTime();
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        
        const wave = Math.sin(x * 0.35 + time * 1.1) * 0.18;
        const depth = Math.cos(y * 0.35 + time * 0.9) * 0.18;
        
        positions.setZ(i, wave + depth);
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
        metalness={0.6}
        roughness={0.15}
        emissive="#000033"
        emissiveIntensity={0.4}
      />
    </mesh>
  );
}

function createEUFlagTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d')!;
  
  const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 100, canvas.width / 2, canvas.height / 2, canvas.width);
  gradient.addColorStop(0, '#001166');
  gradient.addColorStop(1, '#000033');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 300;
  const starSize = 85;
  
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 25;
    drawStar(ctx, x, y, 5, starSize, starSize / 2, '#FFD700');
  }
  ctx.shadowBlur = 0;
  
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

export const DeepSpace = () => (
  <div className="w-full h-full opacity-30 blur-[4px]">
    <Canvas camera={{ position: [0, 0, 15], fov: 68 }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 12]} intensity={0.9} color="#5577bb" />
      <pointLight position={[0, 0, 20]} intensity={1.2} color="#8899cc" />
      <EUFlag />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.18} />
    </Canvas>
  </div>
);
