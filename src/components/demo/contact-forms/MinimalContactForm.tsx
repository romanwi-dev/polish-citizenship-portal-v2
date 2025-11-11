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

export const MinimalContactForm = () => {
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
      <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="minimal-name" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="minimal-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              className="h-12"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimal-email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="minimal-email"
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
            <Label htmlFor="minimal-message" className="text-sm font-medium">
              Message
            </Label>
            <Textarea
              id="minimal-message"
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
  );
};
