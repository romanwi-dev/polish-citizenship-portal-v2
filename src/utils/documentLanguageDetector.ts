/**
 * Document Language Detection Utility
 * 
 * Auto-detects language from OCR text to trigger translation workflows
 * Supports Polish, English, German, and other common languages
 */

export type DetectedLanguage = 'PL' | 'EN' | 'DE' | 'FR' | 'ES' | 'UNKNOWN';

/**
 * Detects document language from OCR text
 * @param ocrText - Extracted text from document OCR
 * @returns Language code (PL, EN, DE, FR, ES, UNKNOWN)
 */
export const detectDocumentLanguage = (ocrText: string): DetectedLanguage => {
  if (!ocrText || ocrText.length < 10) return 'UNKNOWN';
  
  const text = ocrText.toLowerCase();
  
  // Polish keywords (weighted for birth certificates, marriage, citizenship docs)
  const polishKeywords = [
    'urodził', 'urodziła', 'urodzony', 'urodzona',
    'zamieszkały', 'zamieszkała', 'pesel', 'województwo',
    'gmina', 'powiat', 'urząd', 'stanu', 'cywilnego',
    'metryka', 'akt', 'obywatelstwo', 'rzeczpospolita',
    'polska', 'polskie', 'polskiego', 'polskiej',
    'zaświadczenie', 'dowód', 'osobisty'
  ];
  
  // English keywords
  const englishKeywords = [
    'birth certificate', 'issued', 'county', 'state',
    'united states', 'city', 'certificate', 'registrar',
    'seal', 'witness', 'marriage', 'divorce', 'death',
    'commonwealth', 'republic', 'certified', 'copy'
  ];
  
  // German keywords
  const germanKeywords = [
    'geburtsurkunde', 'geboren', 'standesamt', 'landkreis',
    'bundesrepublik', 'deutschland', 'geburtsort', 'staatsangehörigkeit',
    'heiratsurkunde', 'eheschließung', 'bescheinigung'
  ];
  
  // French keywords
  const frenchKeywords = [
    'acte de naissance', 'né', 'née', 'commune', 'département',
    'république française', 'mairie', 'certificat', 'registre'
  ];
  
  // Spanish keywords
  const spanishKeywords = [
    'acta de nacimiento', 'nacido', 'nacida', 'municipio',
    'provincia', 'registro civil', 'certificado', 'república'
  ];
  
  // Count keyword matches for each language
  const countMatches = (keywords: string[]) => 
    keywords.filter(kw => text.includes(kw)).length;
  
  const polishCount = countMatches(polishKeywords);
  const englishCount = countMatches(englishKeywords);
  const germanCount = countMatches(germanKeywords);
  const frenchCount = countMatches(frenchKeywords);
  const spanishCount = countMatches(spanishKeywords);
  
  // Primary detection based on keyword matches
  const scores = {
    PL: polishCount,
    EN: englishCount,
    DE: germanCount,
    FR: frenchCount,
    ES: spanishCount,
  };
  
  const maxScore = Math.max(...Object.values(scores));
  
  if (maxScore >= 2) {
    const detectedLang = Object.keys(scores).find(
      lang => scores[lang as keyof typeof scores] === maxScore
    ) as DetectedLanguage;
    return detectedLang;
  }
  
  // Fallback: Polish-specific character detection
  const polishChars = (text.match(/[ąćęłńóśźż]/g) || []).length;
  if (polishChars >= 3) return 'PL';
  
  // Fallback: German-specific characters
  const germanChars = (text.match(/[äöüß]/g) || []).length;
  if (germanChars >= 2) return 'DE';
  
  // Fallback: French-specific characters
  const frenchChars = (text.match(/[àâæçéèêëïîôùûü]/g) || []).length;
  if (frenchChars >= 2) return 'FR';
  
  return 'UNKNOWN';
};

/**
 * Get language display name
 */
export const getLanguageName = (code: DetectedLanguage): string => {
  const names: Record<DetectedLanguage, string> = {
    PL: 'Polish',
    EN: 'English',
    DE: 'German',
    FR: 'French',
    ES: 'Spanish',
    UNKNOWN: 'Unknown',
  };
  return names[code];
};

/**
 * Check if language requires translation to Polish
 */
export const requiresTranslation = (language: DetectedLanguage): boolean => {
  return language !== 'PL' && language !== 'UNKNOWN';
};