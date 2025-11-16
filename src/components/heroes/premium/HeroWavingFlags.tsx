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

// European Stars 3D Animation
function EuropeanStars3D() {
  const groupRef = useRef<THREE.Group>(null);
  const prefersReducedMotion = useReducedMotion();

  useFrame((state) => {
    if (prefersReducedMotion || !groupRef.current) return;
    
    const time = state.clock.elapsedTime;
    groupRef.current.rotation.y = time * 0.1;
    
    groupRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      mesh.position.y = Math.sin(time + i * 0.5) * 0.5;
      mesh.rotation.x = time * 0.3 + i;
      mesh.rotation.z = time * 0.2 + i;
    });
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={0.5} color="#ffd700" />
      
      <group ref={groupRef}>
        {/* EU Circle of 12 stars in 3D */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * Math.PI * 2) / 12;
          const radius = 4;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                Math.sin(i * 0.5) * 2
              ]}
            >
              <octahedronGeometry args={[0.3, 0]} />
              <meshStandardMaterial 
                color="#ffd700"
                emissive="#ffd700"
                emissiveIntensity={0.6}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
          );
        })}
        
        {/* Additional geometric shapes */}
        {[...Array(8)].map((_, i) => {
          const angle = (i * Math.PI * 2) / 8 + Math.PI / 8;
          const radius = 6;
          return (
            <mesh
              key={`outer-${i}`}
              position={[
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                -3
              ]}
            >
              <boxGeometry args={[0.4, 0.4, 0.4]} />
              <meshStandardMaterial 
                color="#003399"
                metalness={0.5}
                roughness={0.3}
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
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
          <EuropeanStars3D />
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
            <p className="text-xl md:text-2xl font-heading text-foreground/80">
              {t('hero.description')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mt-8">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="glass-card hover-glow p-6 md:p-8 rounded-lg text-center relative min-h-[140px] md:min-h-[160px] flex items-center justify-center backdrop-blur-md border dark:border-primary/20 light:border-primary/30 dark:bg-card/60 light:bg-gradient-to-br light:from-[hsl(220_90%_25%)] light:to-[hsl(220_90%_18%)] transition-all duration-300 hover:scale-105 hover:shadow-2xl light:hover:shadow-[0_0_40px_rgba(59,130,246,0.4)]"
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

          <div className="glass-card p-6 md:p-8 rounded-2xl border border-primary/10 backdrop-blur-sm bg-background/10 max-w-md mx-auto lg:mx-0">
            <div className="mb-6 rounded-xl overflow-hidden">
              <img 
                src={professionalWoman} 
                alt="Professional consultation" 
                className="w-full h-auto object-cover"
              />
            </div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-2 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('contact.formTitle') || 'Get Your Free Assessment'}
            </h2>
            <p className="text-center text-muted-foreground mb-6">
              Start your Polish citizenship journey today
            </p>
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
                <span className="block w-full text-center py-1 font-semibold">
                  {t('contact.form.submit') || 'Get Started Now'}
                </span>
              </MainCTA>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
