// Complete Polish Citizenship Form Schemas
// Based on official PDF field mapping system (156+ fields)

export interface OBYFormData {
  // APPLICANT PERSONAL INFORMATION (29 fields)
  'OBY-A-GN': string; // Given Names
  'OBY-A-SN': string; // Surname
  'OBY-A-BD': string; // Birth Date
  'OBY-A-BP': string; // Birth Place
  'OBY-A-GENDER': 'M' | 'F';
  'OBY-A-ADDR': string;
  'OBY-A-POSTAL': string;
  'OBY-A-CITY': string;
  'OBY-A-COUNTRY': string;
  'OBY-A-PHONE': string;
  'OBY-A-EMAIL': string;
  'OBY-A-PESEL': string;
  'OBY-A-PASSPORT': string;
  'OBY-A-ID-NUMBER': string;
  'OBY-A-NATION': string;
  'OBY-A-PREV-NATION': string;
  'OBY-A-MAIDEN-NAME': string;
  'OBY-A-EDUCATION': string;
  'OBY-A-PROFESSION': string;
  'OBY-A-MARITAL-STATUS': string;

  // FATHER INFORMATION (9 fields)
  'OBY-F-GN': string;
  'OBY-F-SN': string;
  'OBY-F-BD': string;
  'OBY-F-BP': string;
  'OBY-F-DD': string;
  'OBY-F-NATION': string;
  'OBY-F-PROFESSION': string;
  'OBY-F-ADDR': string;

  // MOTHER INFORMATION (10 fields)
  'OBY-M-GN': string;
  'OBY-M-SN': string;
  'OBY-M-BD': string;
  'OBY-M-BP': string;
  'OBY-M-DD': string;
  'OBY-M-NATION': string;
  'OBY-M-PROFESSION': string;
  'OBY-M-ADDR': string;
  'OBY-M-MAIDEN-NAME': string;

  // PATERNAL GRANDPARENTS (12 fields)
  'OBY-PGF-GN': string;
  'OBY-PGF-SN': string;
  'OBY-PGF-BD': string;
  'OBY-PGF-BP': string;
  'OBY-PGF-DD': string;
  'OBY-PGF-NATION': string;
  'OBY-PGM-GN': string;
  'OBY-PGM-SN': string;
  'OBY-PGM-BD': string;
  'OBY-PGM-BP': string;
  'OBY-PGM-DD': string;
  'OBY-PGM-NATION': string;

  // MATERNAL GRANDPARENTS (12 fields)
  'OBY-MGF-GN': string;
  'OBY-MGF-SN': string;
  'OBY-MGF-BD': string;
  'OBY-MGF-BP': string;
  'OBY-MGF-DD': string;
  'OBY-MGF-NATION': string;
  'OBY-MGM-GN': string;
  'OBY-MGM-SN': string;
  'OBY-MGM-BD': string;
  'OBY-MGM-BP': string;
  'OBY-MGM-DD': string;
  'OBY-MGM-NATION': string;

  // SPOUSE INFORMATION (8 fields)
  'OBY-SPOUSE-GN': string;
  'OBY-SPOUSE-SN': string;
  'OBY-SPOUSE-BD': string;
  'OBY-SPOUSE-BP': string;
  'OBY-SPOUSE-NATION': string;
  'OBY-MARRIAGE-DATE': string;
  'OBY-MARRIAGE-PLACE': string;
  'OBY-MARRIAGE-CERT': string;

  // CHILDREN INFORMATION (7 fields)
  'OBY-CHILDREN-COUNT': number;
  'OBY-CHILD1-GN': string;
  'OBY-CHILD1-SN': string;
  'OBY-CHILD1-BD': string;
  'OBY-CHILD2-GN': string;
  'OBY-CHILD2-SN': string;
  'OBY-CHILD2-BD': string;

  // APPLICATION DETAILS (10 fields)
  'OBY-APP-DATE': string;
  'OBY-APP-PLACE': string;
  'OBY-APP-OFFICE': string;
  'OBY-APP-NUMBER': string;
  'OBY-APP-STATUS': string;
  'OBY-APP-FEE': number;
  'OBY-APP-FEE-PAID': boolean;
  'OBY-APP-NOTES': string;
  'OBY-APP-LAWYER': string;
  'OBY-APP-LAWYER-LICENSE': string;

  [key: string]: any;
}

export interface FamilyTreeData {
  // APPLICANT (6 fields)
  applicant_full_name: string;
  applicant_date_of_birth: string;
  applicant_place_of_birth: string;
  applicant_date_of_marriage: string;
  applicant_place_of_marriage: string;
  applicant_spouse_full_name_and_maiden_name: string;

  // MINOR CHILDREN (9 fields, 3 children max)
  minorChildren: Array<{
    minor_full_name: string;
    minor_date_of_birth: string;
    minor_place_of_birth: string;
  }>;

  // POLISH PARENT (8 fields)
  polishParent: {
    polish_parent_full_name: string;
    polish_parent_date_of_birth: string;
    polish_parent_place_of_birth: string;
    polish_parent_date_of_marriage: string;
    polish_parent_place_of_marriage: string;
    polish_parent_date_of_emigration: string;
    polish_parent_date_of_naturalization: string;
    polish_parent_spouse_full_name: string;
  };

  // POLISH GRANDPARENT (8 fields)
  polishGrandparent: {
    polish_grandparent_full_name: string;
    polish_grandparent_date_of_birth: string;
    polish_grandparent_place_of_birth: string;
    polish_grandparent_date_of_mariage: string;
    polish_grandparent_place_of_mariage: string;
    polish_grandparent_date_of_emigration: string;
    polish_grandparent_date_of_naturalization: string;
    polish_grandparent_spouse_full_name: string;
  };

  // GREAT-GRANDPARENTS (8 fields)
  greatGrandparents: {
    great_grandfather_full_name: string;
    great_grandfather_date_of_birth: string;
    great_grandfather_place_of_birth: string;
    great_grandfather_date_of_marriage: string;
    great_grandfather_place_of_marriage: string;
    great_grandfather_date_of_emigartion: string;
    great_grandfather_date_of_naturalization: string;
    great_grandmother_full_name: string;
  };
}

export interface POAData {
  imie_nazwisko_wniosko: string; // Applicant full name
  nr_dok_tozsamosci: string; // Passport/ID number
  data_pelnomocnictwa: string; // POA date
  imie_nazwisko_dziecka?: string; // Child name (for minor POA)
}

export interface RegistrationFormData {
  foreign_act_type: 'birth' | 'marriage' | 'death';
  foreign_act_location: string;
  applicant_full_name: string;
  event_location: string;
  event_date: string;
  attachments_checklist: {
    original_with_translation: boolean;
    stamp_duty_proof: boolean;
    poa: boolean;
    passport_copy: boolean;
  };
  delivery_method: 'mail_to_poa' | 'pickup';
}

// OCR Extraction Schema for Passport
export interface PassportOCRData {
  applicantFirstName: string;
  applicantLastName: string;
  applicantBirthName: string;
  applicantDateOfBirth: string; // DD-MM-YYYY
  applicantPlaceOfBirth: string;
  applicantDocumentNumber: string;
  applicantNationality: string;
  applicantCountry: string;
  documentIssueDate: string;
  documentExpiryDate: string;
  sex: 'M' | 'F';
}

// Helper function to map Intake Data to OBY Form
export function mapIntakeToOBY(intakeData: any): Partial<OBYFormData> {
  return {
    'OBY-A-GN': intakeData.first_name || '',
    'OBY-A-SN': intakeData.last_name || '',
    'OBY-A-BD': intakeData.date_of_birth || '',
    'OBY-A-BP': intakeData.place_of_birth || '',
    'OBY-A-GENDER': intakeData.sex || '',
    'OBY-A-ADDR': intakeData.address?.street || '',
    'OBY-A-POSTAL': intakeData.address?.postal_code || '',
    'OBY-A-CITY': intakeData.address?.city || '',
    'OBY-A-COUNTRY': intakeData.address?.country || '',
    'OBY-A-PHONE': intakeData.phone || '',
    'OBY-A-EMAIL': intakeData.email || '',
    'OBY-A-PASSPORT': intakeData.passport_number || '',
    'OBY-A-MAIDEN-NAME': intakeData.maiden_name || '',
    'OBY-A-NATION': intakeData.current_citizenship?.[0] || '',
    
    // Father
    'OBY-F-GN': intakeData.father_first_name || '',
    'OBY-F-SN': intakeData.father_last_name || '',
    'OBY-F-BD': intakeData.father_dob || '',
    'OBY-F-BP': intakeData.father_pob || '',
    
    // Mother
    'OBY-M-GN': intakeData.mother_first_name || '',
    'OBY-M-SN': intakeData.mother_last_name || '',
    'OBY-M-BD': intakeData.mother_dob || '',
    'OBY-M-BP': intakeData.mother_pob || '',
    'OBY-M-MAIDEN-NAME': intakeData.mother_maiden_name || '',
    
    // Paternal Grandparents
    'OBY-PGF-GN': intakeData.pgf_first_name || '',
    'OBY-PGF-SN': intakeData.pgf_last_name || '',
    'OBY-PGF-BD': intakeData.pgf_dob || '',
    'OBY-PGF-BP': intakeData.pgf_pob || '',
    'OBY-PGM-GN': intakeData.pgm_first_name || '',
    'OBY-PGM-SN': intakeData.pgm_last_name || '',
    'OBY-PGM-BD': intakeData.pgm_dob || '',
    'OBY-PGM-BP': intakeData.pgm_pob || '',
    
    // Maternal Grandparents
    'OBY-MGF-GN': intakeData.mgf_first_name || '',
    'OBY-MGF-SN': intakeData.mgf_last_name || '',
    'OBY-MGF-BD': intakeData.mgf_dob || '',
    'OBY-MGF-BP': intakeData.mgf_pob || '',
    'OBY-MGM-GN': intakeData.mgm_first_name || '',
    'OBY-MGM-SN': intakeData.mgm_last_name || '',
    'OBY-MGM-BD': intakeData.mgm_dob || '',
    'OBY-MGM-BP': intakeData.mgm_pob || '',
  };
}

// Helper function to generate POA text
export function generatePOAText(data: POAData, type: 'adult' | 'minor' | 'spouse'): string {
  const baseText = `Pełnomocnictwo (Power of Attorney)

Ja, niżej podpisany/a:
${data.imie_nazwisko_wniosko}

legitymujący/a się dokumentem tożsamości nr:
${data.nr_dok_tozsamosci}

upoważniam Romana WIŚNIEWSKIEGO, legitymującego się polskim dowodem osobistym nr CBU 675382, zamieszkałego w Warszawie 00-195, ul. Słomińskiego Zygmunta 19/134, do reprezentowania mnie w odp. Urzędzie Wojewódzkim/ Ministerstwie Spraw Wewnętrznych i Administracji celem prowadzenia spraw o stwierdzenie posiadania/ przywrócenie obywatelstwa polskiego przeze mnie${type === 'minor' ? ` oraz moje małoletnie dziecko: ${data.imie_nazwisko_dziecka}` : ''}

a także w Urzędach Stanu Cywilnego, Archiwach Państwowych, Instytucie Pamięci Narodowej i wszelkich innych archiwach/ instytucjach/ urzędach celem uzyskania/sprostowania/uzupełnienia/ odtworzenia i uzyskania poświadczonych kopii mojego/ moich krewnych polskiego aktu urodzenia/ małżeństwa/ zgonu oraz innych polskich dokumentów dotyczących mnie i mojej rodziny a także transkrypcji/ umiejscowienia zagranicznych dokumentów w polskich aktach stanu cywilnego oraz w sprawie o nadanie numeru PESEL. Wyrażam również zgodę na sprostowanie/ uzupełnienie aktów stanu cywilnego.

Jednocześnie unieważniam wszelkie inne pełnomocnictwa udzielone przeze mnie lub w moim imieniu w w/w sprawach.

Pełnomocnik może udzielić dalszego pełnomocnictwa.

data / date: ${data.data_pelnomocnictwa}    podpis / signature: __________________
`;

  return baseText;
}
