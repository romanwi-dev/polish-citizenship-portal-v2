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
    <Card className={cn("border-2 sm:border-2 border-0 hover-glow w-full", colorSchemes[colorScheme], className)}>
      <CardHeader
        {...(longPress ? longPress.handlers : {})}
        className={cn(
          "px-3 sm:px-6 py-4 sm:py-6",
          onClearSection && "cursor-pointer"
        )}
      >
        <CardTitle className={cn(
          "flex items-center gap-2",
          isLargeFonts ? "text-3xl" : "text-xl"
        )}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 px-3 sm:px-6 pb-6">
        {children}
      </CardContent>
    </Card>
  );
};
