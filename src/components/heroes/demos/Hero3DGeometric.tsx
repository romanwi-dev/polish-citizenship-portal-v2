import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox } from '@react-three/drei';
import { useTranslation } from 'react-i18next';
import { MainCTA } from '@/components/ui/main-cta';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Award from 'lucide-react/dist/esm/icons/award';
import Users from 'lucide-react/dist/esm/icons/users';
import Trophy from 'lucide-react/dist/esm/icons/trophy';
import { useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import * as THREE from 'three';

function GeometricShape({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const prefersReducedMotion = useReducedMotion();

  useFrame((state) => {
    if (meshRef.current && !prefersReducedMotion) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.3;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <RoundedBox ref={meshRef} args={[1, 1, 1]} position={position} radius={0.1}>
      <meshPhysicalMaterial
        color={color}
        metalness={0.9}
        roughness={0.1}
        clearcoat={1}
      />
    </RoundedBox>
  );
}

export const Hero3DGeometric = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <GeometricShape position={[-2, 1, 0]} color="#dc2626" />
          <GeometricShape position={[2, -1, -1]} color="#3b82f6" />
          <GeometricShape position={[0, 2, -2]} color="#dc2626" />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={!prefersReducedMotion}
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background z-[1]" />

      {/* Content */}
      <div className="container relative z-10 px-4 py-20 mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-primary/30">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('hero.badge')}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-8xl font-heading font-black leading-tight tracking-tight">
            <span className={`bg-clip-text text-transparent ${
              isRTL ? 'bg-gradient-to-l from-primary via-secondary to-primary-foreground' : 'bg-gradient-to-r from-primary via-secondary to-primary-foreground'
            }`}>
              {t('hero.title')}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl font-semibold leading-relaxed text-foreground/90">
            {t('hero.description')}
          </p>

          <MainCTA
            onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank')}
            ariaLabel="Take the Polish Citizenship Test"
          >
            {t('hero.cta')}
          </MainCTA>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto pt-8">
            <div className="glass-card hover-glow p-8 rounded-lg backdrop-blur-md border border-primary/20">
              <Award className="w-6 h-6 text-primary mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-5xl font-bold text-primary mb-2">&gt;20</h3>
              <p className="text-base font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('hero.stats.experience')}
              </p>
            </div>
            
            <div className="glass-card hover-glow p-8 rounded-lg backdrop-blur-md border border-secondary/20">
              <Users className="w-6 h-6 text-secondary mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-5xl font-bold text-secondary mb-2">&gt;25,000</h3>
              <p className="text-base font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('hero.stats.cases')}
              </p>
            </div>
            
            <div className="glass-card hover-glow p-8 rounded-lg backdrop-blur-md border border-primary/20">
              <Trophy className="w-6 h-6 text-primary mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-5xl font-bold text-primary mb-2">100%</h3>
              <p className="text-base font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('hero.stats.success')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};