import { Users, Star, CheckCircle, Award } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SocialProofBadgeProps {
  type: "clients" | "rating" | "success" | "awards";
  count?: number;
  rating?: number;
  className?: string;
}

export function SocialProofBadge({ type, count, rating, className = "" }: SocialProofBadgeProps) {
  const { t } = useTranslation();

  const badges = {
    clients: {
      icon: Users,
      label: t('social.proof.clients'),
      value: count ? `${count.toLocaleString()}+` : "500+",
      color: "text-blue-600 dark:text-blue-400"
    },
    rating: {
      icon: Star,
      label: t('social.proof.rating'),
      value: rating ? `${rating}/5` : "5.0/5",
      color: "text-yellow-600 dark:text-yellow-400"
    },
    success: {
      icon: CheckCircle,
      label: t('social.proof.success'),
      value: "98%",
      color: "text-green-600 dark:text-green-400"
    },
    awards: {
      icon: Award,
      label: t('social.proof.awards'),
      value: count ? String(count) : "12",
      color: "text-purple-600 dark:text-purple-400"
    }
  };

  const badge = badges[type];
  const Icon = badge.icon;

  return (
    <div 
      className={`inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full ${className}`}
      data-social-proof={type}
      itemScope
      itemType="https://schema.org/AggregateRating"
    >
      <Icon className={`h-5 w-5 ${badge.color}`} aria-hidden="true" />
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg font-bold text-foreground" itemProp="ratingValue">
          {badge.value}
        </span>
        <span className="text-sm text-muted-foreground">
          {badge.label}
        </span>
      </div>
      <meta itemProp="bestRating" content="5" />
      <meta itemProp="ratingCount" content={String(count || 200)} />
    </div>
  );
}
