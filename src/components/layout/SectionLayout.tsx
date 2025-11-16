import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionLayoutProps {
  id?: string;
  badge?: {
    icon: LucideIcon;
    text: string;
  };
  title: string;
  subtitle?: string | ReactNode;
  children: ReactNode;
  cta?: ReactNode;
  className?: string;
}

/**
 * Unified section layout for homepage sections
 * Provides consistent spacing and structure for:
 * - Badge (optional)
 * - Title
 * - Subtitle (optional)
 * - Content (cards, etc.)
 * - CTA (optional)
 */
export const SectionLayout = ({
  id,
  badge,
  title,
  subtitle,
  children,
  cta,
  className = ''
}: SectionLayoutProps) => {
  const BadgeIcon = badge?.icon;

  return (
    <section id={id} className={`relative py-24 overflow-hidden overflow-x-hidden ${className}`}>
      <div className="container relative z-10 px-4 mx-auto">
        {/* Header: Badge + Title + Subtitle */}
        <div className="max-w-4xl mx-auto text-center mb-20 animate-fade-in pt-12 space-y-20">
          {/* Badge */}
          {badge && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-primary/30">
              {BadgeIcon && <BadgeIcon className="w-4 h-4 text-primary" />}
              <span className="text-sm font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {badge.text}
              </span>
            </div>
          )}
          
          {/* Title */}
          <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight animate-scale-in">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {title}
            </span>
          </h2>
          
          {/* Subtitle */}
          {subtitle && (
            <div className="max-w-3xl mx-auto">
              {typeof subtitle === 'string' ? (
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-body font-light tracking-normal">
                  {subtitle}
                </p>
              ) : (
                subtitle
              )}
            </div>
          )}
        </div>

        {/* Content (Cards, etc.) */}
        <div className="mb-12 mt-24">
          {children}
        </div>

        {/* CTA */}
        {cta && (
          <div className="flex justify-center mt-12">
            {cta}
          </div>
        )}
      </div>
    </section>
  );
};
