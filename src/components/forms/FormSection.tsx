import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLongPressWithFeedback } from "@/hooks/useLongPressWithFeedback";

type ColorScheme = 'children' | 'applicant' | 'parents' | 'grandparents' | 'ggp' | 'poa' | 'citizenship' | 'civil-reg';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  onClearSection?: () => void;
  isLargeFonts?: boolean;
  className?: string;
  colorScheme?: ColorScheme;
}

const colorSchemes = {
  children: '',
  applicant: '',
  parents: '',
  grandparents: '',
  ggp: '',
  poa: '',
  citizenship: '',
  'civil-reg': '',
};

export const FormSection = ({ 
  title, 
  children, 
  onClearSection,
  isLargeFonts = false,
  className,
  colorScheme = 'applicant'
}: FormSectionProps) => {
  const longPress = onClearSection 
    ? useLongPressWithFeedback({ 
        onLongPress: onClearSection, 
        duration: 2000,
        feedbackMessage: `Hold to clear ${title}`
      })
    : null;

  return (
    <div className={cn("w-full space-y-6 py-6", className)}>
      <div
        {...(longPress ? longPress.handlers : {})}
        className={cn(
          "px-4 sm:px-6",
          onClearSection && "cursor-pointer"
        )}
      >
        <h3 className={cn(
          "flex items-center gap-2 font-heading font-bold",
          isLargeFonts ? "text-3xl" : "text-xl"
        )}>
          {title}
        </h3>
      </div>
      <div className="space-y-6 px-4 sm:px-6">
        {children}
      </div>
    </div>
  );
};
