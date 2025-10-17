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
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-foreground/70 z-10" />
        <Input
          type="text"
          placeholder=""
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="!h-11 pl-10 text-sm bg-background border-border focus:border-primary"
        />
      </div>
    </div>
  );
};
