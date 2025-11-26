import { Link, useNavigate } from 'react-router-dom';
import { Bot, GitBranch, ClipboardList, Users, Archive, Languages, Award, FileCheck, Plane, BookOpen, Shield, Search, PenTool, Sun, Sparkles, FileText, Brain, FileCode, RefreshCw, PartyPopper, MessageSquare, Palette, Layout, Globe, Type, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface NavigationLinksProps {
  onNavigate: () => void;
  searchQuery: string;
}

type NavLink = {
  label: string;
  href: string;
  icon?: typeof Bot;
  featured?: boolean;
};

export const NavigationLinks = ({ onNavigate, searchQuery }: NavigationLinksProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const NAVIGATION_SECTIONS: Array<{
    title: string;
    links: NavLink[];
  }> = [
    {
      title: 'Main',
      links: [
        { label: t('nav.faq'), href: '#faq' },
        { label: t('nav.pricing'), href: '#pricing' },
        { label: t('nav.contact'), href: '#contact' },
        { label: t('nav.timeline'), href: '#timeline' },
        { label: t('nav.services'), href: '#services' },
        { label: 'Process', href: '#how-to-start' },
      ]
    },
    {
      title: 'Resources',
      links: [
        { label: 'Law', href: '#faq' },
        { label: 'Passport', href: '#services' },
        { label: 'Documents', href: '#timeline' },
        { label: t('nav.testimonials'), href: '#testimonials' },
      ]
    },
  {
    title: 'Workflows',
    links: [
      { label: 'AI Workflow', href: '/admin/ai-workflow', icon: Brain },
      { label: 'Archives Search', href: '/admin/archives-search', icon: Archive },
      { label: 'Translations', href: '/admin/translations', icon: Languages },
      { label: 'Polish Citizenship', href: '/admin/citizenship', icon: Award },
      { label: 'Polish Civil Acts', href: '/admin/civil-acts', icon: FileCheck },
      { label: 'Polish Passport', href: '/admin/passport', icon: Plane },
    ]
  },
  {
    title: 'Admin Tools',
    links: [
      { label: 'AI Agent', href: '/admin/ai-agent-diagnostics', icon: Bot },
      { label: 'Code Review', href: '/admin/code-review', icon: FileCode },
      { label: 'Dropbox Resync', href: '/cases', icon: RefreshCw },
      { label: 'Family Tree', href: '/admin/cases', icon: GitBranch },
      { label: 'Client Intake', href: '/admin/intake-demo', icon: ClipboardList },
      { label: 'Management', href: '/admin/cases', icon: Users },
      { label: 'System Overview', href: '/admin/system-overview', icon: BookOpen },
    ]
  },
  {
    title: 'Demos',
    links: [
      { label: 'Demos Hub', href: '/demos', icon: Globe, featured: true },
      { label: 'Main CTA Reference', href: '/demos/main-cta-reference', icon: Target, featured: true },
      { label: 'Font & Content Styles', href: '/font-styles-demo', icon: Type },
      { label: 'Multi-Step Form', href: '/multi-step-demo', icon: FileText },
      { label: 'Design Showcase', href: '/design-showcase', icon: Palette },
      { label: 'Warsaw Gallery', href: '/warsaw-demo', icon: Sun },
      { label: 'EU Celebration', href: '/eu-celebration-demo', icon: PartyPopper },
      { label: 'Contact Forms', href: '/contact-forms-demo', icon: MessageSquare },
      { label: 'Forms Demo', href: '/admin/forms-demo', icon: Sparkles },
      { label: 'Editing Demos', href: '/admin/intake-demo', icon: ClipboardList },
      { label: 'Skyline Background Removal', href: '/admin/skyline-bg-removal', icon: PenTool },
    ]
  }
  ];
  
  const handleClick = (e: React.MouseEvent, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      
      const sectionId = href.substring(1);
      
      // Always navigate to homepage first if not already there
      const isOnHomepage = ['/', '/en', '/es', '/pt', '/de', '/fr', '/he', '/ru', '/uk'].includes(window.location.pathname);
      if (!isOnHomepage) {
        navigate('/' + href);
        onNavigate();
      } else {
        // We're on homepage - scroll with retry logic
        let attempts = 0;
        const maxAttempts = 30; // 3 seconds max (30 * 100ms)
        
        const scrollToElement = () => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            onNavigate(); // Close menu AFTER successful scroll
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(scrollToElement, 100);
          } else {
            // Failed to find element after max attempts
            onNavigate(); // Close menu anyway
          }
        };
        
        scrollToElement();
      }
    } else {
      // Regular navigation
      navigate(href);
      onNavigate();
    }
  };

  const filteredSections = NAVIGATION_SECTIONS.map(section => ({
    ...section,
    links: section.links.filter(link =>
      link.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.links.length > 0);

  return (
    <div className="space-y-6">
      {filteredSections.map((section, idx) => (
        <div key={section.title}>
          {idx > 0 && <div className="h-px bg-border/50 my-4" />}
          <div className="space-y-1">
            {section.title !== 'Featured' && (
              <div className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {section.title}
              </div>
            )}
            <div className="space-y-1 px-2">
              {section.links.map((link) => {
                const Icon = link.icon;
                const isFeatured = link.featured;
                const { href } = link;
                
                return href.startsWith('#') ? (
                  <button
                    key={`${href}-${link.label}`}
                    onClick={(e) => {
                      handleClick(e, href);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-left cursor-pointer"
                  >
                    {Icon && <Icon className="h-4 w-4 text-primary" />}
                    <span className="font-medium">
                      {link.label}
                    </span>
                  </button>
                ) : (
                  <Link
                    key={`${href}-${link.label}`}
                    to={href}
                    onClick={() => {
                      onNavigate();
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                  >
                    {Icon && <Icon className="h-4 w-4 text-primary" />}
                    <span className="font-medium">
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
