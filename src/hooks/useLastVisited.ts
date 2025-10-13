import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface VisitedRoute {
  path: string;
  title: string;
  timestamp: number;
}

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Home',
  '/admin/intake-demo': 'Intake Demo',
  '/admin/cases': 'Management',
  '/admin/ai-agent': 'AI Agent',
  '/admin/family-tree': 'Family Tree',
  '/admin/intake': 'Client Intake',
  '/login': 'Login',
  '/client-login': 'Client Portal',
};

export const useLastVisited = () => {
  const [visited, setVisited] = useState<VisitedRoute[]>([]);
  const location = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem('lastVisited');
    if (stored) {
      setVisited(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    const currentPath = location.pathname;
    const title = ROUTE_TITLES[currentPath] || currentPath.split('/').pop()?.replace(/-/g, ' ') || 'Page';
    
    setVisited(prev => {
      const filtered = prev.filter(v => v.path !== currentPath);
      const updated = [
        { path: currentPath, title, timestamp: Date.now() },
        ...filtered
      ].slice(0, 5);
      
      localStorage.setItem('lastVisited', JSON.stringify(updated));
      return updated;
    });
  }, [location.pathname]);

  return visited.filter(v => v.path !== location.pathname);
};

export const getTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};
