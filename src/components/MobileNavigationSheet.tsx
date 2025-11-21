import { useState } from 'react';
import { Menu, Sparkles, LogIn, LogOut, Plus, Image, Mic, Zap, Upload, Share2, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { NavigationSearch } from './navigation/NavigationSearch';
import { LastVisitedLinks } from './navigation/LastVisitedLinks';
import { NavigationLinks } from './navigation/NavigationLinks';
import { ThemeSwitcher } from './ThemeSwitcher';
import { SocialShare } from '@/components/social/SocialShare';

export const MobileNavigationSheet = () => {
  const { t, i18n } = useTranslation('landing');
  const tt = (key: string, fallback: string) => t(key, fallback);
  const dir = i18n.language === 'he' ? 'rtl' : 'ltr';
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, signOut } = useAuth(false);
  const navigate = useNavigate();

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
          className="md:hidden h-8 w-8 rounded-full dark:bg-background/50 bg-primary/10 border border-border/50 flex items-center justify-center hover:border-primary/50 transition-all"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4 text-primary dark:text-foreground" />
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full p-0 border-0 transition-all duration-300 ease-in-out">
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
                      {tt('nav.signOut', 'Sign Out')}
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      {tt('nav.register', 'Register / Login')}
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

            {/* Sticky Bottom Section with Social Links */}
            <div className="border-t border-border/50">
              {/* Social Share Bar */}
              <div className="p-4 pb-3 flex justify-center bg-muted/30">
                <SocialShare variant="minimal" />
              </div>
              
              {/* Citizenship Test Button */}
              <div className="p-4 pt-3">
                <Button
                  onClick={handleCitizenshipTest}
                  className="w-full h-14 min-h-[48px] bg-red-500/20 text-white font-bold text-lg border-2 border-red-500/30 hover:bg-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all"
                  aria-label="Take the Polish Citizenship Test to check your eligibility"
                >
                  {t('hero.cta')}
                </Button>
              </div>
            </div>
          </div>
      </SheetContent>
    </Sheet>
  );
};
