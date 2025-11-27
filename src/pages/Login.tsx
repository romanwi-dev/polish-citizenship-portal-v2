import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/secureLogger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";
import { AlertCircle, Sparkles, LogIn, UserPlus, Type } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { GlobalBackground } from "@/components/GlobalBackground";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isPasswordStrong, setIsPasswordStrong] = useState(false);
  const [breachWarning, setBreachWarning] = useState("");
  const { isLargeFonts, toggleFontSize } = useAccessibility();

  const checkPasswordBreach = async (pwd: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('check-password-breach', {
        body: { password: pwd }
      });

      if (error) throw error;

      if (data.isBreached) {
        setBreachWarning(data.message);
        return false;
      }

      setBreachWarning("");
      return true;
    } catch (error) {
      logger.error('Error checking password breach', error);
      // Don't block signup if breach check fails
      return true;
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setBreachWarning("");

    try {
      if (isSignUp) {
        // Validate password strength
        if (!isPasswordStrong) {
          toast.error("Please choose a stronger password that meets all requirements");
          setLoading(false);
          return;
        }

        // Check for leaked password
        const isSafe = await checkPasswordBreach(password);
        if (!isSafe) {
          setLoading(false);
          return;
        }

        const redirectUrl = `${window.location.origin}/admin/cases`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl
          }
        });
        if (error) throw error;
        toast.success("Account created successfully!");
        navigate("/admin/cases", { replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Logged in successfully!");
        navigate("/admin/cases", { replace: true });
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden relative flex items-center justify-center">
      <GlobalBackground />
      <div className="w-full max-w-md px-4 md:px-6 lg:px-8 relative z-10 flex flex-col items-center">
        {/* Header */}
        <div className="animate-fade-in-up mb-6 w-full">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text text-center leading-tight break-words mb-3">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <div className="flex justify-center mb-4">
            <Button
              onClick={toggleFontSize}
              variant="ghost"
              size="icon"
              className="h-10 w-10 md:h-12 md:w-12"
              title="Toggle font size"
            >
              <Type className="h-6 w-6 md:h-8 md:w-8" />
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="animate-scale-in w-full">
          <div className="p-8 lg:p-10 space-y-6">
            <p className="text-center text-base md:text-lg text-muted-foreground mb-6">
              {isSignUp ? "Create a new account to access the case management system" : "Sign in to access your case management system"}
            </p>
            
            <form onSubmit={handleAuth} className="space-y-5">
              <div className="space-y-4">
                <Label 
                  htmlFor="email" 
                  className={cn(
                    "font-light text-foreground/90",
                    isLargeFonts ? "text-xl" : "text-sm"
                  )}
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder=""
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  required
                  className="h-16 md:h-20 border-2 hover:border-transparent focus:border-transparent transition-all duration-300 backdrop-blur font-normal font-input-work w-full bg-blue-50/45 dark:bg-blue-950/40 border-blue-200/30 dark:border-blue-800/30"
                  style={{ 
                    fontSize: '24px',
                    boxShadow: "0 0 30px hsla(221, 83%, 53%, 0.15)",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 50px hsla(221, 83%, 53%, 0.3)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 30px hsla(221, 83%, 53%, 0.15)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 60px hsla(221, 83%, 53%, 0.4)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 30px hsla(221, 83%, 53%, 0.15)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                />
              </div>

              <div className="space-y-4">
                <Label 
                  htmlFor="password"
                  className={cn(
                    "font-light text-foreground/90",
                    isLargeFonts ? "text-xl" : "text-sm"
                  )}
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder=""
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-16 md:h-20 border-2 hover:border-transparent focus:border-transparent transition-all duration-300 backdrop-blur font-normal font-input-work w-full bg-blue-50/45 dark:bg-blue-950/40 border-blue-200/30 dark:border-blue-800/30"
                  style={{ 
                    fontSize: '24px',
                    boxShadow: "0 0 30px hsla(221, 83%, 53%, 0.15)",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 50px hsla(221, 83%, 53%, 0.3)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 30px hsla(221, 83%, 53%, 0.15)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 60px hsla(221, 83%, 53%, 0.4)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 30px hsla(221, 83%, 53%, 0.15)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                />
                
                {isSignUp && <PasswordStrengthMeter 
                  password={password} 
                  onStrengthChange={setIsPasswordStrong}
                />}

                {breachWarning && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{breachWarning}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-4 pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-16 text-lg md:text-xl font-bold bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Sparkles className="h-5 w-5 animate-spin mr-2 opacity-50" />
                      <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                        {isSignUp ? "Creating Account..." : "Signing In..."}
                      </span>
                    </>
                  ) : (
                    <>
                      {isSignUp ? <UserPlus className="h-5 w-5 mr-2 opacity-50" /> : <LogIn className="h-5 w-5 mr-2 opacity-50" />}
                      <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                        {isSignUp ? "Sign Up" : "Login"}
                      </span>
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-16 text-lg md:text-xl font-bold bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    {isSignUp ? "Already have an account? Login" : "Open an Account / Register"}
                  </span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
