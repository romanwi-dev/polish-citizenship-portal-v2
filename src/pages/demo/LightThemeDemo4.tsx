import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LightThemeHero4 from "@/components/demo/LightThemeHero4";
import LightThemeAbout4 from "@/components/demo/LightThemeAbout4";
import LightThemeContact4 from "@/components/demo/LightThemeContact4";
import Navigation from "@/components/Navigation";
import FooterWeb3 from "@/components/FooterWeb3";

const LightThemeDemo4 = () => {
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
      
      <div className="bg-slate-900 text-white py-3 px-4 text-center sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <p className="text-sm md:text-base font-medium">
            🎨 Light Theme Demo 4 - Professional Corporate Design
          </p>
          <div className="w-20" />
        </div>
      </div>

      <LightThemeHero4 />
      <LightThemeAbout4 />
      <LightThemeContact4 />
      
      <FooterWeb3 />
    </div>
  );
};

export default LightThemeDemo4;
