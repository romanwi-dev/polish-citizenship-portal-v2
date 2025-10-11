import { FlippableCardsDarkGlow } from "@/components/docs/FlippableCardsDarkGlow";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface DocumentItem {
  id: string;
  label: string;
  checked: boolean;
  importance?: 'critical' | 'high' | 'medium' | 'low';
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface FamilyMemberDocumentsSectionProps {
  prefix: string;
  title: string;
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  personType: 'applicant' | 'spouse' | 'parent' | 'grandparent' | 'child';
}

export const FamilyMemberDocumentsSection = ({
  prefix,
  title,
  formData,
  handleInputChange,
  personType,
}: FamilyMemberDocumentsSectionProps) => {
  
  const getDocumentsForPersonType = (): DocumentItem[] => {
    const baseDocuments: DocumentItem[] = [];

    if (personType === 'applicant' || personType === 'spouse') {
      // Full document set for applicant/spouse
      return [
        {
          id: `${prefix}_has_polish_documents`,
          label: 'Polish Documents',
          checked: formData?.[`${prefix}_has_polish_documents`] || false,
          importance: 'high' as const,
          difficulty: 'hard' as const,
        },
        {
          id: `${prefix}_has_passport`,
          label: 'Passport Copy',
          checked: formData?.[`${prefix}_has_passport`] || false,
          importance: 'critical' as const,
          difficulty: 'easy' as const,
        },
        {
          id: `${prefix}_has_birth_cert`,
          label: 'Birth Certificate',
          checked: formData?.[`${prefix}_has_birth_cert`] || false,
          importance: 'critical' as const,
          difficulty: 'medium' as const,
        },
        {
          id: `${prefix}_has_marriage_cert`,
          label: 'Marriage Certificate',
          checked: formData?.[`${prefix}_has_marriage_cert`] || false,
          importance: 'high' as const,
          difficulty: 'medium' as const,
        },
        {
          id: `${prefix}_has_naturalization`,
          label: 'Naturalization Certificate',
          checked: formData?.[`${prefix}_has_naturalization`] || false,
          importance: 'critical' as const,
          difficulty: 'hard' as const,
        },
        {
          id: `${prefix}_has_military_record`,
          label: 'Military Service Record',
          checked: formData?.[`${prefix}_has_military_record`] || false,
          importance: 'medium' as const,
          difficulty: 'hard' as const,
        },
        {
          id: `${prefix}_has_foreign_docs`,
          label: 'Foreign Documents',
          checked: formData?.[`${prefix}_has_foreign_docs`] || false,
          importance: 'medium' as const,
          difficulty: 'medium' as const,
        },
        {
          id: `${prefix}_has_additional_docs`,
          label: 'Additional Documents',
          checked: formData?.[`${prefix}_has_additional_docs`] || false,
          importance: 'low' as const,
          difficulty: 'easy' as const,
        },
      ];
    }

    if (personType === 'parent' || personType === 'grandparent') {
      // Simplified set for parents/grandparents
      return [
        {
          id: `${prefix}_has_birth_cert`,
          label: 'Birth Certificate',
          checked: formData?.[`${prefix}_has_birth_cert`] || false,
          importance: 'critical' as const,
          difficulty: 'medium' as const,
        },
        {
          id: `${prefix}_has_marriage_cert`,
          label: 'Marriage Certificate',
          checked: formData?.[`${prefix}_has_marriage_cert`] || false,
          importance: 'high' as const,
          difficulty: 'medium' as const,
        },
        {
          id: `${prefix}_has_passport`,
          label: 'Passport Copy',
          checked: formData?.[`${prefix}_has_passport`] || false,
          importance: 'medium' as const,
          difficulty: 'easy' as const,
        },
        {
          id: `${prefix}_has_naturalization`,
          label: 'Naturalization Certificate',
          checked: formData?.[`${prefix}_has_naturalization`] || false,
          importance: 'high' as const,
          difficulty: 'hard' as const,
        },
        {
          id: `${prefix}_has_military_record`,
          label: 'Military Service Record',
          checked: formData?.[`${prefix}_has_military_record`] || false,
          importance: 'medium' as const,
          difficulty: 'hard' as const,
        },
      ];
    }

    if (personType === 'child') {
      // Minimal set for children
      return [
        {
          id: `${prefix}_has_birth_cert`,
          label: 'Birth Certificate',
          checked: formData?.[`${prefix}_has_birth_cert`] || false,
          importance: 'critical' as const,
          difficulty: 'easy' as const,
        },
        {
          id: `${prefix}_has_passport`,
          label: 'Passport Copy',
          checked: formData?.[`${prefix}_has_passport`] || false,
          importance: 'high' as const,
          difficulty: 'easy' as const,
        },
      ];
    }

    return baseDocuments;
  };

  const documents = getDocumentsForPersonType();

  const handleDocumentsChange = (updatedDocuments: DocumentItem[]) => {
    updatedDocuments.forEach(doc => {
      handleInputChange(doc.id, doc.checked);
    });
  };

  return (
    <>
      <CardHeader className="border-b border-border/50 pb-6">
        <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 md:p-10">
        <FlippableCardsDarkGlow
          title=""
          documents={documents}
          onChange={handleDocumentsChange}
        />
      </CardContent>
    </>
  );
};
