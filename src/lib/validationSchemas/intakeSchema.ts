import { z } from 'zod';

/**
 * Intake Wizard Validation Schema
 * Validates intake form data step by step
 */

const dateFormatRegex = /^\d{2}\.\d{2}\.\d{4}$/;

// Step 1: Basic Info
export const step1Schema = z.object({
  applicant_first_name: z.string()
    .trim()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters'),
  
  applicant_last_name: z.string()
    .trim()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters'),
  
  applicant_dob: z.string()
    .refine((val) => dateFormatRegex.test(val), {
      message: 'Date must be in DD.MM.YYYY format'
    }),
  
  applicant_sex: z.enum(['M', 'F'], {
    errorMap: () => ({ message: 'Please select a gender' })
  }),
});

// Step 2: Contact
export const step2Schema = z.object({
  applicant_email: z.string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  
  applicant_phone: z.string()
    .trim()
    .max(20, 'Phone number must be less than 20 characters')
    .optional(),
  
  applicant_address: z.string()
    .trim()
    .max(200, 'Address must be less than 200 characters')
    .optional(),
  
  applicant_city: z.string()
    .trim()
    .max(100, 'City must be less than 100 characters')
    .optional(),
  
  applicant_state: z.string()
    .trim()
    .max(100, 'State must be less than 100 characters')
    .optional(),
  
  applicant_zip: z.string()
    .trim()
    .max(20, 'Zip code must be less than 20 characters')
    .optional(),
  
  applicant_country: z.string()
    .trim()
    .max(100, 'Country must be less than 100 characters')
    .optional(),
});

// Step 3: Passport
export const step3Schema = z.object({
  applicant_passport_number: z.string()
    .trim()
    .max(20, 'Passport number must be less than 20 characters')
    .optional(),
  
  applicant_passport_issue_date: z.string()
    .refine((val) => !val || dateFormatRegex.test(val), {
      message: 'Date must be in DD.MM.YYYY format'
    })
    .optional(),
  
  applicant_passport_expiry_date: z.string()
    .refine((val) => !val || dateFormatRegex.test(val), {
      message: 'Date must be in DD.MM.YYYY format'
    })
    .optional(),
  
  applicant_passport_issuing_country: z.string()
    .trim()
    .max(100, 'Country must be less than 100 characters')
    .optional(),
});

// Step 4: Family
export const step4Schema = z.object({
  father_first_name: z.string()
    .trim()
    .max(100, 'Name must be less than 100 characters')
    .optional(),
  
  father_last_name: z.string()
    .trim()
    .max(100, 'Name must be less than 100 characters')
    .optional(),
  
  mother_first_name: z.string()
    .trim()
    .max(100, 'Name must be less than 100 characters')
    .optional(),
  
  mother_maiden_name: z.string()
    .trim()
    .max(100, 'Name must be less than 100 characters')
    .optional(),
  
  applicant_is_married: z.boolean().optional(),
});

// Step 5: Children (NEW)
export const step5Schema = z.object({
  ...Object.fromEntries(
    Array.from({ length: 10 }, (_, i) => i + 1).flatMap(num => [
      [`child_${num}_first_name`, z.string().trim().max(100).optional()],
      [`child_${num}_last_name`, z.string().trim().max(100).optional()],
      [`child_${num}_dob`, z.string().refine((val) => !val || dateFormatRegex.test(val), {
        message: 'Date must be in DD.MM.YYYY format'
      }).optional()],
      [`child_${num}_pob`, z.string().trim().max(200).optional()],
    ])
  ),
});

// Step 6: Polish Connection (formerly Step 5)
export const step6Schema = z.object({
  has_polish_ancestors: z.enum(['yes', 'no', 'unknown']).optional(),
  polish_ancestor_details: z.string()
    .max(1000, 'Details must be less than 1000 characters')
    .optional(),
  has_polish_documents: z.enum(['yes', 'no', 'unknown']).optional(),
});

// Step 7: Additional (formerly Step 6)
export const step7Schema = z.object({
  client_notes: z.string()
    .max(2000, 'Notes must be less than 2000 characters')
    .optional(),
});

// Complete intake schema (all steps combined)
export const completeIntakeSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema)
  .merge(step6Schema)
  .merge(step7Schema);

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;
export type Step6Data = z.infer<typeof step6Schema>;
export type Step7Data = z.infer<typeof step7Schema>;
export type CompleteIntakeData = z.infer<typeof completeIntakeSchema>;
