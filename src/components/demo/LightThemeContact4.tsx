import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";
import { Send, Mail, Phone, MapPin, Clock } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(10, "Message must be at least 10 characters")
});

const LightThemeContact4 = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      contactSchema.parse(formData);
      toast.success("Your message has been received. We will contact you within 24 hours.");
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
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center py-16 bg-white border border-slate-200 rounded-lg">
            <div className="w-20 h-20 bg-slate-900 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Send className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-4">Message Received</h3>
            <p className="text-slate-700">Our team will respond within 24 business hours.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-1 bg-slate-900" />
              <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Contact Us</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Get in Touch
            </h2>
            <p className="text-lg text-slate-700">
              Reach out to discuss your citizenship application with our legal team.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Full Name</label>
                    <Input
                      type="text"
                      name="name"
                      placeholder="John Smith"
                      value={formData.name}
                      onChange={handleChange}
                      className="h-12 bg-slate-50 border-slate-300 focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Email Address</label>
                    <Input
                      type="email"
                      name="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="h-12 bg-slate-50 border-slate-300 focus:border-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Message</label>
                  <Textarea
                    name="message"
                    placeholder="Please describe your case..."
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="bg-slate-50 border-slate-300 focus:border-slate-900 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full md:w-auto bg-slate-900 text-white hover:bg-slate-800 h-12 px-8 font-semibold"
                >
                  Send Message
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <Mail className="h-8 w-8 text-slate-900 mb-4" />
                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">Email</h3>
                <p className="text-slate-900 font-medium">contact@polishlaw.com</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <Phone className="h-8 w-8 text-slate-900 mb-4" />
                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">Phone</h3>
                <p className="text-slate-900 font-medium">+48 22 123 4567</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <MapPin className="h-8 w-8 text-slate-900 mb-4" />
                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">Office</h3>
                <p className="text-slate-900 font-medium">Warsaw, Poland</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <Clock className="h-8 w-8 text-slate-900 mb-4" />
                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">Hours</h3>
                <p className="text-slate-900 font-medium">Mon-Fri: 9AM-6PM CET</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LightThemeContact4;
