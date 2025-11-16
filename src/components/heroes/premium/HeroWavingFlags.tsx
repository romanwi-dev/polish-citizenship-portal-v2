import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { useTranslation } from 'react-i18next';
import { MainCTA } from '@/components/ui/main-cta';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Award, Users, Trophy, Sparkles } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import professionalWoman from '@/assets/professional-woman.jpeg';
import thankYou1 from '@/assets/thank-you/thank-you-1.jpg';
import { SocialShare } from '@/components/social/SocialShare';

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
  const { t, i18n } = useTranslation();
  const [isFlipped, setIsFlipped] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: '',
    phone: ''
  });
  const isRTL = i18n.language === 'he';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { error } = await supabase
        .from('contact_submissions')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            message: `Country: ${formData.country}, Phone: ${formData.phone || 'Not provided'}`
          }
        ]);

      if (error) throw error;

      setIsFlipped(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsFlipped(true);
    }
  };

  const features = [
    { icon: Award, stat: '>20', text: t('hero.stats.experience') },
    { icon: Users, stat: '>25,000', text: t('hero.stats.cases') },
    { icon: Trophy, stat: '100%', text: t('hero.stats.success') }
  ];

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-background pt-28 pb-16 md:pt-40 md:pb-20 lg:pt-48 lg:pb-24">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
          <SmoothFlowingParticles />
        </Canvas>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/60 to-background/95 z-[1]" />

      <div className="container relative z-10 px-4 mx-auto">
        <div className="grid lg:grid-cols-[1.2fr,450px] gap-8 lg:gap-16 items-start max-w-7xl mx-auto">
            <div className={`space-y-8 md:pt-8 lg:pt-0 lg:-mt-20 ${isRTL ? 'lg:text-right' : 'lg:text-left'}`}>
              <div className="space-y-10 text-center lg:text-left lg:[.lg\:text-right_&]:text-right">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {t('hero.badge')}
                </span>
              </div>
              <h1 className="text-[2.5rem] sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-heading font-black leading-tight">
                <span className="inline-block" style={{ 
                  backgroundImage: 'var(--gradient-title)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent'
                }} dangerouslySetInnerHTML={{ __html: t('hero.title') }}>
                </span>
              </h1>
              <div className="space-y-3" key={t('hero.subtitle1')}>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-body font-light tracking-normal max-w-3xl mx-auto lg:mx-0 break-words hyphens-auto">
                  {t('hero.subtitle1')}
                </p>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-body font-light tracking-normal max-w-3xl mx-auto lg:mx-0 break-words hyphens-auto">
                  {t('hero.subtitle2')}
                </p>
              </div>
            </div>
          </div>

          <div 
            className="relative w-full lg:sticky lg:top-32"
            style={{ 
              perspective: '1000px',
              height: '700px',
              maxWidth: '450px',
              marginLeft: 'auto',
              marginRight: isRTL ? 'auto' : '0'
            }}
          >
            <div 
              className="relative w-full h-full transition-transform duration-700"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* Front Side - Form */}
              <div 
                className="absolute inset-0"
                style={{ 
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden'
                }}
              >
                <div className="glass-card p-5 md:p-6 pb-8 rounded-2xl border border-primary/10 backdrop-blur-sm bg-background/5 w-full h-full">
                  <div className="mb-4 rounded-xl overflow-hidden opacity-70 dark:opacity-70 lg:opacity-100">
                    <img 
                      src={professionalWoman} 
                      alt="Professional consultation" 
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-1.5">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className={`text-base md:text-sm bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-semibold break-words block ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t('contact.nameLabel')} *
                      </Label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="h-16 md:h-12 !border-2 dark:!border-primary/20 light:!border-primary/30 bg-blue-50/30 dark:bg-blue-950/30 backdrop-blur text-sm sm:text-base w-full rounded-md px-3 outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className={`text-base md:text-sm bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-semibold break-words block ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t('contact.emailLabel')} *
                      </Label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="h-16 md:h-12 !border-2 dark:!border-primary/20 light:!border-primary/30 bg-blue-50/30 dark:bg-blue-950/30 backdrop-blur text-sm sm:text-base w-full rounded-md px-3 outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="country" className={`text-base md:text-sm bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-semibold break-words block ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t('contact.countryLabel')}
                      </Label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) => setFormData({...formData, country: value})}
                      >
                        <SelectTrigger className={`!h-16 md:!h-12 !border-2 dark:!border-primary/20 light:!border-primary/30 !bg-blue-50/30 dark:!bg-blue-950/30 hover:!bg-blue-50/30 dark:hover:!bg-blue-950/30 focus:!bg-blue-50/30 dark:focus:!bg-blue-950/30 backdrop-blur touch-manipulation w-full !leading-tight !text-sm sm:!text-base [&>span]:bg-gradient-to-r [&>span]:from-slate-500 [&>span]:to-slate-700 [&>span]:bg-clip-text [&>span]:text-transparent !shadow-none hover:!shadow-none focus:!shadow-none ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                          <SelectValue placeholder={t('contact.countryPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-card dark:border-border bg-background border-2 z-[100]">
                          {["USA", "UK", "Canada", "Australia", "South Africa", "Brazil", "Argentina", "Mexico", "Venezuela", "Israel", "Germany", "France", "Other"].map((country) => (
                            <SelectItem key={country} value={country} className="cursor-pointer hover:bg-primary/10 text-sm">
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <button
                      type="submit"
                      className="w-full h-14 md:h-12 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-primary/30 active:scale-95 text-sm md:text-base"
                    >
                      {t('hero.cta')}
                    </button>
                  </form>
                </div>
              </div>

              {/* Back Side - Thank You Message */}
              <div 
                className={`absolute inset-0 ${!isFlipped ? 'pointer-events-none' : 'pointer-events-auto'}`}
                style={{ 
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  opacity: isFlipped ? 1 : 0,
                  transition: 'opacity 0s 0.35s'
                }}
              >
                <div className="glass-card p-6 md:p-12 rounded-2xl backdrop-blur-xl border-2 border-primary/20 shadow-2xl h-full flex flex-col items-center justify-center gap-8 relative overflow-hidden">
                  {/* Image */}
                  <div className="w-full h-1/2 relative">
                    <img 
                      src={thankYou1} 
                      alt="Professional with passport" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  
                  {/* Message */}
                  <div className="w-full flex flex-col items-center justify-center space-y-8 text-center px-4">
                    <p className="bg-gradient-to-r from-slate-400 to-slate-600 bg-clip-text text-transparent text-2xl font-semibold">
                      {t('contact.thankYouMessage')}
                    </p>
                    <Button
                      onClick={() => {
                        setIsFlipped(false);
                        setFormData({ name: "", email: "", country: "", phone: "" });
                      }}
                      variant="outline"
                      className="hover-glow"
                    >
                      Send Another Message
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
