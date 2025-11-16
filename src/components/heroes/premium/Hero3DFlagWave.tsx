import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MainCTA } from '@/components/ui/main-cta';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { CheckCircle, Shield, Zap } from 'lucide-react';
import * as THREE from 'three';

function WavingFlag({ position, isEU }: { position: [number, number, number], isEU: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const prefersReducedMotion = useReducedMotion();

  useFrame((state) => {
    if (meshRef.current && !prefersReducedMotion) {
      const time = state.clock.getElapsedTime();
      const geometry = meshRef.current.geometry as THREE.PlaneGeometry;
      const position = geometry.attributes.position;

      for (let i = 0; i < position.count; i++) {
        const x = position.getX(i);
        const y = position.getY(i);
        const wave = Math.sin(x * 2 + time) * 0.1 * Math.cos(y + time * 0.5);
        position.setZ(i, wave);
      }
      position.needsUpdate = true;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={[0, 0.5, 0]}>
      <planeGeometry args={[3, 2, 32, 32]} />
      <meshPhysicalMaterial 
        color={isEU ? '#003399' : '#dc2626'}
        metalness={0.3}
        roughness={0.4}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export const Hero3DFlagWave = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank');
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <WavingFlag position={[-2, 0, 0]} isEU={false} />
          <WavingFlag position={[2, 0, 0]} isEU={true} />
        </Canvas>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/95 z-[1]" />

      <div className="container relative z-10 px-4 mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl font-heading font-black leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                {t('hero.title')}
              </span>
            </h1>
            <p className="text-lg text-foreground/80">
              {t('hero.description')}
            </p>
            
            <div className="grid sm:grid-cols-3 gap-4 pt-4">
              <div className="flex items-start gap-3 bg-card/50 p-4 rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">Expert Guidance</h3>
                  <p className="text-xs text-muted-foreground">Professional support throughout</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-card/50 p-4 rounded-lg">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">Secure Process</h3>
                  <p className="text-xs text-muted-foreground">Data protection guaranteed</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-card/50 p-4 rounded-lg">
                <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">Fast Track</h3>
                  <p className="text-xs text-muted-foreground">Streamlined application</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-background/80 border border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-background/80 border border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-background/80 border border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-background/80 border border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
                  placeholder="Tell us about your case..."
                />
              </div>
              <MainCTA ariaLabel="Start your Polish citizenship journey" wrapperClassName="w-full">
                Get Started
              </MainCTA>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
