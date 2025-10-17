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
      <div className="inline-flex w-max gap-1">
        {WORKFLOWS.map((workflow) => {
          const isActive = location.pathname === workflow.path;
          
          return (
            <Button
              key={workflow.id}
              variant={isActive ? "default" : "outline"}
              onClick={() => navigate(workflow.path)}
              className="px-8 py-3 text-base whitespace-nowrap h-14 font-medium w-[200px] rounded-none first:rounded-l-lg last:rounded-r-lg bg-green-500/10 hover:bg-green-500/20 border-green-500/30"
            >
              <span>{workflow.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
