import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";
import { Mail, MessageCircle, Phone } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(10, "Message must be at least 10 characters")
});

const LightThemeContact3 = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      contactSchema.parse(formData);
      toast.success("Message sent! We'll respond within 24 hours.");
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ name: "", email: "", message: "" });
      }, 3000);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (isSubmitted) {
    return (
      <section className="py-24 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce">
              <MessageCircle className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Message Received!
            </h3>
            <p className="text-xl text-slate-600">We'll reply within 24 hours</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Let's Talk
              </span>
            </h2>
            <p className="text-xl text-slate-600">
              Your citizenship journey starts with a conversation
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="h-16 bg-white border-2 border-blue-200 focus:border-purple-500 text-lg rounded-2xl shadow-lg"
                />
              </div>

              <div>
                <Input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="h-16 bg-white border-2 border-blue-200 focus:border-purple-500 text-lg rounded-2xl shadow-lg"
                />
              </div>

              <div>
                <Textarea
                  name="message"
                  placeholder="Tell us about your citizenship goals..."
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="bg-white border-2 border-blue-200 focus:border-purple-500 text-lg resize-none rounded-2xl shadow-lg"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                Send Message
                <MessageCircle className="ml-2 h-6 w-6" />
              </Button>
            </form>

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Email Us</h3>
                <p className="text-slate-600">contact@polishcitizenship.com</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Call Us</h3>
                <p className="text-slate-600">+48 22 123 4567</p>
              </div>

              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-black mb-2">Response Time</h3>
                <p className="text-lg opacity-90">We reply within 24 hours, 7 days a week</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LightThemeContact3;
