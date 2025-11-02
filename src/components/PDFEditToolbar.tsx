import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, X, Edit2 } from 'lucide-react';
import { useState } from 'react';

interface PDFField {
  name: string;
  value: string;
  type: string;
}

interface PDFEditToolbarProps {
  selectedField: PDFField | null;
  onSave: (fieldName: string, value: string) => void;
  onCancel: () => void;
}

/**
 * Phase 2.1: In-Browser PDF Editing (Toolbar Component)
 * Allows editing PDF fields directly in the preview
 */
export function PDFEditToolbar({
  selectedField,
  onSave,
  onCancel,
}: PDFEditToolbarProps) {
  const [editValue, setEditValue] = useState(selectedField?.value || '');

  if (!selectedField) {
    return (
      <div className="border-t bg-muted/30 p-4 text-center text-sm text-muted-foreground">
        <Edit2 className="h-4 w-4 inline mr-2" />
        Click any field in the PDF to edit it
      </div>
    );
  }

  const handleSave = () => {
    onSave(selectedField.name, editValue);
    onCancel();
  };

  return (
    <div className="border-t bg-background p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          Editing: {selectedField.name.replace(/_/g, ' ')}
        </Label>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex gap-2">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder="Enter value"
          className="flex-1"
        />
        <Button onClick={handleSave} size="sm" className="gap-2">
          <Save className="h-4 w-4" />
          Save
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Changes will be saved to both the PDF and your form data
      </p>
    </div>
  );
}
