import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLongPressWithFeedback } from "@/hooks/useLongPressWithFeedback";

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  onClearSection?: () => void;
  isLargeFonts?: boolean;
  className?: string;
}

export const FormSection = ({ 
  title, 
  children, 
  onClearSection,
  isLargeFonts = false,
  className 
}: FormSectionProps) => {
  const longPress = onClearSection 
    ? useLongPressWithFeedback({ 
        onLongPress: onClearSection, 
        duration: 2000,
        feedbackMessage: `Hold to clear ${title}`
      })
    : null;

  return (
    <Card className={cn("border-2 hover-glow w-full", className)}>
      <CardHeader
        {...(longPress ? longPress.handlers : {})}
        className={onClearSection ? "cursor-pointer px-3 sm:px-6" : "px-3 sm:px-6"}
      >
        <CardTitle className={cn(
          "flex items-center gap-2",
          isLargeFonts ? "text-3xl" : "text-xl"
        )}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 px-3 sm:px-6">
        {children}
      </CardContent>
    </Card>
  );
};
