import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const GlassmorphicContactForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      contactSchema.parse(formData);
      toast({
        title: "Message Sent",
        description: "We'll get back to you soon.",
      });
      setFormData({ name: "", email: "", message: "" });
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
    <div className="max-w-2xl mx-auto">
      <div className="relative bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-3xl p-12 overflow-hidden">
        {/* Glass effect background */}
        <div className="absolute inset-0 bg-background/40 backdrop-blur-xl" />
        
        <div className="relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="glass-name" className="text-sm font-medium text-foreground">
                Name
              </Label>
              <Input
                id="glass-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                className="h-12 bg-background/60 backdrop-blur-sm border-primary/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="glass-email" className="text-sm font-medium text-foreground">
                Email
              </Label>
              <Input
                id="glass-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="h-12 bg-background/60 backdrop-blur-sm border-primary/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="glass-message" className="text-sm font-medium text-foreground">
                Message
              </Label>
              <Textarea
                id="glass-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your message..."
                className="min-h-[140px] resize-none bg-background/60 backdrop-blur-sm border-primary/20"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 font-semibold bg-primary/90 hover:bg-primary"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
