/**
 * Hybrid Case Naming Utility
 * 
 * Generates case identifiers in format: {COUNTRY}{NUMBER}_{FIRST}_{LAST}
 * Example: USA001_John_Smith, POL042_Anna_Kowalski
 * 
 * Benefits:
 * - Human-readable at a glance
 * - Sortable by country
 * - Easy to reference in conversations
 * - Maintains unique sequential numbering per country
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Generates a hybrid case name
 * @param country - Client's country code (e.g., "USA", "UK", "Poland")
 * @param firstName - Client's first name
 * @param lastName - Client's last name
 * @returns Hybrid name in format COUNTRY###_First_Last
 */
export const generateHybridCaseName = async (
  country: string | null,
  firstName: string,
  lastName: string
): Promise<string> => {
  // Normalize country to 3-letter code
  const countryCode = normalizeCountryCode(country);
  
  // Get next sequential number for this country
  const sequentialNumber = await getNextCountrySequence(countryCode);
  
  // Clean and capitalize names
  const cleanFirst = cleanName(firstName);
  const cleanLast = cleanName(lastName);
  
  // Format: USA001_John_Smith
  return `${countryCode}${sequentialNumber}_${cleanFirst}_${cleanLast}`;
};

/**
 * Normalizes country names to 3-letter codes
 */
const normalizeCountryCode = (country: string | null): string => {
  if (!country) return 'INT'; // International/Unknown
  
  const upperCountry = country.toUpperCase();
  
  // Common country mappings
  const countryMap: Record<string, string> = {
    'UNITED STATES': 'USA',
    'UNITED STATES OF AMERICA': 'USA',
    'US': 'USA',
    'USA': 'USA',
    'UNITED KINGDOM': 'GBR',
    'UK': 'GBR',
    'GREAT BRITAIN': 'GBR',
    'POLAND': 'POL',
    'POLSKA': 'POL',
    'CANADA': 'CAN',
    'AUSTRALIA': 'AUS',
    'GERMANY': 'DEU',
    'FRANCE': 'FRA',
    'SPAIN': 'ESP',
    'ITALY': 'ITA',
    'IRELAND': 'IRL',
    'NETHERLANDS': 'NLD',
    'BELGIUM': 'BEL',
    'AUSTRIA': 'AUT',
    'SWITZERLAND': 'CHE',
    'SWEDEN': 'SWE',
    'NORWAY': 'NOR',
    'DENMARK': 'DNK',
    'FINLAND': 'FIN',
    'ISRAEL': 'ISR',
    'ARGENTINA': 'ARG',
    'BRAZIL': 'BRA',
    'MEXICO': 'MEX',
    'SOUTH AFRICA': 'ZAF',
    'NEW ZEALAND': 'NZL',
  };
  
  // Return mapped code or first 3 letters
  return countryMap[upperCountry] || upperCountry.substring(0, 3).toUpperCase();
};

/**
 * Gets the next sequential number for a country
 */
const getNextCountrySequence = async (countryCode: string): Promise<string> => {
  try {
    // Query all cases with this country code prefix
    const { data: cases, error } = await supabase
      .from('cases')
      .select('client_code')
      .not('client_code', 'is', null)
      .ilike('client_code', `${countryCode}%`);
    
    if (error) throw error;
    
    // Extract sequence numbers from existing codes
    const existingNumbers = (cases || [])
      .map(c => {
        if (!c.client_code) return 0;
        // Extract number from format like USA001_John_Smith
        const match = c.client_code.match(new RegExp(`^${countryCode}(\\d+)_`));
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => !isNaN(n));
    
    // Get max number and increment
    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    const nextNumber = maxNumber + 1;
    
    // Pad with zeros (001, 002, etc.)
    return nextNumber.toString().padStart(3, '0');
  } catch (error) {
    console.error('Error getting country sequence:', error);
    // Fallback to timestamp-based number
    return Date.now().toString().slice(-3);
  }
};

/**
 * Cleans and capitalizes a name
 */
const cleanName = (name: string): string => {
  return name
    .trim()
    .split(/\s+/) // Split by whitespace
    .map(part => 
      part
        .replace(/[^a-zA-Z-]/g, '') // Remove special chars except hyphens
        .split('-') // Handle hyphenated names
        .map(subpart => 
          subpart.charAt(0).toUpperCase() + subpart.slice(1).toLowerCase()
        )
        .join('-')
    )
    .join('_'); // Use underscore for multi-part names
};

/**
 * Parses a hybrid case name to extract components
 */
export const parseHybridCaseName = (hybridName: string): {
  countryCode: string;
  sequenceNumber: string;
  firstName: string;
  lastName: string;
} | null => {
  // Match pattern: COUNTRY###_First_Last
  const match = hybridName.match(/^([A-Z]{3})(\d{3})_([^_]+)_(.+)$/);
  
  if (!match) return null;
  
  return {
    countryCode: match[1],
    sequenceNumber: match[2],
    firstName: match[3],
    lastName: match[4],
  };
};

/**
 * Updates legacy client codes to hybrid format
 * Used for migrating old cases
 */
export const migrateToHybridNaming = async (caseId: string): Promise<boolean> => {
  try {
    // Get case data
    const { data: caseData, error: fetchError } = await supabase
      .from('cases')
      .select('id, client_name, country, client_code')
      .eq('id', caseId)
      .single();
    
    if (fetchError || !caseData) throw fetchError || new Error('Case not found');
    
    // Check if already using hybrid format
    if (caseData.client_code && parseHybridCaseName(caseData.client_code)) {
      return true; // Already migrated
    }
    
    // Get master_table data for names
    const { data: masterData } = await supabase
      .from('master_table')
      .select('applicant_first_name, applicant_last_name')
      .eq('case_id', caseId)
      .maybeSingle();
    
    const firstName = masterData?.applicant_first_name || caseData.client_name.split(' ')[0] || 'Client';
    const lastName = masterData?.applicant_last_name || caseData.client_name.split(' ').slice(1).join(' ') || 'Name';
    
    // Generate hybrid name
    const hybridName = await generateHybridCaseName(caseData.country, firstName, lastName);
    
    // Update case
    const { error: updateError } = await supabase
      .from('cases')
      .update({ client_code: hybridName })
      .eq('id', caseId);
    
    if (updateError) throw updateError;
    
    return true;
  } catch (error) {
    console.error('Error migrating to hybrid naming:', error);
    return false;
  }
};
