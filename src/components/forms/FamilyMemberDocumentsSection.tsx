import { FlippableCardsDarkGlow } from "@/components/docs/FlippableCardsDarkGlow";
import { motion } from "framer-motion";

interface DocumentItem {
  id: string;
  label: string;
  checked: boolean;
  importance?: 'critical' | 'high' | 'medium' | 'low';
  difficulty?: 'easy' | 'medium' | 'hard';
  notes?: string;
}

interface FamilyMemberDocumentsSectionProps {
  prefix: string;
  title: string;
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  personType: 'applicant' | 'spouse' | 'parent' | 'grandparent' | 'child';
  sex?: string;
  dropboxPath?: string;
  colorScheme?: 'children' | 'applicant' | 'spouse' | 'parents' | 'grandparents' | 'ggp';
}

export const FamilyMemberDocumentsSection = ({
  prefix,
  title,
  formData,
  handleInputChange,
  personType,
  sex,
  dropboxPath,
  colorScheme = 'applicant',
}: FamilyMemberDocumentsSectionProps) => {
  
  const shouldShowMilitary = (): boolean => {
    // Check explicit sex prop first
    if (sex) return sex === 'M';
    
    // Check formData for sex field
    const sexField = `${prefix}_sex`;
    if (formData?.[sexField]) return formData[sexField] === 'M';
    
    // For specific known roles
    if (prefix === 'father' || prefix === 'pgf' || prefix === 'mgf') return true;
    if (prefix === 'mother' || prefix === 'pgm' || prefix === 'mgm') return false;
    
    // Default: show it (can be manually unchecked)
    return true;
  };

  const getChildDocuments = (): DocumentItem[] => [
    {
      id: `${prefix}_has_poa`,
      label: 'Power of Attorney',
      checked: formData?.[`${prefix}_has_poa`] || false,
      importance: 'critical' as const,
      difficulty: 'easy' as const,
      notes: formData?.[`${prefix}_poa_notes`] || '',
    },
    {
      id: `${prefix}_has_passport`,
      label: 'Passport Copy',
      checked: formData?.[`${prefix}_has_passport`] || false,
      importance: 'critical' as const,
      difficulty: 'easy' as const,
      notes: formData?.[`${prefix}_passport_notes`] || '',
    },
    {
      id: `${prefix}_has_birth_cert`,
      label: 'Birth Certificate',
      checked: formData?.[`${prefix}_has_birth_cert`] || false,
      importance: 'critical' as const,
      difficulty: 'medium' as const,
      notes: formData?.[`${prefix}_birth_cert_notes`] || '',
    },
    {
      id: `${prefix}_has_additional_docs`,
      label: 'Additional Documents',
      checked: formData?.[`${prefix}_has_additional_docs`] || false,
      importance: 'low' as const,
      difficulty: 'easy' as const,
      notes: formData?.[`${prefix}_additional_docs_notes`] || '',
    },
  ];

  const getDocumentsForPersonType = (): DocumentItem[] => {
    // Universal document list - same for all family members
    const allDocuments: DocumentItem[] = [
      {
        id: `${prefix}_has_polish_documents`,
        label: 'Polish Documents',
        checked: formData?.[`${prefix}_has_polish_documents`] || false,
        importance: 'high' as const,
        difficulty: 'hard' as const,
        notes: formData?.[`${prefix}_polish_documents_notes`] || '',
      },
      {
        id: `${prefix}_has_passport`,
        label: 'Passport Copy',
        checked: formData?.[`${prefix}_has_passport`] || false,
        importance: 'critical' as const,
        difficulty: 'easy' as const,
        notes: formData?.[`${prefix}_passport_notes`] || '',
      },
      {
        id: `${prefix}_has_birth_cert`,
        label: 'Birth Certificate',
        checked: formData?.[`${prefix}_has_birth_cert`] || false,
        importance: 'critical' as const,
        difficulty: 'medium' as const,
        notes: formData?.[`${prefix}_birth_cert_notes`] || '',
      },
      {
        id: `${prefix}_has_marriage_cert`,
        label: 'Marriage Certificate',
        checked: formData?.[`${prefix}_has_marriage_cert`] || false,
        importance: 'high' as const,
        difficulty: 'medium' as const,
        notes: formData?.[`${prefix}_marriage_cert_notes`] || '',
      },
      {
        id: `${prefix}_has_naturalization`,
        label: 'Naturalization Certificate',
        checked: formData?.[`${prefix}_has_naturalization`] || false,
        importance: 'critical' as const,
        difficulty: 'hard' as const,
        notes: formData?.[`${prefix}_naturalization_notes`] || '',
      },
      {
        id: `${prefix}_has_foreign_docs`,
        label: 'Foreign Documents',
        checked: formData?.[`${prefix}_has_foreign_docs`] || false,
        importance: 'medium' as const,
        difficulty: 'medium' as const,
        notes: formData?.[`${prefix}_foreign_docs_notes`] || '',
      },
      {
        id: `${prefix}_has_additional_docs`,
        label: 'Additional Documents',
        checked: formData?.[`${prefix}_has_additional_docs`] || false,
        importance: 'low' as const,
        difficulty: 'easy' as const,
        notes: formData?.[`${prefix}_additional_docs_notes`] || '',
      },
    ];

    // Add Military Service Record only for males
    if (shouldShowMilitary()) {
      allDocuments.splice(5, 0, {
        id: `${prefix}_has_military_record`,
        label: 'Military Service Record',
        checked: formData?.[`${prefix}_has_military_record`] || false,
        importance: 'medium' as const,
        difficulty: 'hard' as const,
        notes: formData?.[`${prefix}_military_record_notes`] || '',
      });
    }

    return allDocuments;
  };

  const documents = personType === 'child' ? getChildDocuments() : getDocumentsForPersonType();

  const handleDocumentsChange = (updatedDocuments: DocumentItem[]) => {
    updatedDocuments.forEach(doc => {
      handleInputChange(doc.id, doc.checked);
    });
  };

  const handleNotesChange = (docId: string, notes: string) => {
    // Convert checkbox field name to notes field name
    // e.g., "applicant_has_passport" -> "applicant_passport_notes"
    const notesFieldName = docId.replace('_has_', '_').replace(/^(.+)_(.+)$/, '$1_$2_notes');
    handleInputChange(notesFieldName, notes);
  };

  return (
    <>
      <h3 className="text-2xl md:text-3xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mt-6 mb-4">
        {title}
      </h3>
      <FlippableCardsDarkGlow
        title=""
        documents={documents}
        onChange={handleDocumentsChange}
        onNotesChange={handleNotesChange}
        dropboxPath={dropboxPath}
        colorScheme={colorScheme}
      />
    </>
  );
};
