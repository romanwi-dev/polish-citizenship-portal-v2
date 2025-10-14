import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, User, Moon, Sun, Sparkles } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { MobileNavigationSheet } from "@/components/MobileNavigationSheet";
import { NavigationSearch } from "@/components/navigation/NavigationSearch";
import { LastVisitedLinks } from "@/components/navigation/LastVisitedLinks";
import { NavigationLinks } from "@/components/navigation/NavigationLinks";
import { useNavigationDesign } from "@/hooks/useNavigationDesign";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DESIGN_MAP: Record<string, React.ComponentType<{ children: React.ReactNode }>> = {
  'glassmorphic': () => import('./navigation/designs/GlassmorphicDesign').then(m => m.GlassmorphicDesign),
  'cyberpunk': () => import('./navigation/designs/CyberpunkDesign').then(m => m.CyberpunkDesign),
  'material': () => import('./navigation/designs/MaterialDesign').then(m => m.MaterialDesign),
  'minimal': () => import('./navigation/designs/MinimalDesign').then(m => m.MinimalDesign),
  'retro': () => import('./navigation/designs/RetroDesign').then(m => m.RetroDesign),
  'brutalist': () => import('./navigation/designs/BrutalistDesign').then(m => m.BrutalistDesign),
  'luxury': () => import('./navigation/designs/LuxuryDesign').then(m => m.LuxuryDesign),
  'neumorphic': () => import('./navigation/designs/NeumorphicDesign').then(m => m.NeumorphicDesign),
  'gradient': () => import('./navigation/designs/GradientDesign').then(m => m.GradientDesign),
} as any;

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
          <div className="flex items-center gap-1.5 md:gap-2">
            <button
              onClick={() => navigate('/admin/forms-demo')}
              className="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-accent border border-primary/20 flex items-center justify-center hover:border-primary/50 transition-all hover:scale-110"
              aria-label="Forms Demo"
              title="Forms Inspection Center"
            >
              <Sparkles className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={() => navigate('/admin/cases')}
              className="h-11 w-11 rounded-full bg-background/20 border border-border/10 flex items-center justify-center hover:border-primary/30 transition-all"
              aria-label="Management"
            >
              <User className="h-5 w-5 text-foreground/70" />
            </button>
            <button
              onClick={() => {
                const newTheme = document.documentElement.className === "dark" ? "light" : "dark";
                document.documentElement.className = newTheme;
                localStorage.setItem("theme", newTheme);
              }}
              className="h-11 w-11 rounded-full bg-background/20 border border-border/10 flex items-center justify-center hover:border-primary/30 transition-all"
              aria-label="Toggle theme"
            >
              {document.documentElement.className === "dark" ? (
                <Moon className="h-5 w-5 text-foreground/70" />
              ) : (
                <Sun className="h-5 w-5 text-foreground/70" />
              )}
            </button>
            
            {/* Mobile Navigation - Full Screen Sheet */}
            <div className="md:hidden">
              <MobileNavigationSheet />
            </div>

            {/* Desktop Navigation - Dropdown Menu */}
            <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <DropdownMenuTrigger asChild className="hidden md:flex">
                <button
                  className="h-11 w-11 rounded-full bg-background/20 border border-border/10 flex items-center justify-center hover:border-primary/30 transition-all"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5 text-foreground/70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-96 max-h-[600px] overflow-hidden p-0 bg-background/95 backdrop-blur-xl border border-primary/20 z-[100]"
              >
                <DesignComponent>
                  <ScrollArea className="h-full max-h-[600px]">
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <Button
                          variant={user ? "destructive" : "default"}
                          className="w-full"
                          onClick={user ? handleSignOut : () => navigate('/login')}
                        >
                          {user ? 'Sign Out' : 'Login'}
                        </Button>
                      </div>
                      
                      <NavigationSearch 
                        value={searchQuery}
                        onChange={setSearchQuery}
                      />
                      <LastVisitedLinks onNavigate={handleNavigate} />
                      <NavigationLinks 
                        onNavigate={handleNavigate}
                        searchQuery={searchQuery}
                      />
                      
                      <div className="pt-4">
                        <Button 
                          onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank')}
                          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold rounded-md shadow-lg"
                        >
                          Take Polish Citizenship Test
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
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
