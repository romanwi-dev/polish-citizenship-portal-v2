import { Link } from 'react-router-dom';
import { Bot, GitBranch, ClipboardList, Users } from 'lucide-react';

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
    title: 'Featured',
    links: [
      { label: 'Intake Demo', href: '/admin/intake-demo', featured: true },
    ]
  },
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
      { label: 'Law', href: '#law' },
      { label: 'Passport', href: '#passport' },
      { label: 'Resources', href: '#resources' },
      { label: 'Paperwork', href: '#paperwork' },
      { label: 'Documents', href: '#documents' },
      { label: 'Testimonials', href: '#testimonials' },
    ]
  },
  {
    title: 'Admin Tools',
    links: [
      { label: 'AI Agent', href: '/admin/ai-agent', icon: Bot },
      { label: 'Family Tree', href: '/admin/family-tree', icon: GitBranch },
      { label: 'Client Intake', href: '/admin/intake', icon: ClipboardList },
      { label: 'Management', href: '/admin/cases', icon: Users },
    ]
  }
];

export const NavigationLinks = ({ onNavigate, searchQuery }: NavigationLinksProps) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      onNavigate();
    }
  };

  const handleClick = (href: string) => {
    if (href.startsWith('#')) {
      scrollToSection(href.substring(1));
    } else {
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
                    key={link.href}
                    to={link.href}
                    onClick={() => handleClick(link.href)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                      isFeatured
                        ? 'bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 hover:from-primary/30 hover:via-accent/30 hover:to-primary/30 border border-primary/30'
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    {Icon && <Icon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />}
                    <span className={`font-medium ${isFeatured ? 'text-primary font-semibold' : 'group-hover:text-primary'} transition-colors`}>
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
