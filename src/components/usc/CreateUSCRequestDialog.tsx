import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface CreateUSCRequestDialogProps {
  caseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUSCRequestDialog({ caseId, open, onOpenChange }: CreateUSCRequestDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    request_type: 'umiejscowienie',
    person_type: 'AP',
    document_type: 'birth',
    registry_office: '',
    registry_city: '',
    registry_voivodeship: '',
    notes: '',
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('usc_requests').insert({
        case_id: caseId,
        ...formData,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usc-requests', caseId] });
      toast.success('USC request created successfully');
      onOpenChange(false);
      setFormData({
        request_type: 'umiejscowienie',
        person_type: 'AP',
        document_type: 'birth',
        registry_office: '',
        registry_city: '',
        registry_voivodeship: '',
        notes: '',
      });
    },
    onError: (error) => {
      toast.error('Failed to create USC request');
      console.error(error);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create USC Request</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Request Type</Label>
              <Select
                value={formData.request_type}
                onValueChange={(value) => setFormData({ ...formData, request_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="umiejscowienie">Umiejscowienie (Registration)</SelectItem>
                  <SelectItem value="uzupelnienie">Uzupełnienie (Completion)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Person</Label>
              <Select
                value={formData.person_type}
                onValueChange={(value) => setFormData({ ...formData, person_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AP">Applicant</SelectItem>
                  <SelectItem value="SPOUSE">Spouse</SelectItem>
                  <SelectItem value="F">Father</SelectItem>
                  <SelectItem value="M">Mother</SelectItem>
                  <SelectItem value="PGF">Paternal Grandfather</SelectItem>
                  <SelectItem value="PGM">Paternal Grandmother</SelectItem>
                  <SelectItem value="MGF">Maternal Grandfather</SelectItem>
                  <SelectItem value="MGM">Maternal Grandmother</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Document Type</Label>
            <Select
              value={formData.document_type}
              onValueChange={(value) => setFormData({ ...formData, document_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="birth">Birth Certificate</SelectItem>
                <SelectItem value="marriage">Marriage Certificate</SelectItem>
                <SelectItem value="death">Death Certificate</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Registry Office</Label>
              <Input
                value={formData.registry_office}
                onChange={(e) => setFormData({ ...formData, registry_office: e.target.value })}
                placeholder="USC Office name"
              />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={formData.registry_city}
                onChange={(e) => setFormData({ ...formData, registry_city: e.target.value })}
                placeholder="City"
              />
            </div>
            <div className="space-y-2">
              <Label>Voivodeship</Label>
              <Input
                value={formData.registry_voivodeship}
                onChange={(e) => setFormData({ ...formData, registry_voivodeship: e.target.value })}
                placeholder="Voivodeship"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional details..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
              Create Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
