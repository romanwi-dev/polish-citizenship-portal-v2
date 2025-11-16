import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { useTranslation } from 'react-i18next';
import { MainCTA } from '@/components/ui/main-cta';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Award, Users, Trophy } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// European symbols: EU stars, monuments, cultural icons
function WavingFlags() {
  const polishFlagRef = useRef<THREE.Group>(null);
  const euStarsRef = useRef<THREE.Group>(null);
  const prefersReducedMotion = useReducedMotion();

  useFrame((state) => {
    if (prefersReducedMotion) return;
    
    if (polishFlagRef.current) {
      polishFlagRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      polishFlagRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
    if (euStarsRef.current) {
      euStarsRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Polish Flag */}
      <group ref={polishFlagRef} position={[-2, 0, 0]}>
        <mesh>
          <planeGeometry args={[3, 2]} />
          <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -1, 0]}>
          <planeGeometry args={[3, 2]} />
          <meshStandardMaterial color="#dc2626" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* EU Stars Circle */}
      <group ref={euStarsRef} position={[2, 0, 0]}>
        <mesh>
          <circleGeometry args={[1.5, 32]} />
          <meshStandardMaterial color="#003399" side={THREE.DoubleSide} />
        </mesh>
        {[...Array(12)].map((_, i) => {
          const angle = (i * Math.PI * 2) / 12 - Math.PI / 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 1.2, Math.sin(angle) * 1.2, 0.01]}
            >
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.5} />
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

      <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/60 to-background/95 z-[1]" />

      <div className="container relative z-10 px-4 mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-black">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">
                {t('hero.title')}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-foreground/80">
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

          <div className="glass-card p-6 md:p-8 rounded-2xl border border-primary/10 backdrop-blur-sm bg-background/10">
            <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('contact.formTitle') || 'Start Your Journey'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-semibold">
                  {t('contact.nameLabel') || 'Name'} *
                </Label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="h-14 border-2 border-blue-900/30 form-input-glow bg-blue-50/30 dark:bg-blue-950/30 backdrop-blur text-xl md:text-base w-full rounded-md px-3 outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-semibold">
                  {t('contact.emailLabel') || 'Email'} *
                </Label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="h-14 border-2 border-blue-900/30 form-input-glow bg-blue-50/30 dark:bg-blue-950/30 backdrop-blur text-xl md:text-base w-full rounded-md px-3 outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="text-base bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-semibold">
                  {t('contact.countryLabel') || 'Country'}
                </Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData({...formData, country: value})}
                >
                  <SelectTrigger className="!h-14 !border-2 !border-blue-900/30 hover-glow focus:shadow-lg !bg-blue-50/30 dark:!bg-blue-950/30 backdrop-blur touch-manipulation w-full !leading-tight !text-lg [&>span]:bg-gradient-to-r [&>span]:from-slate-500 [&>span]:to-slate-700 [&>span]:bg-clip-text [&>span]:text-transparent">
                    <SelectValue placeholder={t('contact.countryPlaceholder') || 'Select your country'} />
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
