import { useState, useEffect } from 'react';

export type NavigationDesign = 
  | 'glassmorphic'
  | 'cyberpunk'
  | 'minimal'
  | 'neumorphic'
  | 'material'
  | 'brutalist'
  | 'gradient'
  | 'retro'
  | 'luxury'
  | 'particle';

export const useNavigationDesign = () => {
  const [design, setDesign] = useState<NavigationDesign>('glassmorphic');

  useEffect(() => {
    const stored = localStorage.getItem('navDesign') as NavigationDesign;
    if (stored) {
      setDesign(stored);
    }
  }, []);

  const changeDesign = (newDesign: NavigationDesign) => {
    setDesign(newDesign);
    localStorage.setItem('navDesign', newDesign);
  };

  return { design, changeDesign };
};
