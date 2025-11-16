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

// Realistic waving Polish flag
function WavingPolishFlag() {
  const meshRef = useRef<THREE.Mesh>(null);
  const prefersReducedMotion = useReducedMotion();

  useFrame((state) => {
    if (prefersReducedMotion || !meshRef.current) return;
    
    const time = state.clock.elapsedTime;
    const geometry = meshRef.current.geometry;
    const position = geometry.attributes.position;

    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const y = position.getY(i);
      
      // Create realistic wave motion
      const waveX = Math.sin(x * 0.5 + time * 1.5) * 0.3;
      const waveY = Math.sin(y * 0.3 + time * 1.2) * 0.2;
      const waveZ = Math.sin(x * 0.3 + y * 0.2 + time) * 0.5;
      
      position.setZ(i, waveX + waveY + waveZ);
    }
    
    position.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <directionalLight position={[-5, -5, -5]} intensity={0.5} />
      
      {/* White half of Polish flag - toned color */}
      <mesh ref={meshRef} position={[0, 1.5, 0]}>
        <planeGeometry args={[16, 3, 32, 16]} />
        <meshStandardMaterial 
          color="#f5f5f0" 
          side={THREE.DoubleSide}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      
      {/* Red half of Polish flag - toned color */}
      <mesh position={[0, -1.5, 0]}>
        <planeGeometry args={[16, 3, 32, 16]} />
        <meshStandardMaterial 
          color="#c4524f" 
          side={THREE.DoubleSide}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
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
        <Canvas camera={{ position: [0, 0, 6], fov: 75 }}>
          <WavingPolishFlag />
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="glass-card hover-glow p-4 md:p-8 rounded-lg text-center relative min-h-[120px] md:min-h-[160px] flex items-center justify-center w-full max-w-[240px] mx-auto md:max-w-none backdrop-blur-md border dark:border-primary/20 light:border-primary/30 dark:bg-card/60 light:bg-gradient-to-br light:from-[hsl(220_90%_25%)] light:to-[hsl(220_90%_18%)] transition-all duration-300 hover:scale-105 hover:shadow-2xl light:hover:shadow-[0_0_40px_rgba(59,130,246,0.4)]"
                >
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                    <feature.icon className="w-5 h-5 md:w-6 md:h-6 dark:text-primary light:text-white/90 light:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" strokeWidth={1.5} />
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold dark:text-primary light:text-white light:drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]">{feature.stat}</h3>
                    <p className="text-sm md:text-base font-semibold dark:bg-gradient-to-r dark:from-primary dark:to-secondary dark:bg-clip-text dark:text-transparent light:text-gray-200 light:drop-shadow-[0_0_4px_rgba(255,255,255,0.5)] leading-tight">{feature.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 md:p-8 rounded-2xl border border-primary/10 backdrop-blur-sm bg-background/10">
            <div className="mb-6 rounded-xl overflow-hidden">
              <img 
                src={professionalWoman} 
                alt="Professional consultation" 
                className="w-full h-auto object-cover"
              />
            </div>
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
