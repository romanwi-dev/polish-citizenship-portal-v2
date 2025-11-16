import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MainCTA } from '@/components/ui/main-cta';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import * as THREE from 'three';
import { Shield, Clock, Award } from 'lucide-react';

function OrbitalFlags() {
  const group1Ref = useRef<THREE.Group>(null);
  const group2Ref = useRef<THREE.Group>(null);
  const prefersReducedMotion = useReducedMotion();

  useFrame((state) => {
    if (prefersReducedMotion) return;
    
    if (group1Ref.current) {
      group1Ref.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
    if (group2Ref.current) {
      group2Ref.current.rotation.y = -state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={2} />
      
      <group ref={group1Ref}>
        {[...Array(6)].map((_, i) => {
          const angle = (i * Math.PI * 2) / 6;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 3, 0, Math.sin(angle) * 3]}
            >
              <boxGeometry args={[0.8, 0.5, 0.05]} />
              <meshStandardMaterial 
                color={i % 2 === 0 ? "#dc2626" : "#ffffff"}
                metalness={0.6}
                roughness={0.2}
              />
            </mesh>
          );
        })}
      </group>

      <group ref={group2Ref}>
        {[...Array(12)].map((_, i) => {
          const angle = (i * Math.PI * 2) / 12;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 5, 0, Math.sin(angle) * 5]}
            >
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial 
                color="#003399"
                metalness={0.7}
                roughness={0.1}
              />
            </mesh>
          );
        })}
      </group>
    </>
  );
}

export const HeroOrbitalFlags = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank');
  };

  const features = [
    { icon: Shield, title: 'Legal Expertise', description: 'Professional guidance through every step' },
    { icon: Clock, title: 'Time Efficient', description: 'Streamlined application process' },
    { icon: Award, title: 'High Success Rate', description: 'Proven track record of approvals' }
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 3, 10], fov: 60 }}>
          <OrbitalFlags />
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
                <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50">
                  <feature.icon className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                    <p className="text-xs text-foreground/70">{feature.description}</p>
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
                  {t('contact.form.phone')}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg bg-background/50 border border-border focus:border-primary outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {t('contact.form.message')}
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg bg-background/50 border border-border focus:border-primary outline-none resize-none text-sm"
                  required
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
