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
    <div className={cn("space-y-6 w-full", className)}>
      <h3
        {...(longPress ? longPress.handlers : {})}
        className={cn(
          "font-heading font-bold text-primary border-b border-border/30 pb-3",
          isLargeFonts ? "text-3xl" : "text-xl",
          onClearSection && "cursor-pointer hover:text-primary/80 transition-colors"
        )}
      >
        {title}
      </h3>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};
