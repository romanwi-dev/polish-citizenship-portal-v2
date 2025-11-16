import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { useTranslation } from 'react-i18next';
import { MainCTA } from '@/components/ui/main-cta';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Award, Users, Trophy } from 'lucide-react';
import { CountrySelect } from '@/components/CountrySelect';

function WavingFlags() {
  const polishFlagRef = useRef<THREE.Group>(null);
  const euFlagRef = useRef<THREE.Group>(null);
  const prefersReducedMotion = useReducedMotion();

  useFrame((state) => {
    if (prefersReducedMotion) return;
    
    if (polishFlagRef.current) {
      polishFlagRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      polishFlagRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
    if (euFlagRef.current) {
      euFlagRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3 + Math.PI) * 0.2;
      euFlagRef.current.position.y = Math.cos(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      <group ref={polishFlagRef} position={[-3, 0, 0]}>
        <mesh>
          <planeGeometry args={[3, 2]} />
          <meshStandardMaterial color="#dc2626" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -1, 0]}>
          <planeGeometry args={[3, 2]} />
          <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
      </group>

      <group ref={euFlagRef} position={[3, 0, 0]}>
        <mesh>
          <planeGeometry args={[3, 2]} />
          <meshStandardMaterial color="#003399" side={THREE.DoubleSide} />
        </mesh>
        {[...Array(12)].map((_, i) => {
          const angle = (i * Math.PI * 2) / 12;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.8, Math.sin(angle) * 0.8, 0.01]}
            >
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color="#ffd700" />
            </mesh>
          );
        })}
      </group>
    </>
  );
}

export const HeroWavingFlags = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank');
  };

  const features = [
    { icon: Award, stat: '>20', text: t('hero.stats.experience') },
    { icon: Users, stat: '>25,000', text: t('hero.stats.cases') },
    { icon: Trophy, stat: '100%', text: t('hero.stats.success') }
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <WavingFlags />
        </Canvas>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/70 to-background/95 z-[1]" />

      <div className="container relative z-10 px-4 mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-heading font-black">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">
                {t('hero.title')}
              </span>
            </h1>
            <p className="text-lg text-foreground/80">
              {t('hero.description')}
            </p>

            <div className="grid gap-4 mt-8">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="glass-card hover-glow p-4 rounded-lg text-center backdrop-blur-md border dark:border-primary/20 light:border-primary/30 dark:bg-card/60 light:bg-gradient-to-br light:from-[hsl(220_90%_25%)] light:to-[hsl(220_90%_18%)] transition-all duration-300 hover:scale-105 hover:shadow-2xl light:hover:shadow-[0_0_40px_rgba(59,130,246,0.4)]"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <feature.icon className="w-6 h-6 dark:text-primary light:text-white/90 light:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" strokeWidth={1.5} />
                    <h3 className="text-4xl font-bold dark:text-primary light:text-white light:drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]">{feature.stat}</h3>
                    <p className="text-sm font-semibold dark:bg-gradient-to-r dark:from-primary dark:to-secondary dark:bg-clip-text dark:text-transparent light:text-gray-200 light:drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]">{feature.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-primary/10 backdrop-blur-xl bg-background/30">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {t('contact.form.name')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg bg-background/50 border border-border focus:border-primary outline-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {t('contact.form.email')}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg bg-background/50 border border-border focus:border-primary outline-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {t('contact.form.country')}
                </label>
                <CountrySelect
                  value={formData.country}
                  onChange={(value) => setFormData({...formData, country: value})}
                />
              </div>
              <MainCTA ariaLabel="Start your Polish citizenship journey" wrapperClassName="w-full">
                <span className="block w-full text-center py-1">{t('contact.form.submit')}</span>
              </MainCTA>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
