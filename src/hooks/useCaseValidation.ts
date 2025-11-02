import { z } from "zod";

/**
 * Case validation schema
 * Ensures data integrity and prevents invalid case data
 */
export const caseValidationSchema = z.object({
  client_name: z
    .string()
    .trim()
    .min(2, "Client name must be at least 2 characters")
    .max(100, "Client name must be less than 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Client name can only contain letters, spaces, hyphens and apostrophes"),
  
  client_code: z
    .string()
    .optional()
    .nullable(),
  
  country: z
    .string()
    .optional()
    .nullable(),
  
  progress: z
    .number()
    .int()
    .min(0, "Progress cannot be negative")
    .max(100, "Progress cannot exceed 100%"),
  
  client_score: z
    .number()
    .int()
    .min(0, "Score cannot be negative")
    .max(100, "Score cannot exceed 100"),
  
  notes: z
    .string()
    .max(5000, "Notes must be less than 5000 characters")
    .optional()
    .nullable(),
});

export type CaseValidationData = z.infer<typeof caseValidationSchema>;

/**
 * Validates case data before saving
 * @param data - Case data to validate
 * @returns Validation result with errors if any
 */
export const validateCaseData = (data: Partial<CaseValidationData>) => {
  try {
    caseValidationSchema.parse(data);
    return { success: true, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      };
    }
    return { success: false, errors: [{ field: 'unknown', message: 'Validation failed' }] };
  }
};

/**
 * Hook for validating case data in forms
 */
export const useCaseValidation = () => {
  return {
    validate: validateCaseData,
    schema: caseValidationSchema,
  };
};
