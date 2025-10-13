import { useState } from 'react';
import { Menu, Sparkles, LogIn, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { NavigationSearch } from './navigation/NavigationSearch';
import { LastVisitedLinks } from './navigation/LastVisitedLinks';
import { NavigationLinks } from './navigation/NavigationLinks';
import { useNavigationDesign } from '@/hooks/useNavigationDesign';

// Design imports
import { GlassmorphicDesign } from './navigation/designs/GlassmorphicDesign';
import { CyberpunkDesign } from './navigation/designs/CyberpunkDesign';
import { MinimalDesign } from './navigation/designs/MinimalDesign';
import { NeumorphicDesign } from './navigation/designs/NeumorphicDesign';
import { MaterialDesign } from './navigation/designs/MaterialDesign';
import { BrutalistDesign } from './navigation/designs/BrutalistDesign';
import { GradientDesign } from './navigation/designs/GradientDesign';
import { RetroDesign } from './navigation/designs/RetroDesign';
import { LuxuryDesign } from './navigation/designs/LuxuryDesign';
import { ParticleDesign } from './navigation/designs/ParticleDesign';

const DESIGN_MAP = {
  glassmorphic: GlassmorphicDesign,
  cyberpunk: CyberpunkDesign,
  minimal: MinimalDesign,
  neumorphic: NeumorphicDesign,
  material: MaterialDesign,
  brutalist: BrutalistDesign,
  gradient: GradientDesign,
  retro: RetroDesign,
  luxury: LuxuryDesign,
  particle: ParticleDesign,
};

export const MobileNavigationSheet = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, signOut } = useAuth(false);
  const navigate = useNavigate();
  const { design } = useNavigationDesign();

  const DesignComponent = DESIGN_MAP[design];

  const handleAuthAction = async () => {
    if (user) {
      await signOut();
    } else {
      navigate('/login');
    }
    setOpen(false);
  };

  const handleCitizenshipTest = () => {
    window.open('https://eligibilityself.republic-of-poland.com/', '_blank');
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full p-0 border-0 transition-all duration-300 ease-in-out">
        <DesignComponent>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-2 p-4 border-b border-border/50">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">Navigation</span>
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                {/* Search */}
                <NavigationSearch
                  value={searchQuery}
                  onChange={setSearchQuery}
                />

                {/* Last Visited */}
                <LastVisitedLinks onNavigate={() => setOpen(false)} />

                {/* Login/Register Button */}
                <Button
                  onClick={handleAuthAction}
                  className="w-full bg-gradient-to-r from-primary via-accent to-primary text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  {user ? (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Register / Login
                    </>
                  )}
                </Button>

                <div className="h-px bg-border/50" />

                {/* Navigation Links */}
                <NavigationLinks
                  onNavigate={() => setOpen(false)}
                  searchQuery={searchQuery}
                />
              </div>
            </ScrollArea>

            {/* Citizenship Test Button - Always Visible */}
            <div className="p-4 border-t border-border/50">
              <Button
                onClick={handleCitizenshipTest}
                className="w-full bg-gradient-to-r from-primary via-accent to-primary text-white font-bold text-lg shadow-2xl border-2 border-white/20 hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all"
                size="lg"
              >
                Citizenship Test
              </Button>
            </div>
          </div>
        </DesignComponent>
      </SheetContent>
    </Sheet>
  );
};
