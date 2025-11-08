/**
 * Family Tree Dynamic Bloodline Resolver
 * Dynamically maps parent/grandparent/great-grandparent data based on Polish bloodline
 */

export interface FamilyTreeResolvedData {
  // Applicant
  applicant_full_name: string;
  applicant_date_of_birth: string;
  applicant_place_of_birth: string;
  applicant_date_of_marriage: string;
  applicant_place_of_marriage: string;
  applicant_spouse_full_name_and_maiden_name: string;
  
  // Polish parent (father OR mother)
  polish_parent_full_name: string;
  polish_parent_spouse_full_name: string;
  polish_parent_date_of_birth: string;
  polish_parent_place_of_birth: string;
  polish_parent_date_of_marriage: string;
  polish_parent_place_of_marriage: string;
  polish_parent_date_of_emigration: string;
  polish_parent_date_of_naturalization: string;
  
  // Polish grandparent (PGF OR MGF)
  polish_grandparent_full_name: string;
  polish_grandparent_spouse_full_name: string;
  polish_grandparent_date_of_birth: string;
  polish_grandparent_place_of_birth: string;
  polish_grandparent_date_of_mariage: string; // Note: typo in PDF field name
  polish_grandparent_place_of_mariage: string; // Note: typo in PDF field name
  polish_grandparent_date_of_emigration: string;
  polish_grandparent_date_of_naturalization: string;
  
  // Great-grandparents (PGGF & PGGM OR MGGF & MGGM)
  great_grandfather_full_name: string;
  great_grandmother_full_name: string;
  great_grandfather_date_of_birth: string;
  great_grandfather_place_of_birth: string;
  great_grandfather_date_of_marriage: string;
  great_grandfather_place_of_marriage: string;
  great_grandfather_date_of_emigartion: string; // Note: typo in PDF field name
  great_grandfather_date_of_naturalization: string;
  
  // Minor children (1-3, PDF limit)
  minor_1_full_name?: string;
  minor_1_date_of_birth?: string;
  minor_1_place_of_birth?: string;
  minor_2_full_name?: string;
  minor_2_date_of_birth?: string;
  minor_2_place_of_birth?: string;
  minor_3_full_name?: string;
  minor_3_date_of_birth?: string;
}

export function resolveFamilyTreeData(masterData: Record<string, any>): FamilyTreeResolvedData {
  const fatherIsPolish = masterData.father_is_polish === true;
  const motherIsPolish = masterData.mother_is_polish === true;
  
  // Determine bloodline path
  let usePaternal = true; // Default to paternal if both or neither
  if (motherIsPolish && !fatherIsPolish) {
    usePaternal = false;
  }
  
  // Helper to combine first and last names
  const fullName = (first?: string, last?: string) => {
    const parts = [first, last].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : '';
  };
  
  // Helper to format dates (YYYY-MM-DD or DD.MM.YYYY to PDF format)
  const formatDate = (date?: string) => {
    if (!date) return '';
    return date;
  };
  
  // Build resolved data structure
  const resolved: FamilyTreeResolvedData = {
    // Applicant info
    applicant_full_name: fullName(masterData.applicant_first_name, masterData.applicant_last_name),
    applicant_date_of_birth: formatDate(masterData.applicant_dob),
    applicant_place_of_birth: masterData.applicant_pob || '',
    applicant_date_of_marriage: formatDate(masterData.date_of_marriage),
    applicant_place_of_marriage: masterData.place_of_marriage || '',
    applicant_spouse_full_name_and_maiden_name: fullName(masterData.spouse_first_name, masterData.spouse_last_name),
    
    // Polish parent - dynamically selected
    polish_parent_full_name: usePaternal 
      ? fullName(masterData.father_first_name, masterData.father_last_name)
      : fullName(masterData.mother_first_name, masterData.mother_maiden_name),
    polish_parent_spouse_full_name: usePaternal
      ? fullName(masterData.mother_first_name, masterData.mother_maiden_name)
      : fullName(masterData.father_first_name, masterData.father_last_name),
    polish_parent_date_of_birth: usePaternal 
      ? formatDate(masterData.father_dob) 
      : formatDate(masterData.mother_dob),
    polish_parent_place_of_birth: usePaternal 
      ? (masterData.father_pob || '') 
      : (masterData.mother_pob || ''),
    polish_parent_date_of_marriage: formatDate(masterData.father_mother_marriage_date),
    polish_parent_place_of_marriage: masterData.father_mother_marriage_place || '',
    polish_parent_date_of_emigration: usePaternal 
      ? formatDate(masterData.father_date_of_emigration) 
      : formatDate(masterData.mother_date_of_emigration),
    polish_parent_date_of_naturalization: usePaternal 
      ? formatDate(masterData.father_date_of_naturalization) 
      : formatDate(masterData.mother_date_of_naturalization),
    
    // Polish grandparent - dynamically selected (PGF or MGF)
    polish_grandparent_full_name: usePaternal 
      ? fullName(masterData.pgf_first_name, masterData.pgf_last_name)
      : fullName(masterData.mgf_first_name, masterData.mgf_last_name),
    polish_grandparent_spouse_full_name: usePaternal
      ? fullName(masterData.pgm_first_name, masterData.pgm_maiden_name)
      : fullName(masterData.mgm_first_name, masterData.mgm_maiden_name),
    polish_grandparent_date_of_birth: usePaternal 
      ? formatDate(masterData.pgf_dob) 
      : formatDate(masterData.mgf_dob),
    polish_grandparent_place_of_birth: usePaternal 
      ? (masterData.pgf_pob || '') 
      : (masterData.mgf_pob || ''),
    polish_grandparent_date_of_mariage: usePaternal 
      ? formatDate(masterData.pgf_pgm_marriage_date) 
      : formatDate(masterData.mgf_mgm_marriage_date),
    polish_grandparent_place_of_mariage: usePaternal 
      ? (masterData.pgf_pgm_marriage_place || '') 
      : (masterData.mgf_mgm_marriage_place || ''),
    polish_grandparent_date_of_emigration: usePaternal 
      ? formatDate(masterData.pgf_date_of_emigration) 
      : formatDate(masterData.mgf_date_of_emigration),
    polish_grandparent_date_of_naturalization: usePaternal 
      ? formatDate(masterData.pgf_date_of_naturalization) 
      : formatDate(masterData.mgf_date_of_naturalization),
    
    // Great-grandparents - dynamically selected (PGGF/PGGM or MGGF/MGGM)
    great_grandfather_full_name: usePaternal 
      ? fullName(masterData.pggf_first_name, masterData.pggf_last_name)
      : fullName(masterData.mggf_first_name, masterData.mggf_last_name),
    great_grandmother_full_name: usePaternal
      ? fullName(masterData.pggm_first_name, masterData.pggm_maiden_name)
      : fullName(masterData.mggm_first_name, masterData.mggm_maiden_name),
    great_grandfather_date_of_birth: usePaternal 
      ? formatDate(masterData.pggf_dob) 
      : formatDate(masterData.mggf_dob),
    great_grandfather_place_of_birth: usePaternal 
      ? (masterData.pggf_pob || '') 
      : (masterData.mggf_pob || ''),
    great_grandfather_date_of_marriage: usePaternal 
      ? formatDate(masterData.pggf_pggm_marriage_date) 
      : formatDate(masterData.mggf_mggm_marriage_date),
    great_grandfather_place_of_marriage: usePaternal 
      ? (masterData.pggf_pggm_marriage_place || '') 
      : (masterData.mggf_mggm_marriage_place || ''),
    great_grandfather_date_of_emigartion: usePaternal 
      ? formatDate(masterData.pggf_date_of_emigration) 
      : formatDate(masterData.mggf_date_of_emigration),
    great_grandfather_date_of_naturalization: usePaternal 
      ? formatDate(masterData.pggf_date_of_naturalization) 
      : formatDate(masterData.mggf_date_of_naturalization),
    
    // Minor children (limited to 3 for PDF)
    minor_1_full_name: fullName(masterData.child_1_first_name, masterData.child_1_last_name),
    minor_1_date_of_birth: formatDate(masterData.child_1_dob),
    minor_1_place_of_birth: masterData.child_1_pob || '',
    minor_2_full_name: fullName(masterData.child_2_first_name, masterData.child_2_last_name),
    minor_2_date_of_birth: formatDate(masterData.child_2_dob),
    minor_2_place_of_birth: masterData.child_2_pob || '',
    minor_3_full_name: fullName(masterData.child_3_first_name, masterData.child_3_last_name),
    minor_3_date_of_birth: formatDate(masterData.child_3_dob),
  };
  
  return resolved;
}
