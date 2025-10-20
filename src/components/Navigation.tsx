import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, User, Sparkles, Languages, BookOpen, Settings, Plus, Mic, Zap, Upload, Share2, LogIn, LogOut } from "lucide-react";
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
          <a href="/">
            <img src={logo} alt="PolishCitizenship.pl" className="h-8 w-auto" width="400" height="70" loading="eager" fetchPriority="high" />
          </a>

          {/* User Icon & Desktop/Mobile Menu */}
          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={() => navigate('/admin/forms-demo')}
              className="h-9 w-9 md:h-11 md:w-11 rounded-full bg-background/5 dark:bg-background/50 border border-border/50 flex items-center justify-center hover:border-primary/50 transition-all"
              aria-label="Forms Demo"
              title="Forms Inspection Center"
            >
              <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-foreground" />
            </button>
            <button
              onClick={() => navigate('/admin/translations')}
              className="h-9 w-9 md:h-11 md:w-11 rounded-full bg-background/5 dark:bg-background/50 border border-border/50 flex items-center justify-center hover:border-primary/50 transition-all"
              aria-label="Translations"
              title="Translation Management"
            >
              <Languages className="h-4 w-4 md:h-5 md:w-5 text-foreground" />
            </button>
            <button
              onClick={() => navigate('/admin/system-overview')}
              className="h-9 w-9 md:h-11 md:w-11 rounded-full bg-background/5 dark:bg-background/50 border border-border/50 flex items-center justify-center hover:border-primary/50 transition-all"
              aria-label="System Overview"
              title="System Overview"
            >
              <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-foreground" />
            </button>
            <button
              onClick={() => navigate('/admin/cases')}
              className="h-9 w-9 md:h-11 md:w-11 rounded-full bg-background/5 dark:bg-background/50 border border-border/50 flex items-center justify-center hover:border-primary/50 transition-all"
              aria-label="Management"
            >
              <User className="h-4 w-4 md:h-5 md:w-5 text-foreground" />
            </button>
            
            {/* Mobile Navigation - Full Screen Sheet */}
            <div className="md:hidden">
              <MobileNavigationSheet />
            </div>

            {/* Desktop Navigation - Dropdown Menu */}
            <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <DropdownMenuTrigger asChild className="hidden md:flex">
                <button
                  className="h-9 w-9 md:h-11 md:w-11 rounded-full bg-background/5 dark:bg-background/50 border border-border/50 flex items-center justify-center hover:border-primary/50 transition-all"
                  aria-label="Open menu"
                >
                  <Menu className="h-4 w-4 md:h-5 md:w-5 text-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-[440px] p-0 bg-background/95 backdrop-blur-xl border border-primary/20 z-[100] flex flex-col"
                style={{ height: 'calc(100vh - 5rem)' }}
              >
                <DesignComponent>
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center gap-2 p-4 border-b border-border/50">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-lg">Navigation</span>
                    </div>
                    
                    {/* Scrollable Content */}
                    <ScrollArea className="flex-1">
                      <div className="p-4 space-y-4">
                        {/* Icon Row - At the very top, matching mobile */}
                        <div className="flex items-center justify-start flex-wrap gap-1.5 py-2">
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
                            onClick={() => {
                              navigate('/admin/system-overview');
                              setIsMobileMenuOpen(false);
                            }}
                            className="h-11 w-11 rounded-full bg-background/20 border border-border/10 flex items-center justify-center hover:border-primary/30 transition-all"
                            aria-label="System Overview"
                            title="System Overview"
                          >
                            <BookOpen className="h-5 w-5 text-foreground/30" />
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

                        {/* Search - Above the login button, same height */}
                        <NavigationSearch 
                          value={searchQuery}
                          onChange={setSearchQuery}
                        />

                        {/* Login/Register Button - same height as search */}
                        <Button
                          onClick={user ? handleSignOut : () => navigate('/login')}
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

                        <div className="h-px bg-border/50" />
                        
                        <LastVisitedLinks onNavigate={handleNavigate} />
                        <NavigationLinks 
                          onNavigate={handleNavigate}
                          searchQuery={searchQuery}
                        />
                      </div>
                    </ScrollArea>
                    
                    {/* Sticky Bottom Button - Red with visible text */}
                    <div className="p-4 border-t border-border/50">
                      <Button 
                        onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank')}
                        className="w-full h-14 min-h-[48px] bg-red-500/20 text-white font-bold text-lg border-2 border-red-500/30 hover:bg-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all"
                        aria-label="Take the Polish Citizenship Test to check your eligibility"
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
