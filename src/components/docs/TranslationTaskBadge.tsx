import { Badge } from "@/components/ui/badge";
import { Languages, CheckCircle2, AlertCircle } from "lucide-react";
import { getLanguageName, DetectedLanguage } from "@/utils/documentLanguageDetector";

interface TranslationTaskBadgeProps {
  language: string;
  needsTranslation?: boolean;
  isTranslated?: boolean;
  compact?: boolean;
}

/**
 * Visual indicator for document translation status
 * Shows language code, translation requirement, and completion status
 */
export function TranslationTaskBadge({ 
  language, 
  needsTranslation = false, 
  isTranslated = false,
  compact = false 
}: TranslationTaskBadgeProps) {
  // Polish documents don't need translation
  if (language === 'PL') {
    return compact ? null : (
      <Badge variant="default" className="gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Polish
      </Badge>
    );
  }

  // Unknown language
  if (language === 'UNKNOWN') {
    return (
      <Badge variant="secondary" className="gap-1">
        <AlertCircle className="h-3 w-3" />
        Unknown
      </Badge>
    );
  }

  // Already translated
  if (isTranslated) {
    return (
      <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-700">
        <CheckCircle2 className="h-3 w-3" />
        Translated
      </Badge>
    );
  }

  // Needs translation
  if (needsTranslation) {
    const languageName = getLanguageName(language as DetectedLanguage);
    return (
      <Badge variant="destructive" className="gap-1 animate-pulse">
        <Languages className="h-3 w-3" />
        {compact ? 'Translation Required' : `Translate from ${languageName}`}
      </Badge>
    );
  }

  // Default: show language
  return (
    <Badge variant="outline" className="gap-1">
      {getLanguageName(language as DetectedLanguage)}
    </Badge>
  );
}
