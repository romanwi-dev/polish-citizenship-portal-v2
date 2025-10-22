import { Link, useNavigate } from 'react-router-dom';
import { Bot, GitBranch, ClipboardList, Users, Archive, Languages, Award, FileCheck, Plane, BookOpen, Shield, Search, PenTool, Sun, Sparkles } from 'lucide-react';

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

const NAVIGATION_SECTIONS: Array<{
  title: string;
  links: NavLink[];
}> = [
  {
    title: 'Main',
    links: [
      { label: 'FAQ', href: '#faq' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Contact', href: '#contact' },
      { label: 'Timeline', href: '#timeline' },
      { label: 'Services', href: '#services' },
    ]
  },
  {
    title: 'Resources',
    links: [
      { label: 'Law', href: '#faq' },
      { label: 'Passport', href: '#services' },
      { label: 'Process', href: '#timeline' },
      { label: 'Documents', href: '#timeline' },
      { label: 'Testimonials', href: '#testimonials' },
    ]
  },
  {
    title: 'Workflows',
    links: [
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
      { label: 'Family Tree', href: '/admin/cases', icon: GitBranch },
      { label: 'Client Intake', href: '/admin/intake-demo', icon: ClipboardList },
      { label: 'Management', href: '/admin/cases', icon: Users },
      { label: 'System Overview', href: '/admin/system-overview', icon: BookOpen },
    ]
  },
  {
    title: 'Demos',
    links: [
      { label: 'Light Theme Preview', href: '/demo/light-theme', icon: Sun },
      { label: 'Forms Demo', href: '/admin/forms-demo', icon: Sparkles },
      { label: 'Client Intake Demo', href: '/admin/intake-demo', icon: ClipboardList },
    ]
  }
];

export const NavigationLinks = ({ onNavigate, searchQuery }: NavigationLinksProps) => {
  const navigate = useNavigate();
  
  const handleClick = (e: React.MouseEvent, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      
      const sectionId = href.substring(1);
      
      if (window.location.pathname !== '/') {
        // Navigate to homepage with hash
        navigate('/' + href);
        onNavigate(); // Close menu immediately for page navigation
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
            console.warn(`Could not find element with id: ${sectionId}`);
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
                
                return (
                  <Link
                    key={`${link.href}-${link.label}`}
                    to={link.href}
                    onClick={(e) => handleClick(e, link.href)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
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
