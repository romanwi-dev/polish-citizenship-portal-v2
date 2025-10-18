/**
 * Document Radar Configuration
 * Defines required documents for each family member type
 */

export type PersonType = 'AP' | 'F' | 'M' | 'PGF' | 'PGM' | 'MGF' | 'MGM' | 'SPOUSE';

export type DocumentType = 
  | 'birth_certificate'
  | 'marriage_certificate'
  | 'passport'
  | 'naturalization'
  | 'death_certificate'
  | 'divorce_decree';

export interface DocumentRequirement {
  type: DocumentType;
  label: string;
  isCritical: boolean;
  description: string;
}

export const DOCUMENT_REQUIREMENTS: Record<PersonType, DocumentRequirement[]> = {
  AP: [
    {
      type: 'birth_certificate',
      label: 'Birth Certificate',
      isCritical: true,
      description: 'Original or certified copy of birth certificate'
    },
    {
      type: 'passport',
      label: 'Passport',
      isCritical: true,
      description: 'Valid passport (scanned or photographed)'
    },
    {
      type: 'marriage_certificate',
      label: 'Marriage Certificate',
      isCritical: false,
      description: 'Required if married'
    },
    {
      type: 'naturalization',
      label: 'Naturalization Certificate',
      isCritical: false,
      description: 'If naturalized in another country'
    }
  ],
  SPOUSE: [
    {
      type: 'birth_certificate',
      label: 'Birth Certificate',
      isCritical: true,
      description: 'Original or certified copy of birth certificate'
    },
    {
      type: 'passport',
      label: 'Passport',
      isCritical: false,
      description: 'Valid passport (if available)'
    },
    {
      type: 'marriage_certificate',
      label: 'Marriage Certificate',
      isCritical: true,
      description: 'Marriage certificate with applicant'
    }
  ],
  F: [
    {
      type: 'birth_certificate',
      label: 'Birth Certificate',
      isCritical: true,
      description: 'Original or certified copy'
    },
    {
      type: 'marriage_certificate',
      label: 'Marriage Certificate',
      isCritical: true,
      description: 'Marriage to mother'
    },
    {
      type: 'naturalization',
      label: 'Naturalization Certificate',
      isCritical: true,
      description: 'If naturalized - critical for eligibility'
    },
    {
      type: 'passport',
      label: 'Passport',
      isCritical: false,
      description: 'If available'
    },
    {
      type: 'death_certificate',
      label: 'Death Certificate',
      isCritical: false,
      description: 'If deceased'
    }
  ],
  M: [
    {
      type: 'birth_certificate',
      label: 'Birth Certificate',
      isCritical: true,
      description: 'Original or certified copy'
    },
    {
      type: 'marriage_certificate',
      label: 'Marriage Certificate',
      isCritical: true,
      description: 'Marriage to father'
    },
    {
      type: 'naturalization',
      label: 'Naturalization Certificate',
      isCritical: true,
      description: 'If naturalized - critical for eligibility'
    },
    {
      type: 'passport',
      label: 'Passport',
      isCritical: false,
      description: 'If available'
    },
    {
      type: 'death_certificate',
      label: 'Death Certificate',
      isCritical: false,
      description: 'If deceased'
    }
  ],
  PGF: [
    {
      type: 'birth_certificate',
      label: 'Birth Certificate',
      isCritical: true,
      description: 'Polish birth certificate (critical for proving Polish origin)'
    },
    {
      type: 'marriage_certificate',
      label: 'Marriage Certificate',
      isCritical: true,
      description: 'Marriage to PGM'
    },
    {
      type: 'naturalization',
      label: 'Naturalization Certificate',
      isCritical: true,
      description: 'CRITICAL: Proves if/when Polish citizenship was lost'
    },
    {
      type: 'passport',
      label: 'Polish Passport',
      isCritical: false,
      description: 'Strong evidence of Polish citizenship'
    }
  ],
  PGM: [
    {
      type: 'birth_certificate',
      label: 'Birth Certificate',
      isCritical: true,
      description: 'Polish birth certificate if applicable'
    },
    {
      type: 'marriage_certificate',
      label: 'Marriage Certificate',
      isCritical: true,
      description: 'Marriage to PGF'
    },
    {
      type: 'naturalization',
      label: 'Naturalization Certificate',
      isCritical: false,
      description: 'If naturalized in another country'
    }
  ],
  MGF: [
    {
      type: 'birth_certificate',
      label: 'Birth Certificate',
      isCritical: true,
      description: 'Polish birth certificate (critical for proving Polish origin)'
    },
    {
      type: 'marriage_certificate',
      label: 'Marriage Certificate',
      isCritical: true,
      description: 'Marriage to MGM'
    },
    {
      type: 'naturalization',
      label: 'Naturalization Certificate',
      isCritical: true,
      description: 'CRITICAL: Proves if/when Polish citizenship was lost'
    },
    {
      type: 'passport',
      label: 'Polish Passport',
      isCritical: false,
      description: 'Strong evidence of Polish citizenship'
    }
  ],
  MGM: [
    {
      type: 'birth_certificate',
      label: 'Birth Certificate',
      isCritical: true,
      description: 'Polish birth certificate if applicable'
    },
    {
      type: 'marriage_certificate',
      label: 'Marriage Certificate',
      isCritical: true,
      description: 'Marriage to MGF'
    },
    {
      type: 'naturalization',
      label: 'Naturalization Certificate',
      isCritical: false,
      description: 'If naturalized in another country'
    }
  ]
};

export const PERSON_TYPE_LABELS: Record<PersonType, string> = {
  AP: 'Applicant',
  SPOUSE: 'Spouse',
  F: 'Father',
  M: 'Mother',
  PGF: 'Paternal Grandfather',
  PGM: 'Paternal Grandmother',
  MGF: 'Maternal Grandfather',
  MGM: 'Maternal Grandmother'
};
