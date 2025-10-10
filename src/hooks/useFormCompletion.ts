import { useMemo } from 'react';

interface FormField {
  name: string;
  required?: boolean;
}

/**
 * Hook to calculate form completion percentage
 */
export const useFormCompletion = (
  formData: Record<string, any>,
  requiredFields: string[]
): {
  completionPercentage: number;
  filledCount: number;
  totalCount: number;
  missingFields: string[];
} => {
  return useMemo(() => {
    const filledFields = requiredFields.filter(field => {
      const value = formData[field];
      return value !== null && value !== undefined && value !== '';
    });

    const missingFields = requiredFields.filter(field => {
      const value = formData[field];
      return value === null || value === undefined || value === '';
    });

    const percentage = requiredFields.length > 0
      ? Math.round((filledFields.length / requiredFields.length) * 100)
      : 0;

    return {
      completionPercentage: percentage,
      filledCount: filledFields.length,
      totalCount: requiredFields.length,
      missingFields,
    };
  }, [formData, requiredFields]);
};
