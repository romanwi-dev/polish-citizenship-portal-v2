import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LightThemeHero2 from "@/components/demo/LightThemeHero2";
import LightThemeAbout2 from "@/components/demo/LightThemeAbout2";
import LightThemeContact2 from "@/components/demo/LightThemeContact2";
import Navigation from "@/components/Navigation";
import FooterWeb3 from "@/components/FooterWeb3";

const LightThemeDemo2 = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const root = document.documentElement;
    const previousTheme = root.className;
    root.className = 'light';

    return () => {
      root.className = previousTheme;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
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
            🎨 Light Theme Demo 2 - Minimal & Clean Design
          </p>
          <div className="w-20" />
        </div>
      </div>

      <LightThemeHero2 />
      <LightThemeAbout2 />
      <LightThemeContact2 />
      
      <FooterWeb3 />
    </div>
  );
};

export default LightThemeDemo2;
