import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";
import { AlertCircle, Sparkles, LogIn, UserPlus, Type } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAccessibility } from "@/contexts/AccessibilityContext";

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
      console.error('Error checking password breach:', error);
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
    <div className="min-h-screen relative">
      <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8 relative z-10 max-w-7xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text text-center leading-tight break-words mb-4">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <div className="flex justify-center">
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
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-3xl"
        >
          <div className="p-8 md:p-12">
            <p className="text-center text-lg text-muted-foreground mb-8">
              {isSignUp ? "Create a new account to access the case management system" : "Sign in to access your case management system"}
            </p>
            
            <form onSubmit={handleAuth} className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
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
                  className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur"
                  style={{ 
                    fontSize: '0.75rem',
                    boxShadow: "0 0 30px hsla(221, 83%, 53%, 0.15)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 50px hsla(221, 83%, 53%, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 30px hsla(221, 83%, 53%, 0.15)";
                  }}
                />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="space-y-4"
              >
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
                  className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur"
                  style={{ 
                    fontSize: '0.75rem',
                    boxShadow: "0 0 30px hsla(221, 83%, 53%, 0.15)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 50px hsla(221, 83%, 53%, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 30px hsla(221, 83%, 53%, 0.15)";
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
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4 pt-4"
              >
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
              </motion.div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
