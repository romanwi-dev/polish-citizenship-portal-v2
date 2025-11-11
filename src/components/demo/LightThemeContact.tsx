import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, Send, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const COUNTRIES = [
  "USA", "UK", "Canada", "Australia", "South Africa", "Brazil", 
  "Argentina", "Mexico", "Venezuela", "Israel", "Germany", "France", "Other"
];

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  country: z.string().min(1, "Please select a country"),
  polishAncestor: z.string().min(1, "Please select your Polish ancestor"),
  polishDocuments: z.string().min(1, "Please select an option"),
});

const LightThemeContact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country: "",
    polishAncestor: "",
    polishDocuments: "",
  });
  const [isFlipped, setIsFlipped] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      contactSchema.parse(formData);
      setIsFlipped(true);
      
      toast({
        title: "Message Sent Successfully!",
        description: "We'll get back to you within 24 hours.",
      });

      setTimeout(() => {
        setIsFlipped(false);
        setFormData({ 
          name: "", 
          email: "", 
          country: "", 
          polishAncestor: "", 
          polishDocuments: "" 
        });
      }, 5000);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  return (
    <section id="contact" className="py-24 bg-gradient-to-b from-card/30 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Get in Touch
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions about the citizenship process? Our expert team is here to help.
            </p>
          </div>

          {/* Contact Form Card with 3D Flip */}
          <div className="perspective-1000">
            <div
              className={`transform-style-3d transition-all duration-700 ${
                isFlipped ? "rotate-y-180" : ""
              }`}
            >
              {/* Front - Contact Form */}
              <div className={`backface-hidden ${isFlipped ? "hidden" : ""}`}>
                <div className="bg-card border-2 border-border rounded-3xl p-10 md:p-12 shadow-[var(--shadow-elevated-light)]">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Name Field */}
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-lg font-semibold text-foreground">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        noMobileCaps
                        className="h-14 text-lg bg-background border-2 border-border focus:border-primary focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.1)] transition-all duration-200"
                        required
                      />
                    </div>

                    {/* Email Field */}
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-lg font-semibold text-foreground">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        noMobileCaps
                        className="h-14 text-lg bg-background border-2 border-border focus:border-primary focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.1)] transition-all duration-200"
                        required
                      />
                    </div>

                    {/* Country Field */}
                    <div className="space-y-3">
                      <Label htmlFor="country" className="text-lg font-semibold text-foreground">
                        Country
                      </Label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) => handleSelectChange("country", value)}
                      >
                        <SelectTrigger className="h-14 text-lg bg-background border-2 border-border focus:border-primary focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.1)] transition-all duration-200">
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-2 z-[100]">
                          {COUNTRIES.map((country) => (
                            <SelectItem
                              key={country}
                              value={country}
                              className="text-base cursor-pointer hover:bg-primary/10"
                            >
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Polish Ancestor Field */}
                    <div className="space-y-3">
                      <Label htmlFor="polishAncestor" className="text-lg font-semibold text-foreground">
                        Polish Ancestor
                      </Label>
                      <Select
                        value={formData.polishAncestor}
                        onValueChange={(value) => handleSelectChange("polishAncestor", value)}
                      >
                        <SelectTrigger className="h-14 text-lg bg-background border-2 border-border focus:border-primary focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.1)] transition-all duration-200">
                          <SelectValue placeholder="Select your Polish ancestor" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-2 z-[100]">
                          <SelectItem value="mother" className="text-base cursor-pointer hover:bg-primary/10">Mother</SelectItem>
                          <SelectItem value="father" className="text-base cursor-pointer hover:bg-primary/10">Father</SelectItem>
                          <SelectItem value="grandmother" className="text-base cursor-pointer hover:bg-primary/10">Grandmother</SelectItem>
                          <SelectItem value="grandfather" className="text-base cursor-pointer hover:bg-primary/10">Grandfather</SelectItem>
                          <SelectItem value="great-grandmother" className="text-base cursor-pointer hover:bg-primary/10">Great-grandmother</SelectItem>
                          <SelectItem value="great-grandfather" className="text-base cursor-pointer hover:bg-primary/10">Great-grandfather</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Polish Documents Field */}
                    <div className="space-y-3">
                      <Label htmlFor="polishDocuments" className="text-lg font-semibold text-foreground">
                        Polish Documents
                      </Label>
                      <Select
                        value={formData.polishDocuments}
                        onValueChange={(value) => handleSelectChange("polishDocuments", value)}
                      >
                        <SelectTrigger className="h-14 text-lg bg-background border-2 border-border focus:border-primary focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.1)] transition-all duration-200">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-2 z-[100]">
                          <SelectItem value="have-documents" className="text-base cursor-pointer hover:bg-primary/10">I have some Polish documents of my family</SelectItem>
                          <SelectItem value="no-documents" className="text-base cursor-pointer hover:bg-primary/10">I don't have any Polish documents</SelectItem>
                          <SelectItem value="need-check" className="text-base cursor-pointer hover:bg-primary/10">I need to check</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-secondary text-white border-2 border-primary/20 rounded-xl shadow-[var(--shadow-elevated-light)] hover:shadow-[var(--shadow-hover-light)] hover:-translate-y-1 transition-all duration-300"
                    >
                      <Send className="h-5 w-5 mr-2" />
                      Send Message
                    </Button>
                  </form>

                  {/* Trust Indicators */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-12 border-t-2 border-border">
                    {[
                      { icon: Shield, label: "Secure & Confidential" },
                      { icon: MessageSquare, label: "24h Response Time" },
                      { icon: Shield, label: "GDPR Compliant" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3 justify-center">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <item.icon className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Back - Thank You Message */}
              <div
                className={`backface-hidden rotate-y-180 absolute inset-0 ${
                  !isFlipped ? "hidden" : ""
                }`}
              >
                <div className="bg-gradient-to-br from-primary via-secondary to-primary rounded-3xl p-12 shadow-[var(--shadow-hover-light)] h-full flex flex-col items-center justify-center text-center text-white">
                  <div className="space-y-6">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto animate-scale-in">
                      <Send className="h-10 w-10" />
                    </div>
                    <h3 className="text-4xl font-bold">Thank You!</h3>
                    <p className="text-xl opacity-90 max-w-md">
                      Your message has been received. We'll respond within 24 hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LightThemeContact;
