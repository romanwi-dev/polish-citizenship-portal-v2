import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CaseCard } from './CaseCard';
import { CaseData } from '@/hooks/useCases';
import { GripVertical } from 'lucide-react';

interface DraggableCaseCardProps {
  clientCase: CaseData;
  onEdit: (caseItem: any) => void;
  onDelete: (caseId: string) => void;
  onUpdateStatus: (caseId: string, status: string) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isSelected: boolean;
  onToggleSelection: () => void;
}

export const DraggableCaseCard = ({
  clientCase,
  ...props
}: DraggableCaseCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: clientCase.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-2 z-10 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm rounded p-1"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <CaseCard clientCase={clientCase} {...props} />
    </div>
  );
};
