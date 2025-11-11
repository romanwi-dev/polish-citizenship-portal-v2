import { MinimalContactForm } from "@/components/demo/contact-forms/MinimalContactForm";
import { GlassmorphicContactForm } from "@/components/demo/contact-forms/GlassmorphicContactForm";
import { SplitLayoutContactForm } from "@/components/demo/contact-forms/SplitLayoutContactForm";
import { FloatingLabelContactForm } from "@/components/demo/contact-forms/FloatingLabelContactForm";
import { GradientCardContactForm } from "@/components/demo/contact-forms/GradientCardContactForm";

const ContactFormsDemo = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Contact Form Designs
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            5 unique contact form designs showcasing different styles and approaches
          </p>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="container mx-auto px-4 py-16 space-y-32">
        {/* Design 1: Minimal & Clean */}
        <section id="minimal">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              1. Minimal & Clean
            </h2>
            <p className="text-muted-foreground">
              Simple, focused design with subtle shadows and clean lines
            </p>
          </div>
          <MinimalContactForm />
        </section>

        {/* Design 2: Glassmorphic */}
        <section id="glassmorphic">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              2. Glassmorphic Card
            </h2>
            <p className="text-muted-foreground">
              Modern glass effect with backdrop blur and transparency
            </p>
          </div>
          <GlassmorphicContactForm />
        </section>

        {/* Design 3: Split Layout */}
        <section id="split">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              3. Split Layout
            </h2>
            <p className="text-muted-foreground">
              Two-column design with info panel and form side-by-side
            </p>
          </div>
          <SplitLayoutContactForm />
        </section>

        {/* Design 4: Floating Labels */}
        <section id="floating">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              4. Floating Labels
            </h2>
            <p className="text-muted-foreground">
              Animated floating labels with smooth transitions
            </p>
          </div>
          <FloatingLabelContactForm />
        </section>

        {/* Design 5: Gradient Card */}
        <section id="gradient">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              5. Gradient Card
            </h2>
            <p className="text-muted-foreground">
              Bold gradient background with elevated form card
            </p>
          </div>
          <GradientCardContactForm />
        </section>
      </div>
    </div>
  );
};

export default ContactFormsDemo;
