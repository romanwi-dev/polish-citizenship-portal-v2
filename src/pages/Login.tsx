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
import { AlertCircle, Sparkles, LogIn, UserPlus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { GlobalBackground } from "@/components/GlobalBackground";
import RealisticGlobe from "@/components/visuals/RealisticGlobe";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isPasswordStrong, setIsPasswordStrong] = useState(false);
  const [breachWarning, setBreachWarning] = useState("");
  const { isLargeFonts } = useAccessibility();

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
    <div className="min-h-screen overflow-x-hidden relative flex flex-col lg:flex-row items-start lg:items-center justify-center lg:justify-between px-4 lg:px-16 pt-16 lg:pt-0 pb-8">
      {/* Left Column: Login Content */}
      <div className="w-full lg:w-[480px] max-w-lg mx-auto lg:mx-0 relative z-10 lg:pt-20">
        {/* Header + Subtitle */}
        <div className="space-y-2 mb-6 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text leading-tight whitespace-nowrap">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            {isSignUp ? "Create a new account to access your case management system" : "Sign in to access your case management system"}
          </p>
        </div>

        {/* Form */}
        <div className="animate-scale-in w-full mt-4">
          <form onSubmit={handleAuth} className="w-full space-y-4">
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

              <div className="space-y-4 pt-8 md:pt-12">
                <Button 
                  type="submit" 
                  className="w-full h-16 md:h-20 text-lg md:text-xl font-bold bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border-2 border-white/30 flex items-center justify-center"
                  style={{ 
                    paddingTop: '0',
                    paddingBottom: '0',
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                    boxSizing: 'border-box'
                  }}
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
                  className="w-full h-16 md:h-20 text-lg md:text-xl font-bold bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border-2 border-white/30 flex items-center justify-center"
                  style={{ 
                    paddingTop: '0',
                    paddingBottom: '0',
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                    boxSizing: 'border-box'
                  }}
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    {isSignUp ? "Already have an account? Login" : "Open an Account / Register"}
                  </span>
                </Button>
              </div>
            </form>
        </div>
        
        {/* Back to Homepage Link */}
        <div className="mt-12 md:mt-16 text-center">
          <a
            href="/"
            className="text-sm md:text-base text-muted-foreground/50 hover:text-muted-foreground/70 transition-colors no-underline"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
          >
            ← Back to Homepage
          </a>
        </div>
      </div>

      {/* Right Column: Full-Screen Globe */}
      <div className="hidden lg:flex relative lg:flex-1 h-screen items-center justify-center">
        <RealisticGlobe />
      </div>
    </div>
  );
};

export default Login;
