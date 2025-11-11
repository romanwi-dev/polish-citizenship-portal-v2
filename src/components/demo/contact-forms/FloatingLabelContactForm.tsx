import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const FloatingLabelContactForm = () => {
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
    <div className="max-w-2xl mx-auto perspective-1000">
      <div className={`relative transition-all duration-700 transform-style-3d ${isSubmitted ? 'rotate-y-180' : ''}`}>
        {/* Front - Form */}
        <div className={`bg-card border border-border rounded-3xl p-10 shadow-md backface-hidden ${isSubmitted ? 'invisible' : ''}`}>
          <form onSubmit={handleSubmit} className="space-y-8">
          {/* Floating Label Name Field */}
          <div className="relative">
            <input
              id="float-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder=" "
              className="peer h-14 w-full border-2 border-border rounded-xl px-4 pt-5 pb-1 bg-background text-foreground focus:border-primary focus:outline-none transition-colors"
              required
            />
            <label
              htmlFor="float-name"
              className="absolute left-4 top-4 text-muted-foreground text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs"
            >
              Name
            </label>
          </div>

          {/* Floating Label Email Field */}
          <div className="relative">
            <input
              id="float-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder=" "
              className="peer h-14 w-full border-2 border-border rounded-xl px-4 pt-5 pb-1 bg-background text-foreground focus:border-primary focus:outline-none transition-colors"
              required
            />
            <label
              htmlFor="float-email"
              className="absolute left-4 top-4 text-muted-foreground text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs"
            >
              Email
            </label>
          </div>

          {/* Floating Label Message Field */}
          <div className="relative">
            <textarea
              id="float-message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder=" "
              className="peer min-h-[160px] w-full border-2 border-border rounded-xl px-4 pt-6 pb-2 bg-background text-foreground focus:border-primary focus:outline-none transition-colors resize-none"
              required
            />
            <label
              htmlFor="float-message"
              className="absolute left-4 top-4 text-muted-foreground text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs"
            >
              Message
            </label>
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-lg font-semibold"
          >
            <Send className="h-5 w-5 mr-2" />
            Send Message
          </Button>
        </form>
      </div>
      
      {/* Back - Thank You */}
      <div className={`absolute inset-0 bg-[hsl(220,70%,20%)] rounded-3xl p-10 flex items-center justify-center rotate-y-180 backface-hidden ${isSubmitted ? '' : 'invisible'}`}>
        <p className="text-white text-xl text-center">Thank you. We will get back to you shortly...</p>
      </div>
    </div>
    </div>
  );
};
