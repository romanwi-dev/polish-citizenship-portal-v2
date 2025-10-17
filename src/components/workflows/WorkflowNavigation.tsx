import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Languages, Archive, Award, FileCheck, Plane, Sparkles } from 'lucide-react';

const WORKFLOWS = [
  {
    id: 'translations',
    label: 'Translations',
    icon: Languages,
    path: '/admin/translations'
  },
  {
    id: 'archives',
    label: 'Archives Search',
    icon: Archive,
    path: '/admin/archives-search'
  },
  {
    id: 'citizenship',
    label: 'Polish Citizenship',
    icon: Award,
    path: '/admin/citizenship'
  },
  {
    id: 'civil-acts',
    label: 'Polish Civil Acts',
    icon: FileCheck,
    path: '/admin/civil-acts'
  },
  {
    id: 'passport',
    label: 'Polish Passport',
    icon: Plane,
    path: '/admin/passport'
  },
  {
    id: 'extended-services',
    label: 'Extended Services',
    icon: Sparkles,
    path: '/admin/extended-services'
  }
];

export const WorkflowNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-full overflow-x-auto scrollbar-hide mb-6">
      <div className="flex gap-1 w-full justify-between">
        {WORKFLOWS.map((workflow) => {
          const isActive = location.pathname === workflow.path;
          
          return (
            <Button
              key={workflow.id}
              onClick={() => navigate(workflow.path)}
              className="flex-1 h-14 bg-green-500/20 text-white font-bold text-lg border-2 border-green-500/30 hover:bg-green-500/30 hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all"
            >
              <span>{workflow.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
