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
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { LanguageSelector } from "@/components/LanguageSelector";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTranslation } from 'react-i18next';
import { SocialShare } from "@/components/social/SocialShare";

const Navigation = () => {
  const { t, i18n } = useTranslation('landing');
  const tt = (key: string, fallback: string) => t(key, fallback);
  const dir = i18n.language === 'he' ? 'rtl' : 'ltr';
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const {
    user,
    signOut
  } = useAuth(false);
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth'
    });
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
  return <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-primary/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="/" className="flex-shrink-0">
            <img src={logo} alt="PolishCitizenship.pl" className="h-8 w-auto" width="305" height="56" loading="eager" decoding="async" />
          </a>

          {/* User Icon & Desktop/Mobile Menu */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Theme Switcher */}
            <ThemeSwitcher />
            
            {/* Language Selector */}
            <LanguageSelector />
            
            {/* User Icon */}
            <button onClick={() => navigate('/admin/cases')} className="min-h-8 min-w-8 md:min-h-11 md:min-w-11 h-8 w-8 md:h-11 md:w-11 rounded-full dark:bg-background/50 light:bg-primary/10 border border-border/50 flex items-center justify-center hover:border-primary/50 transition-all" aria-label="Management">
              <User className="h-4 w-4 md:h-5 md:w-5 text-primary dark:text-foreground" />
            </button>
            
            {/* Mobile Navigation - Full Screen Sheet */}
            <div className="md:hidden">
              <MobileNavigationSheet />
            </div>

            {/* Desktop Navigation - Dropdown Menu */}
            <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <DropdownMenuTrigger asChild className="hidden md:flex">
                <button className="min-h-11 min-w-11 h-11 w-11 rounded-full dark:bg-background/50 light:bg-primary/10 border border-border/50 flex items-center justify-center hover:border-primary/50 transition-all" aria-label="Open menu">
                  <Menu className="h-5 w-5 text-primary dark:text-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[440px] p-0 bg-background dark:bg-background/95 backdrop-blur-xl border border-primary/20 z-[100] flex flex-col" style={{
              height: 'calc(100vh - 5rem)'
            }}>
                {/* Simple background matching footer */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/5 to-background" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                
                <div dir={dir} className="relative flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center gap-2 p-4 border-b border-border/50">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-lg">{tt('nav.navigation', 'Navigation')}</span>
                  </div>
                    
                    {/* Scrollable Content */}
                    <ScrollArea className="flex-1">
                      <div className="p-4 space-y-4">
                        {/* Icon Row - At the very top, matching mobile */}
                        <div className="flex items-center justify-start flex-wrap gap-1.5 py-2">
                          <button className="h-11 w-11 rounded-full bg-background/20 border border-border/10 flex items-center justify-center hover:border-primary/30 transition-all" aria-label="Settings">
                            <Settings className="h-5 w-5 text-foreground/30" />
                          </button>
                          <button className="h-11 w-11 rounded-full bg-background/20 border border-border/10 flex items-center justify-center hover:border-primary/30 transition-all" aria-label="Add new item">
                            <Plus className="h-5 w-5 text-foreground/30" />
                          </button>
                          <button onClick={() => {
                        navigate('/admin/system-overview');
                        setIsMobileMenuOpen(false);
                      }} className="h-11 w-11 rounded-full bg-background/20 border border-border/10 flex items-center justify-center hover:border-primary/30 transition-all" aria-label="System Overview" title="System Overview">
                            <BookOpen className="h-5 w-5 text-foreground/30" />
                          </button>
                          <button className="h-11 w-11 rounded-full bg-background/20 border border-border/10 flex items-center justify-center hover:border-primary/30 transition-all" aria-label="Voice input">
                            <Mic className="h-5 w-5 text-foreground/30" />
                          </button>
                          <button className="h-11 w-11 rounded-full bg-background/20 border border-border/10 flex items-center justify-center hover:border-primary/30 transition-all" aria-label="Quick actions">
                            <Zap className="h-5 w-5 text-foreground/30" />
                          </button>
                          <button className="h-11 w-11 rounded-full bg-background/20 border border-border/10 flex items-center justify-center hover:border-primary/30 transition-all" aria-label="Upload file">
                            <Upload className="h-5 w-5 text-foreground/30" />
                          </button>
                          <button className="h-11 w-11 rounded-full bg-background/20 border border-border/10 flex items-center justify-center hover:border-primary/30 transition-all" aria-label="Share">
                            <Share2 className="h-5 w-5 text-foreground/30" />
                          </button>
                          <ThemeSwitcher />
                        </div>

                        {/* Search - Above the login button, same height */}
                        <NavigationSearch value={searchQuery} onChange={setSearchQuery} />

                        {/* Login/Register Button - same height as search */}
                        <Button onClick={user ? handleSignOut : () => navigate('/login')} className="w-full h-14 bg-green-500/20 text-white font-bold text-lg border-2 border-green-500/30 hover:bg-green-500/30 hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all">
                          {user ? <>
                              <LogOut className="mr-2 h-4 w-4" />
                              {tt('nav.signOut', 'Sign Out')}
                            </> : <>
                              <LogIn className="mr-2 h-4 w-4" />
                              {tt('nav.register', 'Register / Login')}
                            </>}
                        </Button>

                        <div className="h-px bg-border/50" />
                        
                        <LastVisitedLinks onNavigate={handleNavigate} />
                        <NavigationLinks onNavigate={handleNavigate} searchQuery={searchQuery} />
                      </div>
                    </ScrollArea>
                    
                    {/* Sticky Bottom Section with Social Links */}
                    <div className="border-t border-border/50">
                      {/* Social Share Bar */}
                      <div className="p-4 pb-3 flex justify-center bg-muted/30">
                        <SocialShare variant="minimal" />
                      </div>
                      
                      {/* Citizenship Test Button */}
                      <div className="p-4 pt-3">
                        <Button onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank')} className="w-full h-14 min-h-[48px] bg-red-500/20 text-white font-bold text-lg border-2 border-red-500/30 hover:bg-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all" aria-label="Take the Polish Citizenship Test to check your eligibility">
                          {t('hero.cta')}
                        </Button>
                      </div>
                    </div>
                  </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>;
};
export default Navigation;