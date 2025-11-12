import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Mail, Globe, Palette, FileText } from "lucide-react";
import polishSecretaryWelcome from "@/assets/demos/polish-secretary-welcome.jpg";

const DemosHub = () => {
  const navigate = useNavigate();

  const demos = [
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
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background matching the main site */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
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

          {/* Welcome Message with Polish Secretary */}
          <div className="mt-16">
            <div className="glass-card rounded-lg overflow-hidden max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image Side */}
                <div className="h-64 md:h-auto">
                  <img 
                    src={polishSecretaryWelcome} 
                    alt="Professional Polish legal secretary welcoming clients" 
                    className="w-full h-full object-cover"
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
