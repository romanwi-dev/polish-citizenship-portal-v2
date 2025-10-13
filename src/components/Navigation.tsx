import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, User, LogOut, Type, Bot, GitBranch, ClipboardList } from "lucide-react";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { DesignSelector } from "@/components/navigation/DesignSelector";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { MobileNavigationSheet } from "@/components/MobileNavigationSheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth(false);
  const { isLargeFonts, toggleFontSize } = useAccessibility();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
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
          <div className="flex items-center gap-2">
            <DesignSelector />
            <ThemeSwitcher />
            <Button
              variant="ghost" 
              size="icon"
              className={`text-foreground hover:text-primary ${isLargeFonts ? 'bg-primary/10' : ''}`}
              onClick={toggleFontSize}
              title={isLargeFonts ? "Normal font size" : "Large font size"}
            >
              <Type className="h-8 w-8" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-foreground hover:text-primary"
              onClick={() => navigate('/cases')}
              title="Control Room"
            >
              <User className="h-14 w-14" />
            </Button>
            
            {/* Mobile Navigation - Full Screen Sheet */}
            <div className="md:hidden">
              <MobileNavigationSheet />
            </div>

            {/* Desktop Navigation - Dropdown Menu */}
            <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <DropdownMenuTrigger asChild className="hidden md:flex">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-foreground hover:text-primary"
                >
                  <Menu className="h-14 w-14" />
                </Button>
              </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-64 p-3 bg-background/95 backdrop-blur-xl border border-primary/20 z-[100]"
            >
              <div className="flex flex-col gap-2">
                <DropdownMenuItem asChild>
                  <Button
                    onClick={() => navigate('/admin/documents')}
                    variant="ghost"
                    className="w-full justify-start text-base font-medium rounded-md hover:bg-primary/10 transition-colors"
                  >
                    Documents
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Button
                    onClick={() => navigate('/admin/law')}
                    variant="ghost"
                    className="w-full justify-start text-base font-medium rounded-md hover:bg-primary/10 transition-colors"
                  >
                    Law
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Button
                    onClick={() => navigate('/admin/passport')}
                    variant="ghost"
                    className="w-full justify-start text-base font-medium rounded-md hover:bg-primary/10 transition-colors"
                  >
                    Passport
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Button
                    onClick={() => scrollToSection('services')}
                    variant="ghost"
                    className="w-full justify-start text-base font-medium rounded-md hover:bg-primary/10 transition-colors"
                  >
                    Services
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Button
                    onClick={() => scrollToSection('timeline')}
                    variant="ghost"
                    className="w-full justify-start text-base font-medium rounded-md hover:bg-primary/10 transition-colors"
                  >
                    Timeline
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Button
                    onClick={() => scrollToSection('pricing')}
                    variant="ghost"
                    className="w-full justify-start text-base font-medium rounded-md hover:bg-primary/10 transition-colors"
                  >
                    Pricing
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Button
                    onClick={() => scrollToSection('faq')}
                    variant="ghost"
                    className="w-full justify-start text-base font-medium rounded-md hover:bg-primary/10 transition-colors"
                  >
                    FAQ
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Button
                    onClick={() => scrollToSection('contact')}
                    variant="ghost"
                    className="w-full justify-start text-base font-medium rounded-md hover:bg-primary/10 transition-colors"
                  >
                    Contact
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Button
                    onClick={() => navigate('/admin/ai-agent')}
                    variant="ghost"
                    className="w-full justify-start text-base font-medium rounded-md hover:bg-primary/10 transition-colors"
                  >
                    <Bot className="w-4 h-4 mr-2" />
                    AI Agent
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Button
                    onClick={() => navigate('/admin/family-tree')}
                    variant="ghost"
                    className="w-full justify-start text-base font-medium rounded-md hover:bg-primary/10 transition-colors"
                  >
                    <GitBranch className="w-4 h-4 mr-2" />
                    Family Tree
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Button
                    onClick={() => navigate('/admin/intake-form')}
                    variant="ghost"
                    className="w-full justify-start text-base font-medium rounded-md hover:bg-primary/10 transition-colors"
                  >
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Client Intake
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Button
                    onClick={() => navigate('/cases')}
                    variant="ghost"
                    className="w-full justify-start text-base font-medium rounded-md hover:bg-primary/10 transition-colors"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Management
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Button
                    onClick={user ? handleSignOut : () => navigate('/login')}
                    variant="ghost"
                    className="w-full justify-start text-base font-medium rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {user ? 'Sign Out' : 'Sign In'}
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Button 
                    onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank')}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold rounded-md mt-2 shadow-lg"
                  >
                    Citizenship Test
                  </Button>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
