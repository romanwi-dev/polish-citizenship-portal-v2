import { z } from 'zod';

/**
 * POA Form Validation Schema
 * Validates Power of Attorney form data
 */

const dateFormatRegex = /^\d{2}\.\d{2}\.\d{4}$/;

export const poaAdultSchema = z.object({
  applicant_first_name: z.string()
    .trim()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters'),
  
  applicant_last_name: z.string()
    .trim()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters'),
  
  applicant_passport_number: z.string()
    .trim()
    .min(1, 'Passport number is required')
    .max(20, 'Passport number must be less than 20 characters'),
  
  poa_date_filed: z.string()
    .optional()
    .refine((val) => !val || dateFormatRegex.test(val), {
      message: 'Date must be in DD.MM.YYYY format'
    }),
});

export const poaMinorSchema = poaAdultSchema.extend({
  child_1_first_name: z.string()
    .trim()
    .min(1, 'Child first name is required')
    .max(100, 'Child first name must be less than 100 characters'),
  
  child_1_last_name: z.string()
    .trim()
    .min(1, 'Child last name is required')
    .max(100, 'Child last name must be less than 100 characters'),
  
  child_1_dob: z.string()
    .refine((val) => dateFormatRegex.test(val), {
      message: 'Child date of birth must be in DD.MM.YYYY format'
    }),
});

export const poaSpousesSchema = poaAdultSchema.extend({
  spouse_first_name: z.string()
    .trim()
    .min(1, 'Spouse first name is required')
    .max(100, 'Spouse first name must be less than 100 characters'),
  
  spouse_last_name: z.string()
    .trim()
    .min(1, 'Spouse last name is required')
    .max(100, 'Spouse last name must be less than 100 characters'),
  
  spouse_passport_number: z.string()
    .trim()
    .min(1, 'Spouse passport number is required')
    .max(20, 'Spouse passport number must be less than 20 characters'),
  
  husband_last_name_after_marriage: z.string()
    .max(100, 'Husband last name must be less than 100 characters')
    .optional(),
  
  wife_last_name_after_marriage: z.string()
    .max(100, 'Wife last name must be less than 100 characters')
    .optional(),
  
  child_1_last_name: z.string()
    .max(100, 'Child last name must be less than 100 characters')
    .optional(),
});

export type POAAdultData = z.infer<typeof poaAdultSchema>;
export type POAMinorData = z.infer<typeof poaMinorSchema>;
export type POASpousesData = z.infer<typeof poaSpousesSchema>;
