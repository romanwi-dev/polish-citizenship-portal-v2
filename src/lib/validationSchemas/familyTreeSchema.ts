import { z } from 'zod';

/**
 * Family Tree Form Validation Schema
 * Validates family tree form data
 */

const dateFormatRegex = /^\d{2}\.\d{2}\.\d{4}$/;

const personSchema = z.object({
  first_name: z.string()
    .trim()
    .max(100, 'Name must be less than 100 characters')
    .optional(),
  
  last_name: z.string()
    .trim()
    .max(100, 'Name must be less than 100 characters')
    .optional(),
  
  maiden_name: z.string()
    .trim()
    .max(100, 'Maiden name must be less than 100 characters')
    .optional(),
  
  dob: z.string()
    .refine((val) => !val || dateFormatRegex.test(val), {
      message: 'Date must be in DD.MM.YYYY format'
    })
    .optional(),
  
  pob: z.string()
    .trim()
    .max(200, 'Place of birth must be less than 200 characters')
    .optional(),
  
  date_of_emigration: z.string()
    .refine((val) => !val || dateFormatRegex.test(val), {
      message: 'Date must be in DD.MM.YYYY format'
    })
    .optional(),
  
  date_of_naturalization: z.string()
    .refine((val) => !val || dateFormatRegex.test(val), {
      message: 'Date must be in DD.MM.YYYY format'
    })
    .optional(),
  
  notes: z.string()
    .max(2000, 'Notes must be less than 2000 characters')
    .optional(),
});

export const familyTreeSchema = z.object({
  // Applicant (required fields)
  applicant_first_name: z.string()
    .trim()
    .min(1, 'Applicant first name is required')
    .max(100, 'Name must be less than 100 characters'),
  
  applicant_last_name: z.string()
    .trim()
    .min(1, 'Applicant last name is required')
    .max(100, 'Name must be less than 100 characters'),
  
  applicant_dob: z.string()
    .refine((val) => dateFormatRegex.test(val), {
      message: 'Date must be in DD.MM.YYYY format'
    }),
  
  // Optional applicant fields
  applicant_maiden_name: personSchema.shape.maiden_name,
  applicant_pob: personSchema.shape.pob,
  applicant_date_of_emigration: personSchema.shape.date_of_emigration,
  applicant_date_of_naturalization: personSchema.shape.date_of_naturalization,
  applicant_notes: personSchema.shape.notes,
  
  // Spouse (optional)
  spouse_first_name: personSchema.shape.first_name,
  spouse_last_name: personSchema.shape.last_name,
  spouse_maiden_name: personSchema.shape.maiden_name,
  spouse_dob: personSchema.shape.dob,
  spouse_pob: personSchema.shape.pob,
  
  // Parents (required)
  father_first_name: z.string()
    .trim()
    .min(1, 'Father first name is required')
    .max(100, 'Name must be less than 100 characters'),
  
  father_last_name: z.string()
    .trim()
    .min(1, 'Father last name is required')
    .max(100, 'Name must be less than 100 characters'),
  
  mother_first_name: z.string()
    .trim()
    .min(1, 'Mother first name is required')
    .max(100, 'Name must be less than 100 characters'),
  
  mother_maiden_name: z.string()
    .trim()
    .min(1, 'Mother maiden name is required')
    .max(100, 'Name must be less than 100 characters'),
  
  // Grandparents (required)
  pgf_first_name: z.string()
    .trim()
    .min(1, 'Paternal grandfather first name is required')
    .max(100, 'Name must be less than 100 characters'),
  
  pgf_last_name: z.string()
    .trim()
    .min(1, 'Paternal grandfather last name is required')
    .max(100, 'Name must be less than 100 characters'),
  
  pgm_first_name: z.string()
    .trim()
    .min(1, 'Paternal grandmother first name is required')
    .max(100, 'Name must be less than 100 characters'),
  
  pgm_maiden_name: z.string()
    .trim()
    .min(1, 'Paternal grandmother maiden name is required')
    .max(100, 'Name must be less than 100 characters'),
  
  mgf_first_name: z.string()
    .trim()
    .min(1, 'Maternal grandfather first name is required')
    .max(100, 'Name must be less than 100 characters'),
  
  mgf_last_name: z.string()
    .trim()
    .min(1, 'Maternal grandfather last name is required')
    .max(100, 'Name must be less than 100 characters'),
  
  mgm_first_name: z.string()
    .trim()
    .min(1, 'Maternal grandmother first name is required')
    .max(100, 'Name must be less than 100 characters'),
  
  mgm_maiden_name: z.string()
    .trim()
    .min(1, 'Maternal grandmother maiden name is required')
    .max(100, 'Name must be less than 100 characters'),
  
  // Children (all optional, but if provided must be valid)
  ...Object.fromEntries(
    Array.from({ length: 10 }, (_, i) => i + 1).flatMap(num => [
      [`child_${num}_first_name`, personSchema.shape.first_name],
      [`child_${num}_last_name`, personSchema.shape.last_name],
      [`child_${num}_dob`, personSchema.shape.dob],
      [`child_${num}_pob`, personSchema.shape.pob],
      [`child_${num}_notes`, personSchema.shape.notes],
    ])
  ),
}).partial(); // Make all fields optional for flexible validation

export type FamilyTreeData = z.infer<typeof familyTreeSchema>;
