import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Send } from "lucide-react";

export default function RequestAccess() {
  const { t } = useTranslation('portal');
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error(t('requestAccess.fillRequired')); // Please fill in all required fields
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("contact_submissions")
        .insert([
          {
            name: formData.name,
            email: formData.email,
            message: `Phone: ${formData.phone}\n\nInterest in Polish Citizenship:\n${formData.message}`,
            status: "pending"
          }
        ]);

      if (error) throw error;

      toast.success(t('requestAccess.submitSuccess')); // Request submitted successfully! We'll review your application and contact you soon.
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: ""
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (error: any) {
      console.error("Error submitting request:", error);
      toast.error(t('requestAccess.submitError')); // Failed to submit request. Please try again.
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('requestAccess.backToHome')} {/* Back to Home */}
        </Button>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{t('requestAccess.title')}</CardTitle> {/* Request Portal Access */}
              <CardDescription className="text-base">
                {t('requestAccess.description')} 
                {/* Submit your information and we'll review your eligibility for Polish citizenship. After approval, you'll receive access to complete the full intake form. */}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    {t('requestAccess.fullName')} <span className="text-destructive">*</span> {/* Full Name */}
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('requestAccess.fullNamePlaceholder')} // Your full name
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    {t('requestAccess.email')} <span className="text-destructive">*</span> {/* Email Address */}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('requestAccess.emailPlaceholder')} // your.email@example.com
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    {t('requestAccess.phone')} {/* Phone Number */}
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t('requestAccess.phonePlaceholder')} // +1 (555) 123-4567
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">
                    {t('requestAccess.background')} {/* Brief Background */}
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t('requestAccess.backgroundPlaceholder')} // Tell us briefly about your Polish ancestry and why you're interested in citizenship...
                    rows={6}
                  />
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">{t('requestAccess.whatHappensNext')}</h3> {/* What happens next? */}
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>{t('requestAccess.step1')}</li> {/* We'll review your submission within 2-3 business days */}
                    <li>{t('requestAccess.step2')}</li> {/* If eligible, you'll receive an email with portal access */}
                    <li>{t('requestAccess.step3')}</li> {/* Complete the full intake form with all required documents */}
                    <li>{t('requestAccess.step4')}</li> {/* Our team will begin processing your citizenship application */}
                  </ol>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>{t('requestAccess.processing')}</>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      {t('requestAccess.submitButton')}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
