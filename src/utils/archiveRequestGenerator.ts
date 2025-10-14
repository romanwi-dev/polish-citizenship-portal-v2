/**
 * Archive Request Generator - Polish Letters
 * 
 * Generates official Polish letters for requesting documents from archives:
 * - Birth certificates (Akt urodzenia)
 * - Marriage certificates (Akt małżeństwa)
 * - Death certificates (Akt zgonu)
 */

export interface ArchiveRequestData {
  requestType: 'birth' | 'marriage' | 'death';
  personFirstName: string;
  personLastName: string;
  personDateOfBirth?: string;
  personPlaceOfBirth?: string;
  dateOfEvent?: string; // For marriage/death
  placeOfEvent?: string;
  archiveName: string;
  archiveAddress: string;
  archiveCity: string;
  archivePostalCode: string;
  applicantName: string;
  applicantAddress: string;
  applicantEmail: string;
  applicantPhone: string;
}

/**
 * Generates a Polish archive request letter
 */
export const generateArchiveRequest = (data: ArchiveRequestData): string => {
  const today = new Date().toLocaleDateString('pl-PL');
  
  const templates = {
    birth: `
${data.archiveName}
${data.archiveAddress}
${data.archivePostalCode} ${data.archiveCity}

${data.applicantName}
${data.applicantAddress}
Email: ${data.applicantEmail}
Tel: ${data.applicantPhone}

${today}

WNIOSEK O WYDANIE AKTU URODZENIA

Szanowni Państwo,

Zwracam się z uprzejmą prośbą o wydanie odpisu aktu urodzenia:

Dane osoby, której akt dotyczy:
- Imię i nazwisko: ${data.personFirstName} ${data.personLastName}
${data.personDateOfBirth ? `- Data urodzenia: ${data.personDateOfBirth}` : ''}
${data.personPlaceOfBirth ? `- Miejsce urodzenia: ${data.personPlaceOfBirth}` : ''}

Proszę o wydanie odpisu aktu urodzenia w formie:
☐ Odpis skrócony
☑ Odpis zupełny

Odpis jest potrzebny do celów: postępowania o stwierdzenie posiadania obywatelstwa polskiego.

W razie jakichkolwiek pytań lub konieczności dostarczenia dodatkowych informacji, proszę o kontakt:
Email: ${data.applicantEmail}
Telefon: ${data.applicantPhone}

Z poważaniem,
${data.applicantName}

---
ZAŁĄCZNIKI:
- Kopia dokumentu tożsamości wnioskodawcy
- Opłata skarbowa
`,

    marriage: `
${data.archiveName}
${data.archiveAddress}
${data.archivePostalCode} ${data.archiveCity}

${data.applicantName}
${data.applicantAddress}
Email: ${data.applicantEmail}
Tel: ${data.applicantPhone}

${today}

WNIOSEK O WYDANIE AKTU MAŁŻEŃSTWA

Szanowni Państwo,

Zwracam się z uprzejmą prośbą o wydanie odpisu aktu małżeństwa:

Dane dotyczące małżeństwa:
- Nazwisko męża: ${data.personLastName}
- Imię męża: ${data.personFirstName}
${data.dateOfEvent ? `- Data zawarcia małżeństwa: ${data.dateOfEvent}` : ''}
${data.placeOfEvent ? `- Miejsce zawarcia małżeństwa: ${data.placeOfEvent}` : ''}

Proszę o wydanie odpisu aktu małżeństwa w formie:
☐ Odpis skrócony
☑ Odpis zupełny

Odpis jest potrzebny do celów: postępowania o stwierdzenie posiadania obywatelstwa polskiego.

W razie jakichkolwiek pytań lub konieczności dostarczenia dodatkowych informacji, proszę o kontakt:
Email: ${data.applicantEmail}
Telefon: ${data.applicantPhone}

Z poważaniem,
${data.applicantName}

---
ZAŁĄCZNIKI:
- Kopia dokumentu tożsamości wnioskodawcy
- Opłata skarbowa
`,

    death: `
${data.archiveName}
${data.archiveAddress}
${data.archivePostalCode} ${data.archiveCity}

${data.applicantName}
${data.applicantAddress}
Email: ${data.applicantEmail}
Tel: ${data.applicantPhone}

${today}

WNIOSEK O WYDANIE AKTU ZGONU

Szanowni Państwo,

Zwracam się z uprzejmą prośbą o wydanie odpisu aktu zgonu:

Dane osoby zmarłej:
- Imię i nazwisko: ${data.personFirstName} ${data.personLastName}
${data.dateOfEvent ? `- Data zgonu: ${data.dateOfEvent}` : ''}
${data.placeOfEvent ? `- Miejsce zgonu: ${data.placeOfEvent}` : ''}
${data.personDateOfBirth ? `- Data urodzenia: ${data.personDateOfBirth}` : ''}

Proszę o wydanie odpisu aktu zgonu w formie:
☐ Odpis skrócony
☑ Odpis zupełny

Odpis jest potrzebny do celów: postępowania o stwierdzenie posiadania obywatelstwa polskiego.

W razie jakichkolwiek pytań lub konieczności dostarczenia dodatkowych informacji, proszę o kontakt:
Email: ${data.applicantEmail}
Telefon: ${data.applicantPhone}

Z poważaniem,
${data.applicantName}

---
ZAŁĄCZNIKI:
- Kopia dokumentu tożsamości wnioskodawcy
- Opłata skarbowa
`,
  };
  
  return templates[data.requestType];
};

/**
 * Generates filename for the archive request
 */
export const getArchiveRequestFilename = (data: ArchiveRequestData): string => {
  const typeMap = {
    birth: 'Urodzenie',
    marriage: 'Małżeństwo',
    death: 'Zgon',
  };
  
  const cleanName = `${data.personFirstName}_${data.personLastName}`.replace(/\s+/g, '_');
  const today = new Date().toISOString().split('T')[0];
  
  return `Wniosek_${typeMap[data.requestType]}_${cleanName}_${today}.txt`;
};

/**
 * Common Polish archives addresses
 */
export const POLISH_ARCHIVES = [
  {
    name: 'Archiwum Państwowe w Warszawie',
    address: 'ul. Krzywe Koło 7',
    city: 'Warszawa',
    postalCode: '00-270',
  },
  {
    name: 'Archiwum Państwowe w Krakowie',
    address: 'ul. Sienna 16',
    city: 'Kraków',
    postalCode: '30-960',
  },
  {
    name: 'Archiwum Państwowe w Poznaniu',
    address: 'ul. 23 Lutego 41/43',
    city: 'Poznań',
    postalCode: '61-741',
  },
  {
    name: 'Archiwum Państwowe we Wrocławiu',
    address: 'ul. Pomorska 2',
    city: 'Wrocław',
    postalCode: '50-215',
  },
  {
    name: 'Archiwum Państwowe w Łodzi',
    address: 'pl. Wolności 1',
    city: 'Łódź',
    postalCode: '91-415',
  },
];
