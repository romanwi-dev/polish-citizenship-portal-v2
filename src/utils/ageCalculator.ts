/**
 * Age Calculation Utility
 * Shared utility for calculating age from date of birth
 * Used across POA, Family Tree, and Intake forms
 */

/**
 * Calculate age from date of birth
 * @param dob - Date of birth in ISO format (YYYY-MM-DD) or DD.MM.YYYY format
 * @returns Age in years, or null if invalid date
 */
export function calculateAge(dob: string | null | undefined): number | null {
  if (!dob) return null;

  try {
    let date: Date;
    
    // Handle DD.MM.YYYY format
    if (dob.includes('.')) {
      const [day, month, year] = dob.split('.');
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      // Handle ISO format (YYYY-MM-DD)
      date = new Date(dob);
    }

    if (isNaN(date.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    
    // Adjust if birthday hasn't occurred this year yet
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }

    return age >= 0 ? age : null;
  } catch (error) {
    console.error('Error calculating age:', error);
    return null;
  }
}

/**
 * Check if a person is a minor (under 18)
 * @param dob - Date of birth in ISO or DD.MM.YYYY format
 * @returns true if person is under 18, false otherwise
 */
export function isMinor(dob: string | null | undefined): boolean {
  const age = calculateAge(dob);
  return age !== null && age < 18;
}

/**
 * Get all minor children from a data object containing child_1_dob through child_10_dob
 * @param formData - Object containing child DOB fields
 * @returns Array of child numbers (1-10) that are minors
 */
export function getMinorChildrenNumbers(formData: Record<string, any>): number[] {
  const minorChildren: number[] = [];
  
  for (let i = 1; i <= 10; i++) {
    const childDob = formData[`child_${i}_dob`];
    if (childDob && isMinor(childDob)) {
      minorChildren.push(i);
    }
  }
  
  return minorChildren;
}

/**
 * Count total number of minor children
 * @param formData - Object containing child DOB fields
 * @returns Number of children under 18
 */
export function countMinorChildren(formData: Record<string, any>): number {
  return getMinorChildrenNumbers(formData).length;
}

/**
 * Get all children (with any data filled in) from a data object
 * @param formData - Object containing child fields
 * @returns Array of child numbers (1-10) that have any data
 */
export function getChildrenWithData(formData: Record<string, any>): number[] {
  const childrenWithData: number[] = [];
  
  for (let i = 1; i <= 10; i++) {
    const hasAnyData = 
      formData[`child_${i}_first_name`] ||
      formData[`child_${i}_last_name`] ||
      formData[`child_${i}_dob`] ||
      formData[`child_${i}_pob`];
    
    if (hasAnyData) {
      childrenWithData.push(i);
    }
  }
  
  return childrenWithData;
}
