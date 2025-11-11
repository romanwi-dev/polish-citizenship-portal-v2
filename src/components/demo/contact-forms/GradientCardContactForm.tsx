import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const GradientCardContactForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      contactSchema.parse(formData);
      setIsSubmitted(true);
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-4xl mx-auto perspective-1000">
      <div className={`relative transition-all duration-700 transform-style-3d ${isSubmitted ? 'rotate-y-180' : ''}`}>
        {/* Front - Form */}
        <div className={`relative bg-gradient-to-br from-primary via-secondary to-accent p-1 rounded-3xl shadow-2xl backface-hidden ${isSubmitted ? 'invisible' : ''}`}>
          <div className="bg-background rounded-3xl p-12">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Premium Support</span>
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-3">Let's Connect</h3>
            <p className="text-muted-foreground">
              Fill out the form below and we'll get back to you within 24 hours
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="gradient-name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="gradient-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="h-12 border-2"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gradient-email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="gradient-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="h-12 border-2"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gradient-message" className="text-sm font-medium">
                Your Message
              </Label>
              <Textarea
                id="gradient-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us what you need help with..."
                className="min-h-[160px] resize-none border-2"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 transition-opacity"
            >
              <Send className="h-5 w-5 mr-2" />
              Send Message
            </Button>
          </form>
        </div>
      </div>
      
      {/* Back - Thank You */}
      <div className={`absolute inset-0 bg-[hsl(220,70%,20%)] rounded-3xl p-12 flex items-center justify-center rotate-y-180 backface-hidden ${isSubmitted ? '' : 'invisible'}`}>
        <p className="text-white text-xl text-center">Thank you. We will get back to you shortly...</p>
      </div>
    </div>
    </div>
  );
};
