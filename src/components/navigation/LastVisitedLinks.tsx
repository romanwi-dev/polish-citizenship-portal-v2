import { Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLastVisited, getTimeAgo } from '@/hooks/useLastVisited';

interface LastVisitedLinksProps {
  onNavigate: () => void;
}

export const LastVisitedLinks = ({ onNavigate }: LastVisitedLinksProps) => {
  const visited = useLastVisited();

  if (visited.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <Clock className="h-3 w-3" />
        Last Visited
      </div>
      <div className="space-y-1 px-2">
        {visited.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors group"
          >
            <span className="text-sm font-medium capitalize group-hover:text-primary transition-colors">
              {item.title}
            </span>
            <span className="text-xs text-muted-foreground">
              {getTimeAgo(item.timestamp)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
