import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthMeterProps {
  password: string;
  onStrengthChange?: (isStrong: boolean) => void;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export const PasswordStrengthMeter = ({ password, onStrengthChange }: PasswordStrengthMeterProps) => {
  const [strength, setStrength] = useState(0);
  const [requirements, setRequirements] = useState<PasswordRequirement[]>([]);

  useEffect(() => {
    const reqs: PasswordRequirement[] = [
      { label: "At least 8 characters", met: password.length >= 8 },
      { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
      { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
      { label: "Contains number", met: /\d/.test(password) },
      { label: "Contains special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];

    setRequirements(reqs);

    const metCount = reqs.filter(r => r.met).length;
    const strengthValue = (metCount / reqs.length) * 100;
    setStrength(strengthValue);

    const isStrong = metCount >= 4; // At least 4 out of 5 requirements
    onStrengthChange?.(isStrong);
  }, [password, onStrengthChange]);

  if (!password) return null;

  const getStrengthLabel = () => {
    if (strength < 40) return "Weak";
    if (strength < 60) return "Fair";
    if (strength < 80) return "Good";
    return "Strong";
  };

  const getStrengthColor = () => {
    if (strength < 40) return "bg-destructive";
    if (strength < 60) return "bg-yellow-500";
    if (strength < 80) return "bg-blue-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-3 mt-2">
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Password Strength</span>
          <span className={cn("text-sm font-medium", 
            strength < 40 && "text-destructive",
            strength >= 40 && strength < 60 && "text-yellow-500",
            strength >= 60 && strength < 80 && "text-blue-500",
            strength >= 80 && "text-green-500"
          )}>
            {getStrengthLabel()}
          </span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div 
            className={cn("h-full transition-all", getStrengthColor())}
            style={{ width: `${strength}%` }}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        {requirements.map((req, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            {req.met ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground/40" />
            )}
            <span className={cn(
              "text-xs",
              req.met ? "text-muted-foreground" : "text-muted-foreground/60"
            )}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
