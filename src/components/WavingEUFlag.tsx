import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function EUFlag() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create EU flag geometry with many segments for smooth waving
  const geometry = new THREE.PlaneGeometry(16, 10, 100, 60);
  
  useFrame((state) => {
    if (meshRef.current) {
      const positions = meshRef.current.geometry.attributes.position;
      const time = state.clock.getElapsedTime();
      
      // Create wave effect
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        
        const waveX1 = Math.sin(x * 0.3 + time * 1.5) * 0.3;
        const waveX2 = Math.sin(x * 0.5 + time * 2) * 0.2;
        const waveY1 = Math.sin(y * 0.4 + time * 1.8) * 0.2;
        
        const z = waveX1 + waveX2 + waveY1;
        positions.setZ(i, z);
      }
      
      positions.needsUpdate = true;
      meshRef.current.geometry.computeVertexNormals();
    }
  });

  // Create EU flag texture with canvas
  const texture = createEUFlagTexture();

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial 
        map={texture}
        side={THREE.DoubleSide}
        metalness={0.2}
        roughness={0.4}
      />
    </mesh>
  );
}

function createEUFlagTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d')!;
  
  // EU Blue background
  ctx.fillStyle = '#003399';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw 12 gold stars in a circle
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 300;
  const starSize = 80;
  
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    drawStar(ctx, x, y, 5, starSize, starSize / 2, '#FFCC00');
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number,
  color: string
) {
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
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

export const WavingEUFlag = () => {
  return (
    <div className="w-full h-full opacity-10 blur-sm">
      <Canvas camera={{ position: [0, 0, 12], fov: 75 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} color="#5b8dce" />
        <pointLight position={[0, 0, 10]} intensity={0.5} color="#ffffff" />
        
        <EUFlag />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 2} 
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
};
