import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function EUFlag() {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = new THREE.PlaneGeometry(16, 10, 110, 70);
  
  useFrame((state) => {
    if (meshRef.current) {
      const positions = meshRef.current.geometry.attributes.position;
      const time = state.clock.getElapsedTime();
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        
        const wave1 = Math.sin(x * 0.4 + time * 1.2) * 0.25;
        const wave2 = Math.sin(x * 0.3 + y * 0.3 + time * 1.5) * 0.2;
        const wave3 = Math.cos(y * 0.5 + time * 1.8) * 0.15;
        
        positions.setZ(i, wave1 + wave2 + wave3);
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
        metalness={0.15}
        roughness={0.5}
      />
    </mesh>
  );
}

function createEUFlagTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d')!;
  
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#003388');
  gradient.addColorStop(0.5, '#0044aa');
  gradient.addColorStop(1, '#0033bb');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 300;
  const starSize = 78;
  
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    drawStar(ctx, x, y, 5, starSize, starSize / 2, '#FFDD00');
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

export const WaveCascade = () => (
  <div className="w-full h-full opacity-16 blur-sm">
    <Canvas camera={{ position: [0, 0, 12], fov: 76 }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[9, 9, 7]} intensity={1.3} color="#ffffff" />
      <pointLight position={[-5, 5, 10]} intensity={0.5} color="#7799ff" />
      <EUFlag />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.35} />
    </Canvas>
  </div>
);
