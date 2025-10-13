import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface NavigationSearchProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const NavigationSearch = ({ value, onChange, className }: NavigationSearchProps) => {
  return (
    <div className={className}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-10" />
        <Input
          type="text"
          placeholder="Search services, pages..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 h-10 text-sm bg-background/50 border-border/10 focus:border-primary placeholder:opacity-10"
        />
      </div>
    </div>
  );
};
