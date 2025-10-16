import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, User, Sparkles, Languages } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { MobileNavigationSheet } from "@/components/MobileNavigationSheet";
import { NavigationSearch } from "@/components/navigation/NavigationSearch";
import { LastVisitedLinks } from "@/components/navigation/LastVisitedLinks";
import { NavigationLinks } from "@/components/navigation/NavigationLinks";
import { useNavigationDesign } from "@/hooks/useNavigationDesign";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GlassmorphicDesign } from './navigation/designs/GlassmorphicDesign';
import { CyberpunkDesign } from './navigation/designs/CyberpunkDesign';
import { MaterialDesign } from './navigation/designs/MaterialDesign';
import { MinimalDesign } from './navigation/designs/MinimalDesign';
import { RetroDesign } from './navigation/designs/RetroDesign';
import { BrutalistDesign } from './navigation/designs/BrutalistDesign';
import { LuxuryDesign } from './navigation/designs/LuxuryDesign';
import { NeumorphicDesign } from './navigation/designs/NeumorphicDesign';
import { GradientDesign } from './navigation/designs/GradientDesign';

const DESIGN_MAP: Record<string, React.ComponentType<{ children: React.ReactNode }>> = {
  'glassmorphic': GlassmorphicDesign,
  'cyberpunk': CyberpunkDesign,
  'material': MaterialDesign,
  'minimal': MinimalDesign,
  'retro': RetroDesign,
  'brutalist': BrutalistDesign,
  'luxury': LuxuryDesign,
  'neumorphic': NeumorphicDesign,
  'gradient': GradientDesign,
};

const Navigation = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, signOut } = useAuth(false);
  const { design } = useNavigationDesign();
  
  const DesignComponent = DESIGN_MAP[design] || DESIGN_MAP['glassmorphic'];

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  const handleNavigate = () => {
    setIsMobileMenuOpen(false);
    setSearchQuery('');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-primary/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <img src={logo} alt="PolishCitizenship.pl" className="h-8 w-auto" />
          </a>

          {/* User Icon & Desktop/Mobile Menu */}
          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={() => navigate('/admin/forms-demo')}
              className="h-9 w-9 md:h-11 md:w-11 rounded-full bg-background/20 border border-border/10 flex items-center justify-center hover:border-primary/30 transition-all"
              aria-label="Forms Demo"
              title="Forms Inspection Center"
            >
              <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-foreground/70" />
            </button>
            <button
              onClick={() => navigate('/admin/translations')}
              className="h-9 w-9 md:h-11 md:w-11 rounded-full bg-background/20 border border-border/10 flex items-center justify-center hover:border-primary/30 transition-all"
              aria-label="Translations"
              title="Translation Management"
            >
              <Languages className="h-4 w-4 md:h-5 md:w-5 text-foreground/70" />
            </button>
            <button
              onClick={() => navigate('/admin/cases')}
              className="h-9 w-9 md:h-11 md:w-11 rounded-full bg-background/20 border border-border/10 flex items-center justify-center hover:border-primary/30 transition-all"
              aria-label="Management"
            >
              <User className="h-4 w-4 md:h-5 md:w-5 text-foreground/70" />
            </button>
            
            {/* Mobile Navigation - Full Screen Sheet */}
            <div className="md:hidden">
              <MobileNavigationSheet />
            </div>

            {/* Desktop Navigation - Dropdown Menu */}
            <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <DropdownMenuTrigger asChild className="hidden md:flex">
                <button
                  className="h-9 w-9 md:h-11 md:w-11 rounded-full bg-background/20 border border-border/10 flex items-center justify-center hover:border-primary/30 transition-all"
                  aria-label="Open menu"
                >
                  <Menu className="h-4 w-4 md:h-5 md:w-5 text-foreground/70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-96 p-0 bg-background/95 backdrop-blur-xl border border-primary/20 z-[100] flex flex-col"
                style={{ height: 'calc(100vh - 5rem)' }}
              >
                <DesignComponent>
                  <div className="flex flex-col h-full">
                    {/* Icon Row */}
                    <div className="p-4 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate('/admin/forms-demo')}
                          className="h-11 w-11 rounded-full bg-background/20 border border-border/10 flex items-center justify-center hover:border-primary/30 transition-all"
                          aria-label="Forms Demo"
                          title="Forms Inspection Center"
                        >
                          <Sparkles className="h-5 w-5 text-foreground/70" />
                        </button>
                        <button
                          onClick={() => navigate('/admin/translations')}
                          className="h-11 w-11 rounded-full bg-background/20 border border-border/10 flex items-center justify-center hover:border-primary/30 transition-all"
                          aria-label="Translations"
                          title="Translation Management"
                        >
                          <Languages className="h-5 w-5 text-foreground/70" />
                        </button>
                        <button
                          onClick={() => navigate('/admin/cases')}
                          className="h-11 w-11 rounded-full bg-background/20 border border-border/10 flex items-center justify-center hover:border-primary/30 transition-all"
                          aria-label="Management"
                        >
                          <User className="h-5 w-5 text-foreground/70" />
                        </button>
                        <ThemeSwitcher />
                      </div>
                    </div>
                    
                    {/* Scrollable Content */}
                    <ScrollArea className="flex-1">
                      <div className="p-4 space-y-4">
                        <Button
                          variant={user ? "destructive" : "default"}
                          className="w-full"
                          onClick={user ? handleSignOut : () => navigate('/login')}
                        >
                          {user ? 'Sign Out' : 'Login'}
                        </Button>
                        
                        <NavigationSearch 
                          value={searchQuery}
                          onChange={setSearchQuery}
                        />
                        <LastVisitedLinks onNavigate={handleNavigate} />
                        <NavigationLinks 
                          onNavigate={handleNavigate}
                          searchQuery={searchQuery}
                        />
                      </div>
                    </ScrollArea>
                    
                    {/* Sticky Bottom Button */}
                    <div className="sticky bottom-0 p-4 bg-background/95 backdrop-blur-xl border-t border-primary/20">
                      <Button 
                        onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank')}
                        className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold rounded-md shadow-lg"
                      >
                        Take Polish Citizenship Test
                      </Button>
                    </div>
                  </div>
                </DesignComponent>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
