import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { useTranslation } from 'react-i18next';
import { MainCTA } from '@/components/ui/main-cta';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Award, Users, Trophy } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import professionalWoman from '@/assets/professional-woman.jpeg';

// Smooth Flowing Particles Background Animation
function SmoothFlowingParticles() {
  const groupRef = useRef<THREE.Group>(null);
  const prefersReducedMotion = useReducedMotion();

  useFrame((state) => {
    if (prefersReducedMotion || !groupRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    groupRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      mesh.position.x += Math.sin(time * 0.1 + i) * 0.002;
      mesh.position.y += Math.cos(time * 0.15 + i) * 0.002;
      mesh.rotation.z = time * 0.05 + i;
      
      // Gentle opacity pulse
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.opacity = 0.3 + Math.sin(time * 0.5 + i) * 0.2;
    });
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.3} />
      
      <group ref={groupRef}>
        {/* Flowing particles in organic pattern */}
        {[...Array(40)].map((_, i) => {
          const angle = (i / 40) * Math.PI * 2;
          const radius = 2 + (i % 3) * 2;
          const height = Math.sin(i * 0.5) * 3;
          
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * radius,
                Math.sin(angle) * radius + height,
                -5 + (i % 5)
              ]}
            >
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial 
                color={i % 2 === 0 ? "#3b82f6" : "#8b5cf6"}
                emissive={i % 2 === 0 ? "#3b82f6" : "#8b5cf6"}
                emissiveIntensity={0.4}
                transparent
                opacity={0.4}
                metalness={0.8}
                roughness={0.2}
              />
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
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-background pt-28 pb-32 md:pt-40 md:pb-40 lg:pt-48 lg:pb-48">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
          <SmoothFlowingParticles />
        </Canvas>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/60 to-background/95 z-[1]" />

      <div className="container relative z-10 px-4 mx-auto">
        <div className="grid lg:grid-cols-[1.2fr,400px] gap-8 lg:gap-12 items-start max-w-7xl mx-auto">
          <div className="space-y-8 md:pt-8 lg:pt-12">
            <div className="space-y-10 text-center lg:text-left">
              <h1 className="text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-heading font-black leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">
                  {t('hero.title')}
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-body font-light tracking-normal max-w-3xl mx-auto lg:mx-0">
                Poland&apos;s premier legal service for Polish citizenship by descent. With over 20 years of expertise and 25,000+ successful cases, we provide comprehensive guidance through every step of your citizenship journey.
              </p>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-body font-light tracking-normal max-w-3xl mx-auto lg:mx-0">
                Our proven track record and deep understanding of Polish ancestry law ensures your path to EU citizenship is handled with precision and care. From initial eligibility assessment to final passport acquisition, we deliver unmatched success rates and transparent pricing.
              </p>
            </div>
          </div>

          <div className="glass-card p-5 md:p-6 pb-8 rounded-2xl border border-primary/10 backdrop-blur-sm bg-background/5 w-full max-w-md mx-auto lg:mx-0 lg:-mt-24">
            <div className="mb-4 rounded-xl overflow-hidden opacity-70 dark:opacity-70 lg:opacity-100">
              <img 
                src={professionalWoman} 
                alt="Professional consultation" 
                className="w-full h-auto object-cover"
              />
            </div>
            <form onSubmit={handleSubmit} className="space-y-1.5">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-semibold">
                  {t('contact.name')} *
                </Label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="h-14 !border-2 dark:!border-primary/20 light:!border-primary/30 bg-blue-50/30 dark:bg-blue-950/30 backdrop-blur text-base w-full rounded-md px-3 outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-semibold">
                  {t('contact.email')} *
                </Label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="h-14 !border-2 dark:!border-primary/20 light:!border-primary/30 bg-blue-50/30 dark:bg-blue-950/30 backdrop-blur text-base w-full rounded-md px-3 outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country" className="text-sm bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-semibold">
                  {t('contact.country')}
                </Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData({...formData, country: value})}
                >
                  <SelectTrigger className="!h-14 !border-2 dark:!border-primary/20 light:!border-primary/30 !bg-blue-50/30 dark:!bg-blue-950/30 hover:!bg-blue-50/30 dark:hover:!bg-blue-950/30 focus:!bg-blue-50/30 dark:focus:!bg-blue-950/30 backdrop-blur touch-manipulation w-full !leading-tight !text-base [&>span]:bg-gradient-to-r [&>span]:from-slate-500 [&>span]:to-slate-700 [&>span]:bg-clip-text [&>span]:text-transparent !shadow-none hover:!shadow-none focus:!shadow-none">
                    <SelectValue placeholder={t('contact.countrySelect')} />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-card dark:border-border bg-background border-2 z-[100]">
                    {["USA", "UK", "Canada", "Australia", "South Africa", "Brazil", "Argentina", "Mexico", "Venezuela", "Israel", "Germany", "France", "Other"].map((country) => (
                      <SelectItem key={country} value={country} className="cursor-pointer hover:bg-primary/10">
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <button
                type="submit"
                className="w-full h-14 dark:bg-card/60 light:bg-gradient-to-br light:from-[hsl(220_90%_25%)] light:to-[hsl(220_90%_18%)] rounded-md text-base font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl border dark:border-primary/20 light:border-primary/30"
              >
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{t('contact.requestInfo')}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Stats Cards at Bottom */}
      <div className="container relative z-10 px-4 mx-auto mt-16 md:mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const FeatureIcon = feature.icon;
            return (
              <div 
                key={index} 
                className="glass-card hover-glow p-4 md:p-8 rounded-lg text-center relative min-h-[120px] md:min-h-[160px] flex items-center justify-center w-full max-w-[240px] mx-auto md:max-w-none backdrop-blur-md border dark:border-primary/20 light:border-primary/30 dark:bg-card/60 light:bg-gradient-to-br light:from-[hsl(220_90%_25%)] light:to-[hsl(220_90%_18%)] transition-all duration-300 hover:scale-105 hover:shadow-2xl light:hover:shadow-[0_0_40px_rgba(59,130,246,0.4)]"
              >
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <FeatureIcon className="w-5 h-5 md:w-6 md:h-6 dark:text-primary light:text-white/90 light:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" strokeWidth={1.5} />
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold dark:text-primary light:text-white light:drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]">{feature.stat}</h3>
                  <p className="text-sm md:text-base font-semibold dark:bg-gradient-to-r dark:from-primary dark:to-secondary dark:bg-clip-text dark:text-transparent light:text-gray-200 light:drop-shadow-[0_0_4px_rgba(255,255,255,0.5)] leading-tight">{feature.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
