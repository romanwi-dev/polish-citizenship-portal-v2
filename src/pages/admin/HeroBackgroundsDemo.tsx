import { lazy, Suspense, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2 } from 'lucide-react';

// Lazy load hero backgrounds for performance
const GoldenHourPoland = lazy(() => import('@/components/heroes/GoldenHourPoland').then(m => ({ default: m.GoldenHourPoland })));
const EUPrestige = lazy(() => import('@/components/heroes/EUPrestige').then(m => ({ default: m.EUPrestige })));
const LegalChambers = lazy(() => import('@/components/heroes/LegalChambers').then(m => ({ default: m.LegalChambers })));
const PassportJourney = lazy(() => import('@/components/heroes/PassportJourney').then(m => ({ default: m.PassportJourney })));
const HeritageTapestry = lazy(() => import('@/components/heroes/HeritageTapestry').then(m => ({ default: m.HeritageTapestry })));
const ModernMinimalist = lazy(() => import('@/components/heroes/ModernMinimalist').then(m => ({ default: m.ModernMinimalist })));

interface HeroBackground {
  id: string;
  name: string;
  component: React.LazyExoticComponent<() => JSX.Element>;
  description: string;
  specs: string[];
  mood: string;
}

const backgrounds: HeroBackground[] = [
  {
    id: 'golden-hour',
    name: 'Golden Hour Poland',
    component: GoldenHourPoland,
    description: 'Majestic Polish eagle with volumetric god rays and warm amber lighting. Perfect for evoking national pride and heritage.',
    specs: ['Metallic PBR materials', 'Volumetric particles', 'Warm color grading', 'Slow camera orbit'],
    mood: 'Proud, warm, heritage'
  },
  {
    id: 'eu-prestige',
    name: 'EU Prestige',
    component: EUPrestige,
    description: 'Luxury crystal EU stars with bokeh effects and sophisticated lighting. Inspired by high-end automotive commercials.',
    specs: ['Glass/crystal materials', 'Bokeh particles', 'Luxury lighting', 'Deep blue/gold palette'],
    mood: 'Prestigious, sophisticated, elite'
  },
  {
    id: 'legal-chambers',
    name: 'Legal Chambers',
    component: LegalChambers,
    description: 'Film noir-inspired legal environment with floating documents and dramatic desk lamp lighting. Dark, professional atmosphere.',
    specs: ['Realistic paper textures', 'Film noir lighting', 'Dust particles', 'Shadow play'],
    mood: 'Professional, authoritative, serious'
  },
  {
    id: 'passport-journey',
    name: 'Passport Journey',
    component: PassportJourney,
    description: 'Photorealistic Polish passport with cinematic blue color grading. Travel-focused with subtle depth of field.',
    specs: ['Photorealistic passport', 'Cinematic lighting', 'Travel stamp particles', 'Blue color grading'],
    mood: 'Adventurous, hopeful, journey'
  },
  {
    id: 'heritage-tapestry',
    name: 'Heritage Tapestry',
    component: HeritageTapestry,
    description: 'Flowing fabric with Polish folk patterns and museum-quality lighting. Rich cultural atmosphere with red/white/gold palette.',
    specs: ['Fabric simulation', 'Folk pattern elements', 'Museum lighting', 'Cultural artifacts'],
    mood: 'Cultural, artistic, traditional'
  },
  {
    id: 'modern-minimalist',
    name: 'Modern Minimalist',
    component: ModernMinimalist,
    description: 'Apple-commercial inspired clean design with premium materials and perfect studio lighting. Ultra-modern and sophisticated.',
    specs: ['Premium materials', 'Studio lighting', 'Geometric shapes', 'Monochrome with accents'],
    mood: 'Modern, clean, premium'
  }
];

export default function HeroBackgroundsDemo() {
  const [selected, setSelected] = useState<string>('golden-hour');

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Cinematic Hero Backgrounds</h1>
          <p className="text-muted-foreground text-lg">
            High-quality 3D backgrounds inspired by luxury brands and film production. Each design features photorealistic materials, 
            dramatic lighting, and professional-grade visuals.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {backgrounds.map((bg) => {
            const BackgroundComponent = bg.component;
            const isSelected = selected === bg.id;

            return (
              <Card 
                key={bg.id} 
                className={`overflow-hidden transition-all ${
                  isSelected ? 'ring-2 ring-primary shadow-xl' : ''
                }`}
              >
                <div className="relative h-[400px] bg-black overflow-hidden">
                  <Suspense 
                    fallback={
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    }
                  >
                    <BackgroundComponent />
                  </Suspense>
                  
                  {isSelected && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="default" className="gap-1">
                        <Check className="w-3 h-3" />
                        Selected
                      </Badge>
                    </div>
                  )}
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{bg.name}</CardTitle>
                      <CardDescription className="text-sm mb-3">
                        <span className="font-semibold text-foreground">Mood:</span> {bg.mood}
                      </CardDescription>
                      <p className="text-sm text-muted-foreground mb-4">
                        {bg.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Technical Specs
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {bg.specs.map((spec, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <Button
                    onClick={() => setSelected(bg.id)}
                    variant={isSelected ? 'default' : 'outline'}
                    className="w-full"
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Selected
                      </>
                    ) : (
                      'Select This Design'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selected && (
          <Card className="mt-8 border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="w-5 h-5 text-primary" />
                Current Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">
                <span className="font-semibold">
                  {backgrounds.find(b => b.id === selected)?.name}
                </span>
                {' '}is currently selected. This cinematic background will elevate your hero section with 
                professional-grade 3D visuals and dramatic lighting.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
