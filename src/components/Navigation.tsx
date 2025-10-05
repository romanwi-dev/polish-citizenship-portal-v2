import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, User } from "lucide-react";
import logo from "@/assets/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-primary/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <img src={logo} alt="PolishCitizenship.pl" className="h-10 w-auto" />
          </a>

          {/* User Icon & Mobile Menu */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-foreground hover:text-primary"
              onClick={() => window.location.href = '/auth'}
            >
              <User className="h-10 w-10" />
            </Button>
            <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-foreground hover:text-primary"
                >
                  <Menu className="h-10 w-10" />
                </Button>
              </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-64 p-3 bg-background/95 backdrop-blur-xl border border-primary/20 z-[100]"
            >
              <div className="flex flex-col gap-2">
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
                    onClick={() => scrollToSection('process')}
                    variant="ghost"
                    className="w-full justify-start text-base font-medium rounded-md hover:bg-primary/10 transition-colors"
                  >
                    Process
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
                <DropdownMenuItem asChild>
                  <Button
                    onClick={() => window.location.href = '/admin/cases'}
                    variant="ghost"
                    className="w-full justify-start text-base font-medium rounded-md hover:bg-primary/10 transition-colors"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Cases Management
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Button 
                    onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank')}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-md mt-2"
                  >
                    Take Full Test
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
