/**
 * PDF Mappings - Single Source of Truth
 * 
 * ✅ FIX #2: Unified field mappings
 * - Frontend now imports from backend source of truth
 * - No more duplicate files causing desync
 * - Backend mappings in supabase/functions/_shared/mappings/*.ts
 */

// Import from backend (single source of truth)
export { POA_ADULT_PDF_MAP, POA_ADULT_REQUIRED_FIELDS } from '../../../supabase/functions/_shared/mappings/poa-adult';
export { POA_MINOR_PDF_MAP, POA_MINOR_REQUIRED_FIELDS } from '../../../supabase/functions/_shared/mappings/poa-minor';
export { POA_SPOUSES_PDF_MAP, POA_SPOUSES_REQUIRED_FIELDS } from '../../../supabase/functions/_shared/mappings/poa-spouses';
export { POA_COMBINED_PDF_MAP, POA_COMBINED_REQUIRED_FIELDS } from '../../../supabase/functions/_shared/mappings/poa-combined';
