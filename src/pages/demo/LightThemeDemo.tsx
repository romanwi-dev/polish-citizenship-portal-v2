import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LightThemeHero from "@/components/demo/LightThemeHero";
import LightThemeAbout from "@/components/demo/LightThemeAbout";
import LightThemeContact from "@/components/demo/LightThemeContact";
import Navigation from "@/components/Navigation";
import FooterWeb3 from "@/components/FooterWeb3";

const LightThemeDemo = () => {
  const navigate = useNavigate();

  // Force light theme for this demo page only
  useEffect(() => {
    const root = document.documentElement;
    const previousTheme = root.className;
    root.className = 'light';

    return () => {
      // Restore previous theme on unmount
      root.className = previousTheme;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Demo Info Banner */}
      <div className="bg-primary text-primary-foreground py-3 px-4 text-center sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <p className="text-sm md:text-base font-medium">
            🎨 Light Theme Demo Preview - Hero, About & Contact Sections
          </p>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Demo Content */}
      <LightThemeHero />
      <LightThemeAbout />
      <LightThemeContact />
      
      <FooterWeb3 />
    </div>
  );
};

export default LightThemeDemo;
