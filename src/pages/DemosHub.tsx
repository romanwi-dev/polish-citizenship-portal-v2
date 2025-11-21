import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Mail, Globe, Palette, FileText, Target, Image, Layout } from "lucide-react";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { GlobalBackground } from "@/components/GlobalBackground";
import { WarsawSkyline } from "@/components/WarsawSkyline";
import RomeSkyline from "@/components/RomeSkyline";
import ParisSkyline from "@/components/ParisSkyline";
import secretary16 from "@/assets/secretaries/secretary-16.png";
import secretary17 from "@/assets/secretaries/secretary-17.png";
import secretary18 from "@/assets/secretaries/secretary-18.png";
import secretary19 from "@/assets/secretaries/secretary-19.png";
import secretary20 from "@/assets/secretaries/secretary-20.png";
import secretary21 from "@/assets/secretaries/secretary-21.png";
import secretary22 from "@/assets/secretaries/secretary-22.png";
import secretary23 from "@/assets/secretaries/secretary-23.png";
import secretary24 from "@/assets/secretaries/secretary-24.png";
import secretary25 from "@/assets/secretaries/secretary-25.png";
import polishSecretaryWelcome from "@/assets/demos/polish-secretary-welcome.jpg";
import polishSecretaryDesk from "@/assets/demos/polish-secretary-desk.jpg";
import polishSecretaryStanding from "@/assets/demos/polish-secretary-standing.jpg";
import polishSecretaryReception from "@/assets/demos/polish-secretary-reception.jpg";
import polishSecretaryDocuments from "@/assets/demos/polish-secretary-documents.jpg";
import polishSecretary6 from "@/assets/demos/polish-secretary-6.jpg";
import polishSecretary7 from "@/assets/demos/polish-secretary-7.jpg";
import polishSecretary8 from "@/assets/demos/polish-secretary-8.jpg";
import polishSecretary9 from "@/assets/demos/polish-secretary-9.jpg";
import polishSecretary10 from "@/assets/demos/polish-secretary-10.jpg";
import polishSecretary11 from "@/assets/demos/polish-secretary-11.jpg";
import polishSecretary12 from "@/assets/demos/polish-secretary-12.jpg";
import polishSecretary13 from "@/assets/demos/polish-secretary-13.jpg";
import polishSecretary14 from "@/assets/demos/polish-secretary-14.jpg";
import polishSecretary15 from "@/assets/demos/polish-secretary-15.jpg";
import polishSecretary16 from "@/assets/demos/polish-secretary-16.jpg";
import polishSecretary17 from "@/assets/demos/polish-secretary-17.jpg";
import polishSecretary18 from "@/assets/demos/polish-secretary-18.jpg";
import polishSecretary19 from "@/assets/demos/polish-secretary-19.jpg";
import polishSecretary20 from "@/assets/demos/polish-secretary-20.jpg";

const DemosHub = () => {
  const navigate = useNavigate();
  const [isWelcomeFlipped, setIsWelcomeFlipped] = useState(false);

  const secretaryImages = [
    secretary16,
    secretary17,
    secretary18,
    secretary19,
    secretary20,
    secretary21,
    secretary22,
    secretary23,
    secretary24,
    secretary25,
    polishSecretaryWelcome,
    polishSecretaryDesk,
    polishSecretaryStanding,
    polishSecretaryReception,
    polishSecretaryDocuments,
    polishSecretary6,
    polishSecretary7,
    polishSecretary8,
    polishSecretary9,
    polishSecretary10,
    polishSecretary11,
    polishSecretary12,
    polishSecretary13,
    polishSecretary14,
    polishSecretary15,
    polishSecretary16,
    polishSecretary17,
    polishSecretary18,
    polishSecretary19,
    polishSecretary20,
  ];

  const demos = [
    {
      id: "hero-gallery",
      title: "Hero Sections Gallery ⭐",
      description: "10 stunning hero section designs with 3D, video, and particle effects - 5 with lead capture forms",
      icon: Layout,
      path: "/hero-gallery",
      gradient: "from-violet-600 to-fuchsia-600",
      features: ["3D Backgrounds", "Video Effects", "Lead Forms"]
    },
    {
      id: "main-cta-reference",
      title: "Main CTA Reference ⭐",
      description: "Golden standard for all main CTA buttons - size, animations, colors, and settings",
      icon: Target,
      path: "/demos/main-cta-reference",
      gradient: "from-red-600 to-red-800",
      features: ["Core Standard", "Golden Reference", "Design System"]
    },
    {
      id: "warsaw",
      title: "Warsaw Future City",
      description: "Interactive 3D Warsaw cityscape with futuristic architecture and animations",
      icon: Globe,
      path: "/warsaw-demo",
      gradient: "from-blue-500 to-cyan-500",
      features: ["3D Graphics", "Interactive Elements", "Animations"]
    },
    {
      id: "eu-celebration",
      title: "EU Celebration",
      description: "Festive European Union celebration with fireworks and confetti effects",
      icon: Sparkles,
      path: "/eu-celebration-demo",
      gradient: "from-purple-500 to-pink-500",
      features: ["Particle Effects", "Celebrations", "Visual Effects"]
    },
    {
      id: "contact-forms",
      title: "Contact Forms Collection",
      description: "Various contact form designs and styles for different use cases",
      icon: Mail,
      path: "/contact-forms-demo",
      gradient: "from-green-500 to-emerald-500",
      features: ["Form Validation", "Multiple Layouts", "Responsive Design"]
    },
    {
      id: "font-styles",
      title: "Font & Content Styles",
      description: "Compare different typography combinations and choose the perfect style for your content",
      icon: FileText,
      path: "/font-styles-demo",
      gradient: "from-pink-500 to-rose-500",
      features: ["Typography", "Font Pairing", "Readability"]
    },
    {
      id: "multi-step-wizard",
      title: "Multi-Step Form Wizard",
      description: "Interactive multi-step form with progress tracking and validation",
      icon: FileText,
      path: "/multi-step-demo",
      gradient: "from-orange-500 to-red-500",
      features: ["Step Navigation", "Progress Bar", "Field Validation"]
    },
    {
      id: "design-showcase",
      title: "Design System Showcase",
      description: "Complete UI component library and design system demonstration",
      icon: Palette,
      path: "/design-showcase",
      gradient: "from-indigo-500 to-purple-500",
      features: ["Components", "Typography", "Color Palette"]
    },
    {
      id: "thank-you-images",
      title: "Thank You Images",
      description: "Professional images perfect for thank you pages and confirmation screens",
      icon: Image,
      path: "/thank-you-images-demo",
      gradient: "from-teal-500 to-cyan-500",
      features: ["Professional Photos", "High Quality", "Multiple Options"]
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background matching the main site */}
      <GlobalBackground />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-primary/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Demos Hub
            </h1>
            <div className="w-24" /> {/* Spacer for alignment */}
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Interactive Demonstrations</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-6">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Explore Our Demos
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Interactive demonstrations showcasing various features, designs, and capabilities
            </p>
          </div>

          {/* Demos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {demos.map((demo) => (
              <div
                key={demo.id}
                onClick={() => navigate(demo.path)}
                className="glass-card p-6 rounded-lg hover-glow cursor-pointer group transition-all duration-300 hover:scale-105 hover:-translate-y-1"
              >
                {/* Icon with gradient background */}
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${demo.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <demo.icon className="h-8 w-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {demo.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {demo.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {demo.features.map((feature, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* View Demo Link */}
                <div className="mt-4 pt-4 border-t border-border/50">
                  <span className="text-sm text-primary font-medium group-hover:underline">
                    View Demo →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Warsaw Skyline */}
          <div className="my-16 md:my-24">
            <WarsawSkyline />
          </div>

          {/* Paris Skyline */}
          <div className="my-16 md:my-24">
            <ParisSkyline />
          </div>

          {/* Rome Skyline */}
          <div className="my-16 md:my-24">
            <RomeSkyline />
          </div>

          {/* Welcome Message with Polish Secretary - Flip Card */}
          <div className="mt-16">
            <div 
              className="max-w-4xl mx-auto cursor-pointer group"
              style={{ perspective: '1000px' }}
              onClick={() => setIsWelcomeFlipped(!isWelcomeFlipped)}
            >
              <div 
                className="relative w-full transition-all duration-700 group-hover:scale-[1.02] group-hover:rotate-y-[5deg]"
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: isWelcomeFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                {/* Front Side */}
                <div 
                  className="glass-card rounded-lg overflow-hidden shadow-lg group-hover:shadow-[0_0_40px_rgba(var(--primary-rgb),0.3)] transition-shadow duration-500"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden'
                  }}
                >
                  <div className="grid md:grid-cols-2 gap-0">
                    {/* Image Side - Carousel */}
                    <div className="h-64 md:h-auto relative group">
                      <ImageCarousel
                        images={secretaryImages}
                        alt="Professional Polish legal secretary"
                        autoPlay={false}
                        interval={4000}
                        showControls={true}
                        showIndicators={true}
                        className="h-full"
                      />
                    </div>
                    
                    {/* Text Side */}
                    <div className="p-8 flex flex-col justify-center">
                      <Sparkles className="h-12 w-12 text-primary mb-4" />
                      <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Thank You for Exploring
                      </h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        We appreciate your interest in our demonstrations. Our team is here to help you explore 
                        these features and answer any questions you may have.
                      </p>
                      <p className="text-sm text-muted-foreground/80 italic">
                        More demonstrations and interactive examples coming soon. Check back regularly for updates!
                      </p>
                      <p className="text-xs text-primary/60 group-hover:text-primary group-hover:font-semibold transition-all duration-300 mt-6">Click to see more →</p>
                    </div>
                  </div>
                </div>

                {/* Back Side */}
                <div 
                  className="absolute inset-0 glass-card rounded-lg overflow-hidden shadow-lg group-hover:shadow-[0_0_40px_rgba(var(--secondary-rgb),0.3)] transition-shadow duration-500"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="p-8 md:p-12 h-full flex flex-col justify-center">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          What Makes Our Demos Special?
                        </h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-primary font-bold">1</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-1">Interactive & Engaging</h4>
                            <p className="text-sm text-muted-foreground">Each demo is fully functional and showcases real-world applications</p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                            <span className="text-secondary font-bold">2</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-1">Production-Ready Code</h4>
                            <p className="text-sm text-muted-foreground">All demonstrations use best practices and modern frameworks</p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                            <span className="text-accent font-bold">3</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-1">Continuously Updated</h4>
                            <p className="text-sm text-muted-foreground">We regularly add new features and improve existing demos</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-border/50">
                        <p className="text-sm text-muted-foreground italic">
                          Have questions or suggestions? We'd love to hear from you!
                        </p>
                        <p className="text-xs text-primary/60 group-hover:text-primary group-hover:font-semibold transition-all duration-300 mt-4">Click to flip back</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemosHub;
