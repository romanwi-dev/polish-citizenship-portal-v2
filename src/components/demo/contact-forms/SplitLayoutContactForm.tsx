import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, Mail, MapPin, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const SplitLayoutContactForm = () => {
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
    <div className="max-w-5xl mx-auto">
      <div className="grid md:grid-cols-2 gap-0 bg-card border border-border rounded-3xl overflow-hidden shadow-lg">
        {/* Left Panel - Info */}
        <div className="bg-gradient-to-br from-primary to-secondary p-10 text-primary-foreground">
          <h3 className="text-3xl font-bold mb-6">Get in Touch</h3>
          <p className="text-primary-foreground/90 mb-10">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary-foreground/20 rounded-lg">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Email</p>
                <p className="text-sm text-primary-foreground/80">contact@example.com</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary-foreground/20 rounded-lg">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Phone</p>
                <p className="text-sm text-primary-foreground/80">+1 (555) 123-4567</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary-foreground/20 rounded-lg">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Office</p>
                <p className="text-sm text-primary-foreground/80">123 Business St, Warsaw</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="split-name" className="text-sm font-medium">
                Name
              </Label>
              <Input
                id="split-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="split-email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="split-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="split-message" className="text-sm font-medium">
                Message
              </Label>
              <Textarea
                id="split-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your message..."
                className="min-h-[140px] resize-none"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 font-semibold"
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
