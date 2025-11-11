import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Type } from "lucide-react";

const FontStylesDemo = () => {
  const navigate = useNavigate();
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  const sampleContent = {
    heading: "Polish Citizenship by Descent",
    subheading: "Expert Legal Guidance Since 2003",
    paragraph: "We specialize in helping people of Polish and Polish-Jewish descent from around the world obtain Polish citizenship and EU passports through their ancestry. Our proven process combines deep legal expertise with modern technology to deliver unmatched success rates.",
    features: [
      "Over 25 years of experience",
      "25,000+ successful cases processed",
      "100% success rate for eligible clients"
    ]
  };

  const fontStyles = [
    {
      id: "modern-elegant",
      name: "Modern Elegant",
      description: "Inter + Playfair Display - Professional and sophisticated",
      headingFont: "font-['Playfair_Display']",
      bodyFont: "font-['Inter']",
      headingWeight: "font-bold",
      headingSize: "text-5xl",
      subheadingSize: "text-2xl",
      bodySize: "text-lg",
      lineHeight: "leading-relaxed",
      googleFonts: "Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600;700"
    },
    {
      id: "clean-modern",
      name: "Clean & Modern",
      description: "Poppins + Poppins - Contemporary and friendly",
      headingFont: "font-['Poppins']",
      bodyFont: "font-['Poppins']",
      headingWeight: "font-bold",
      headingSize: "text-5xl",
      subheadingSize: "text-2xl",
      bodySize: "text-lg",
      lineHeight: "leading-relaxed",
      googleFonts: "Poppins:wght@300;400;500;600;700;800;900"
    },
    {
      id: "editorial",
      name: "Editorial Luxury",
      description: "Cormorant Garamond + Lato - Timeless and refined",
      headingFont: "font-['Cormorant_Garamond']",
      bodyFont: "font-['Lato']",
      headingWeight: "font-bold",
      headingSize: "text-6xl",
      subheadingSize: "text-2xl",
      bodySize: "text-lg",
      lineHeight: "leading-loose",
      googleFonts: "Cormorant+Garamond:wght@300;400;500;600;700&family=Lato:wght@300;400;700"
    },
    {
      id: "tech-professional",
      name: "Tech Professional",
      description: "Montserrat + Open Sans - Clear and trustworthy",
      headingFont: "font-['Montserrat']",
      bodyFont: "font-['Open_Sans']",
      headingWeight: "font-extrabold",
      headingSize: "text-5xl",
      subheadingSize: "text-2xl",
      bodySize: "text-lg",
      lineHeight: "leading-relaxed",
      googleFonts: "Montserrat:wght@400;600;700;800;900&family=Open+Sans:wght@300;400;500;600;700"
    },
    {
      id: "classic-serif",
      name: "Classic Serif",
      description: "Merriweather + Merriweather Sans - Traditional elegance",
      headingFont: "font-['Merriweather']",
      bodyFont: "font-['Merriweather_Sans']",
      headingWeight: "font-black",
      headingSize: "text-5xl",
      subheadingSize: "text-2xl",
      bodySize: "text-lg",
      lineHeight: "leading-relaxed",
      googleFonts: "Merriweather:wght@300;400;700;900&family=Merriweather+Sans:wght@300;400;500;600;700"
    },
    {
      id: "geometric-modern",
      name: "Geometric Modern",
      description: "Raleway + Nunito - Clean and geometric",
      headingFont: "font-['Raleway']",
      bodyFont: "font-['Nunito']",
      headingWeight: "font-black",
      headingSize: "text-5xl",
      subheadingSize: "text-2xl",
      bodySize: "text-lg",
      lineHeight: "leading-relaxed",
      googleFonts: "Raleway:wght@300;400;600;700;800;900&family=Nunito:wght@300;400;600;700;800"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Add all Google Fonts */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700;800;900&family=Cormorant+Garamond:wght@300;400;500;600;700&family=Lato:wght@300;400;700&family=Montserrat:wght@400;600;700;800;900&family=Open+Sans:wght@300;400;500;600;700&family=Merriweather:wght@300;400;700;900&family=Merriweather+Sans:wght@300;400;500;600;700&family=Raleway:wght@300;400;600;700;800;900&family=Nunito:wght@300;400;600;700;800&display=swap"
      />

      {/* Background */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-primary/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Button variant="ghost" onClick={() => navigate('/demos')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Demos
            </Button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Font & Content Styles
            </h1>
            <div className="w-24" />
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
              <Type className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Typography Showcase</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-6">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Choose Your Perfect Font Style
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Professional font combinations designed for readability and visual impact
            </p>
          </div>

          {/* Font Style Cards */}
          <div className="space-y-8 max-w-7xl mx-auto">
            {fontStyles.map((style) => (
              <div
                key={style.id}
                className={`glass-card rounded-lg overflow-hidden transition-all duration-300 ${
                  selectedStyle === style.id ? 'ring-2 ring-primary shadow-2xl' : 'hover:shadow-xl'
                }`}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 border-b border-border/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-2 flex items-center gap-3">
                        {style.name}
                        {selectedStyle === style.id && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                            <Check className="h-4 w-4" />
                            Selected
                          </span>
                        )}
                      </h3>
                      <p className="text-muted-foreground">{style.description}</p>
                    </div>
                    <Button
                      onClick={() => setSelectedStyle(style.id)}
                      variant={selectedStyle === style.id ? "default" : "outline"}
                      size="sm"
                    >
                      {selectedStyle === style.id ? "Selected" : "Select"}
                    </Button>
                  </div>
                </div>

                {/* Preview */}
                <div className="p-8 md:p-12">
                  {/* Heading */}
                  <h1 className={`${style.headingFont} ${style.headingWeight} ${style.headingSize} mb-4 tracking-tight`}>
                    {sampleContent.heading}
                  </h1>

                  {/* Subheading */}
                  <h2 className={`${style.headingFont} ${style.subheadingSize} text-primary mb-8`}>
                    {sampleContent.subheading}
                  </h2>

                  {/* Paragraph */}
                  <p className={`${style.bodyFont} ${style.bodySize} ${style.lineHeight} text-foreground/80 mb-8 max-w-3xl`}>
                    {sampleContent.paragraph}
                  </p>

                  {/* Features List */}
                  <ul className={`${style.bodyFont} ${style.bodySize} space-y-3`}>
                    {sampleContent.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                        <span className="text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Sample Button */}
                  <div className="mt-8">
                    <Button size="lg" className={`${style.bodyFont} font-semibold`}>
                      Get Started Today
                    </Button>
                  </div>
                </div>

                {/* Font Details */}
                <div className="bg-muted/30 px-8 py-4 border-t border-border/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Heading Font: </span>
                      <span className="font-medium">{style.headingFont.replace("font-['", "").replace("']", "").replace(/_/g, " ")}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Body Font: </span>
                      <span className="font-medium">{style.bodyFont.replace("font-['", "").replace("']", "").replace(/_/g, " ")}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Apply Selected */}
          {selectedStyle && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
              <div className="glass-card px-6 py-4 rounded-full shadow-2xl border-2 border-primary/20">
                <div className="flex items-center gap-4">
                  <p className="text-sm font-medium">
                    Selected: <span className="text-primary">{fontStyles.find(s => s.id === selectedStyle)?.name}</span>
                  </p>
                  <Button size="sm" className="bg-green-500 hover:bg-green-600">
                    Apply to Homepage
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FontStylesDemo;
