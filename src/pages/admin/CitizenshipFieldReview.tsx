import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Save, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface FieldReview {
  field: string;
  currentlyMapped: boolean;
  status: 'keep' | 'delete' | 'conditional' | null;
  notes: string;
}

const FIELD_SECTIONS = {
  applicant: [
    { field: 'applicant_first_name', mapped: true },
    { field: 'applicant_last_name', mapped: true },
    { field: 'applicant_maiden_name', mapped: true },
    { field: 'applicant_sex', mapped: true },
    { field: 'applicant_dob', mapped: true },
    { field: 'applicant_pob', mapped: true },
    { field: 'applicant_current_citizenship', mapped: true },
    { field: 'applicant_passport_number', mapped: true },
    { field: 'applicant_passport_issuing_country', mapped: true },
    { field: 'applicant_passport_issue_date', mapped: true },
    { field: 'applicant_passport_expiry_date', mapped: true },
    { field: 'applicant_pesel', mapped: true },
    { field: 'applicant_address', mapped: true },
    { field: 'applicant_email', mapped: true },
    { field: 'applicant_phone', mapped: true },
    { field: 'previous_decision_info', mapped: true },
    { field: 'citizenship_change_permission', mapped: true },
    { field: 'polish_citizenship_deprivation', mapped: true },
  ],
  mother: [
    { field: 'mother_first_name', mapped: true },
    { field: 'mother_last_name', mapped: true },
    { field: 'mother_maiden_name', mapped: true },
    { field: 'mother_dob', mapped: true },
    { field: 'mother_pob', mapped: true },
    { field: 'mother_marital_status', mapped: true },
    { field: 'mother_pesel', mapped: true },
    { field: 'mother_previous_names', mapped: true },
  ],
  father: [
    { field: 'father_first_name', mapped: true },
    { field: 'father_last_name', mapped: true },
    { field: 'father_dob', mapped: true },
    { field: 'father_pob', mapped: true },
    { field: 'father_marital_status', mapped: true },
    { field: 'father_pesel', mapped: true },
    { field: 'father_previous_names', mapped: true },
  ],
  pgf: [
    { field: 'pgf_first_name', mapped: true },
    { field: 'pgf_last_name', mapped: true },
    { field: 'pgf_dob', mapped: true },
    { field: 'pgf_pob', mapped: true },
    { field: 'pgf_pesel', mapped: true },
    { field: 'pgf_citizenship_at_birth', mapped: true },
  ],
  pgm: [
    { field: 'pgm_first_name', mapped: true },
    { field: 'pgm_last_name', mapped: true },
    { field: 'pgm_maiden_name', mapped: true },
    { field: 'pgm_dob', mapped: true },
    { field: 'pgm_pob', mapped: true },
    { field: 'pgm_pesel', mapped: true },
  ],
  mgf: [
    { field: 'mgf_first_name', mapped: true },
    { field: 'mgf_last_name', mapped: true },
    { field: 'mgf_dob', mapped: true },
    { field: 'mgf_pob', mapped: true },
    { field: 'mgf_pesel', mapped: true },
    { field: 'mgf_citizenship_at_birth', mapped: true },
  ],
  mgm: [
    { field: 'mgm_first_name', mapped: true },
    { field: 'mgm_last_name', mapped: true },
    { field: 'mgm_maiden_name', mapped: true },
    { field: 'mgm_dob', mapped: true },
    { field: 'mgm_pob', mapped: true },
    { field: 'mgm_pesel', mapped: true },
  ],
  greatGrandparents: [
    { field: 'pggf_first_name', mapped: false },
    { field: 'pggf_last_name', mapped: false },
    { field: 'pggf_dob', mapped: false },
    { field: 'pggf_pob', mapped: false },
    { field: 'pggm_first_name', mapped: false },
    { field: 'pggm_last_name', mapped: false },
    { field: 'pggm_maiden_name', mapped: false },
    { field: 'pggm_dob', mapped: false },
    { field: 'pggm_pob', mapped: false },
    { field: 'mggf_first_name', mapped: false },
    { field: 'mggf_last_name', mapped: false },
    { field: 'mggf_dob', mapped: false },
    { field: 'mggf_pob', mapped: false },
    { field: 'mggm_first_name', mapped: false },
    { field: 'mggm_last_name', mapped: false },
    { field: 'mggm_maiden_name', mapped: false },
    { field: 'mggm_dob', mapped: false },
    { field: 'mggm_pob', mapped: false },
  ],
  attachments: [
    { field: 'attachment_1_included', mapped: true },
    { field: 'attachment_2_included', mapped: true },
    { field: 'attachment_3_included', mapped: true },
    { field: 'attachment_4_included', mapped: true },
    { field: 'attachment_5_included', mapped: true },
    { field: 'attachment_6_included', mapped: true },
    { field: 'attachment_7_included', mapped: true },
    { field: 'attachment_8_included', mapped: true },
    { field: 'attachment_9_included', mapped: true },
    { field: 'attachment_10_included', mapped: true },
    { field: 'polish_preliminary_docs_info', mapped: true },
    { field: 'important_additional_info', mapped: true },
    { field: 'sibling_decision_info', mapped: true },
  ],
};

const SECTION_LABELS: Record<string, string> = {
  applicant: 'Applicant (Pages 1-3)',
  mother: 'Mother (Page 5)',
  father: 'Father (Page 4)',
  pgf: 'Paternal Grandfather (Page 6)',
  pgm: 'Paternal Grandmother (Page 7)',
  mgf: 'Maternal Grandfather (Page 8)',
  mgm: 'Maternal Grandmother (Page 9)',
  greatGrandparents: 'Great-Grandparents (Page 10) - NOT MAPPED',
  attachments: 'Attachments & Info (Page 11)',
};

export default function CitizenshipFieldReview() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Record<string, FieldReview>>(() => {
    const initial: Record<string, FieldReview> = {};
    Object.entries(FIELD_SECTIONS).forEach(([_, fields]) => {
      fields.forEach(({ field, mapped }) => {
        initial[field] = {
          field,
          currentlyMapped: mapped,
          status: field.includes('pesel') ? 'delete' : null,
          notes: field.includes('pesel') ? 'NEVER NEEDED' : '',
        };
      });
    });
    return initial;
  });

  const updateStatus = (field: string, status: 'keep' | 'delete' | 'conditional' | null) => {
    setReviews(prev => ({
      ...prev,
      [field]: { ...prev[field], status },
    }));
  };

  const updateNotes = (field: string, notes: string) => {
    setReviews(prev => ({
      ...prev,
      [field]: { ...prev[field], notes },
    }));
  };

  const handleSave = () => {
    const toDelete = Object.values(reviews).filter(r => r.status === 'delete');
    const toKeep = Object.values(reviews).filter(r => r.status === 'keep');
    const conditional = Object.values(reviews).filter(r => r.status === 'conditional');
    
    console.log('CITIZENSHIP FIELD REVIEW RESULTS:', {
      delete: toDelete.map(r => r.field),
      keep: toKeep.map(r => r.field),
      conditional: conditional.map(r => ({ field: r.field, notes: r.notes })),
      fullReview: reviews,
    });

    toast.success('Field review saved to console. Ready to implement changes.');
  };

  const getStats = () => {
    const total = Object.keys(reviews).length;
    const keep = Object.values(reviews).filter(r => r.status === 'keep').length;
    const deleteCount = Object.values(reviews).filter(r => r.status === 'delete').length;
    const conditional = Object.values(reviews).filter(r => r.status === 'conditional').length;
    const undecided = total - keep - deleteCount - conditional;
    return { total, keep, delete: deleteCount, conditional, undecided };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Citizenship Field Review</h1>
              <p className="text-muted-foreground">Mark which fields to keep, delete, or make conditional</p>
            </div>
          </div>
          <Button onClick={handleSave} size="lg">
            <Save className="h-4 w-4 mr-2" />
            Save Review
          </Button>
        </div>

        {/* Stats */}
        <Card className="p-6">
          <div className="grid grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Fields</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div>
              <p className="text-sm text-green-600">Keep</p>
              <p className="text-2xl font-bold text-green-600">{stats.keep}</p>
            </div>
            <div>
              <p className="text-sm text-red-600">Delete</p>
              <p className="text-2xl font-bold text-red-600">{stats.delete}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Conditional</p>
              <p className="text-2xl font-bold text-blue-600">{stats.conditional}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Undecided</p>
              <p className="text-2xl font-bold">{stats.undecided}</p>
            </div>
          </div>
        </Card>

        {/* Legend */}
        <Card className="p-4">
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-600">Keep</Badge>
              <span>Always needed in practice</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">Delete</Badge>
              <span>Never needed, omit forever</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-600">Conditional</Badge>
              <span>Only if Polish ancestor on this line</span>
            </div>
          </div>
        </Card>

        {/* Field Sections */}
        {Object.entries(FIELD_SECTIONS).map(([sectionKey, fields]) => (
          <Card key={sectionKey} className="p-6">
            <h2 className="text-xl font-bold mb-4">{SECTION_LABELS[sectionKey]}</h2>
            <div className="space-y-3">
              {fields.map(({ field, mapped }) => {
                const review = reviews[field];
                return (
                  <div key={field} className="flex items-center gap-4 p-3 rounded-lg border bg-card/50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono">{field}</code>
                        {!mapped && (
                          <Badge variant="outline" className="text-xs">NOT MAPPED</Badge>
                        )}
                      </div>
                    </div>

                    {/* Status Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={review.status === 'keep' ? 'default' : 'outline'}
                        className={review.status === 'keep' ? 'bg-green-600 hover:bg-green-700' : ''}
                        onClick={() => updateStatus(field, review.status === 'keep' ? null : 'keep')}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Keep
                      </Button>
                      <Button
                        size="sm"
                        variant={review.status === 'delete' ? 'destructive' : 'outline'}
                        onClick={() => updateStatus(field, review.status === 'delete' ? null : 'delete')}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                      <Button
                        size="sm"
                        variant={review.status === 'conditional' ? 'secondary' : 'outline'}
                        className={review.status === 'conditional' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                        onClick={() => updateStatus(field, review.status === 'conditional' ? null : 'conditional')}
                      >
                        Conditional
                      </Button>
                    </div>

                    {/* Notes Input */}
                    <Input
                      placeholder="Notes..."
                      value={review.notes}
                      onChange={(e) => updateNotes(field, e.target.value)}
                      className="w-64"
                    />
                  </div>
                );
              })}
            </div>
          </Card>
        ))}

        {/* Bottom Save */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            <Save className="h-4 w-4 mr-2" />
            Save Review to Console
          </Button>
        </div>
      </div>
    </div>
  );
}
