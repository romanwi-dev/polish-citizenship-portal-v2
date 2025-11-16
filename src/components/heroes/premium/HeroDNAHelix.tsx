import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MainCTA } from '@/components/ui/main-cta';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import * as THREE from 'three';

function DNAHelix() {
  const groupRef = useRef<THREE.Group>(null);
  const prefersReducedMotion = useReducedMotion();

  useFrame((state) => {
    if (groupRef.current && !prefersReducedMotion) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  const spheres = [];
  for (let i = 0; i < 20; i++) {
    const t = (i / 20) * Math.PI * 4;
    const x1 = Math.cos(t) * 1.5;
    const z1 = Math.sin(t) * 1.5;
    const x2 = Math.cos(t + Math.PI) * 1.5;
    const z2 = Math.sin(t + Math.PI) * 1.5;
    const y = i * 0.4 - 4;

    spheres.push(
      <mesh key={`red-${i}`} position={[x1, y, z1]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.3} />
      </mesh>
    );
    spheres.push(
      <mesh key={`blue-${i}`} position={[x2, y, z2]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#003399" emissive="#003399" emissiveIntensity={0.3} />
      </mesh>
    );
  }

  return <group ref={groupRef}>{spheres}</group>;
}

export const HeroDNAHelix = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsFlipped(true);
      setEmail('');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <DNAHelix />
        </Canvas>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/95 z-[1]" />

      <div className="container relative z-10 px-4 mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-6xl md:text-8xl font-heading font-black">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                {t('hero.title')}
              </span>
            </h1>
            <p className="text-xl text-foreground/80">
              {t('hero.description')}
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-border/50 backdrop-blur-xl relative" style={{ perspective: '1000px' }}>
            <div className={`relative transition-transform duration-700 ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
              {/* Front - Form */}
              <div className={`${isFlipped ? 'invisible' : 'visible'}`} style={{ backfaceVisibility: 'hidden' }}>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border focus:border-primary outline-none"
                      required
                    />
                  </div>
                  <MainCTA ariaLabel="Start your Polish citizenship journey" wrapperClassName="">Get Started</MainCTA>
                </form>
              </div>
              
              {/* Back - Success */}
              <div className={`absolute inset-0 ${isFlipped ? 'visible' : 'invisible'}`} style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold">{t('contact.successTitle')}</h3>
                  <p className="text-foreground/70">{t('contact.successMessage')}</p>
                  <button
                    onClick={() => setIsFlipped(false)}
                    className="mt-4 text-primary hover:underline"
                  >
                    {t('contact.submitAnother')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
