import { useState } from 'react';
import { Menu, Sparkles, LogIn, LogOut, Plus, Image, Mic, Zap, Upload, Share2, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { NavigationSearch } from './navigation/NavigationSearch';
import { LastVisitedLinks } from './navigation/LastVisitedLinks';
import { NavigationLinks } from './navigation/NavigationLinks';
import { useNavigationDesign } from '@/hooks/useNavigationDesign';
import { ThemeSwitcher } from './ThemeSwitcher';

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
        <button
          className="md:hidden h-11 w-11 rounded-full bg-background/20 border border-border/10 flex items-center justify-center hover:border-primary/30 transition-all"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5 text-foreground/70" />
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full p-0 border-0 transition-all duration-300 ease-in-out">
        <ParticleDesign>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-2 p-4 border-b border-border/50">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">Navigation</span>
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {/* Icon Row - At the very top, Settings first */}
                <div className="flex items-center justify-center gap-1.5 py-2">
                  <button 
                    className="h-11 w-11 rounded-full bg-background/20 border border-border/10 flex items-center justify-center hover:border-primary/30 transition-all"
                    aria-label="Settings"
                  >
                    <Settings className="h-5 w-5 text-foreground/30" />
                  </button>
                  <button 
                    className="h-11 w-11 rounded-full bg-background/20 border border-border/10 flex items-center justify-center hover:border-primary/30 transition-all"
                    aria-label="Add new item"
                  >
                    <Plus className="h-5 w-5 text-foreground/30" />
                  </button>
                  <button 
                    className="h-11 w-11 rounded-full bg-background/20 border border-border/10 flex items-center justify-center hover:border-primary/30 transition-all"
                    aria-label="Upload image"
                  >
                    <Image className="h-5 w-5 text-foreground/30" />
                  </button>
                  <button 
                    className="h-11 w-11 rounded-full bg-background/20 border border-border/10 flex items-center justify-center hover:border-primary/30 transition-all"
                    aria-label="Voice input"
                  >
                    <Mic className="h-5 w-5 text-foreground/30" />
                  </button>
                  <button 
                    className="h-11 w-11 rounded-full bg-background/20 border border-border/10 flex items-center justify-center hover:border-primary/30 transition-all"
                    aria-label="Quick actions"
                  >
                    <Zap className="h-5 w-5 text-foreground/30" />
                  </button>
                  <button 
                    className="h-11 w-11 rounded-full bg-background/20 border border-border/10 flex items-center justify-center hover:border-primary/30 transition-all"
                    aria-label="Upload file"
                  >
                    <Upload className="h-5 w-5 text-foreground/30" />
                  </button>
                  <button 
                    className="h-11 w-11 rounded-full bg-background/20 border border-border/10 flex items-center justify-center hover:border-primary/30 transition-all"
                    aria-label="Share"
                  >
                    <Share2 className="h-5 w-5 text-foreground/30" />
                  </button>
                  <ThemeSwitcher />
                </div>

                {/* Login/Register Button */}
                <Button
                  onClick={handleAuthAction}
                  className="w-full h-14 bg-green-500/20 text-white font-bold text-lg border-2 border-green-500/30 hover:bg-green-500/30 hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all"
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

                {/* Search - Below the green button */}
                <NavigationSearch
                  value={searchQuery}
                  onChange={setSearchQuery}
                />

                <div className="h-px bg-border/50" />

                {/* Last Visited */}
                <LastVisitedLinks onNavigate={() => setOpen(false)} />

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
                className="w-full h-14 min-h-[48px] bg-red-500/20 text-white font-bold text-lg border-2 border-red-500/30 hover:bg-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all"
                aria-label="Take the Polish Citizenship Test to check your eligibility"
              >
                Take Polish Citizenship Test
              </Button>
            </div>
          </div>
        </ParticleDesign>
      </SheetContent>
    </Sheet>
  );
};
