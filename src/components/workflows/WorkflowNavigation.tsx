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
      <div className="flex gap-2 w-full">
        {WORKFLOWS.map((workflow) => {
          const isActive = location.pathname === workflow.path;
          
          return (
            <Button
              key={workflow.id}
              variant={isActive ? "default" : "outline"}
              onClick={() => navigate(workflow.path)}
              className="flex-1 px-4 py-3 text-base whitespace-nowrap h-12 font-medium rounded-sm"
            >
              <span>{workflow.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
