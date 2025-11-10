import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

interface WavingFlagProps {
  position: [number, number, number];
  flagUrl: string;
}

function WavingFlag({ position, flagUrl }: WavingFlagProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(flagUrl);
  
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(2, 1.5, 32, 32);
    return geo;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const positions = meshRef.current.geometry.attributes.position;
    const time = state.clock.getElapsedTime();
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      
      const waveX = Math.sin(x * 2 + time * 2) * 0.1;
      const waveY = Math.sin(y * 3 + time * 1.5) * 0.05;
      
      positions.setZ(i, waveX + waveY);
    }
    
    positions.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} position={position} geometry={geometry}>
      <meshStandardMaterial 
        map={texture} 
        side={THREE.DoubleSide}
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
}

function Scene() {
  const flags = useMemo(() => [
    { url: "https://flagcdn.com/w320/pl.png", position: [-6, 1, 0] as [number, number, number] },
    { url: "https://flagcdn.com/w320/cz.png", position: [-3.5, 0.5, -1] as [number, number, number] },
    { url: "https://flagcdn.com/w320/hu.png", position: [-1, 1.2, 0.5] as [number, number, number] },
    { url: "https://flagcdn.com/w320/de.png", position: [1.5, 0.8, -0.5] as [number, number, number] },
    { url: "https://flagcdn.com/w320/eu.png", position: [0, -0.5, 2] as [number, number, number], scale: 1.5 },
    { url: "https://flagcdn.com/w320/fr.png", position: [4, 0.5, 0] as [number, number, number] },
    { url: "https://flagcdn.com/w320/at.png", position: [-2, -1, 1] as [number, number, number] },
    { url: "https://flagcdn.com/w320/it.png", position: [6, 1.2, -1] as [number, number, number] },
  ], []);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />
      
      {flags.map((flag, index) => (
        <WavingFlag 
          key={index} 
          position={flag.position} 
          flagUrl={flag.url}
        />
      ))}
    </>
  );
}

const EuropeanFlags = () => {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8 relative z-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            European Union Citizenship
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Polish citizenship grants you full access to live, work, and study across all 27 EU member states
          </p>
        </motion.div>

        <div className="w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden glass-card">
          <Canvas
            camera={{ position: [0, 0, 8], fov: 50 }}
            style={{ background: 'transparent' }}
          >
            <Scene />
          </Canvas>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Freedom of movement across the European Union - work, study, and reside in any EU member state
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default EuropeanFlags;
