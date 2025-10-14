import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit Application',
      saveProgress: 'Save Progress',
      
      // Steps
      step: 'Step',
      of: 'of',
      steps: {
        basicInfo: 'Basic Information',
        contact: 'Contact Details',
        passport: 'Passport',
        family: 'Family Background',
        polishConnection: 'Polish Connection',
        additional: 'Additional Information',
        review: 'Review & Submit',
      },
      
      // Common fields
      firstName: 'First Name(s)',
      lastName: 'Last Name',
      dateOfBirth: 'Date of Birth',
      sex: 'Sex',
      male: 'Male',
      female: 'Female',
      email: 'Email Address',
      phone: 'Phone Number',
      address: 'Street Address',
      city: 'City',
      state: 'State/Province',
      zipCode: 'ZIP/Postal Code',
      country: 'Country',
      
      // Passport
      passportNumber: 'Passport Number',
      passportIssueDate: 'Issue Date',
      passportExpiryDate: 'Expiry Date',
      passportCountry: 'Issuing Country',
      
      // Family
      fatherName: "Father's Full Name",
      motherName: "Mother's Full Name",
      maritalStatus: 'Marital Status',
      single: 'Single',
      married: 'Married',
      divorced: 'Divorced',
      widowed: 'Widowed',
      
      // Polish Connection
      polishAncestor: 'Do you have Polish ancestors?',
      ancestorDetails: 'Please provide details about your Polish ancestor(s)',
      polishDocuments: 'Do you have any Polish documents?',
      
      // Options
      yes: 'Yes',
      no: 'No',
      dontKnow: "I don't know",
      optional: '(Optional)',
      required: 'Required',
      
      // Messages
      progressSaved: 'Progress saved successfully',
      submitting: 'Submitting your application...',
      submitted: 'Application submitted successfully!',
      error: 'An error occurred. Please try again.',
      pleaseComplete: 'Please complete all required fields',
    },
  },
  pl: {
    translation: {
      // Navigation
      next: 'Dalej',
      previous: 'Wstecz',
      submit: 'Złóż Wniosek',
      saveProgress: 'Zapisz Postęp',
      
      // Steps
      step: 'Krok',
      of: 'z',
      steps: {
        basicInfo: 'Podstawowe Informacje',
        contact: 'Dane Kontaktowe',
        passport: 'Paszport',
        family: 'Informacje o Rodzinie',
        polishConnection: 'Polskie Pochodzenie',
        additional: 'Dodatkowe Informacje',
        review: 'Przegląd i Złożenie',
      },
      
      // Common fields
      firstName: 'Imię (Imiona)',
      lastName: 'Nazwisko',
      dateOfBirth: 'Data Urodzenia',
      sex: 'Płeć',
      male: 'Mężczyzna',
      female: 'Kobieta',
      email: 'Adres E-mail',
      phone: 'Numer Telefonu',
      address: 'Ulica i Numer',
      city: 'Miasto',
      state: 'Województwo/Stan',
      zipCode: 'Kod Pocztowy',
      country: 'Kraj',
      
      // Passport
      passportNumber: 'Numer Paszportu',
      passportIssueDate: 'Data Wydania',
      passportExpiryDate: 'Data Ważności',
      passportCountry: 'Kraj Wydania',
      
      // Family
      fatherName: 'Pełne Imię i Nazwisko Ojca',
      motherName: 'Pełne Imię i Nazwisko Matki',
      maritalStatus: 'Stan Cywilny',
      single: 'Kawaler/Panna',
      married: 'Żonaty/Zamężna',
      divorced: 'Rozwiedziony/a',
      widowed: 'Wdowiec/Wdowa',
      
      // Polish Connection
      polishAncestor: 'Czy masz polskich przodków?',
      ancestorDetails: 'Podaj szczegóły dotyczące swoich polskich przodków',
      polishDocuments: 'Czy posiadasz jakiekolwiek polskie dokumenty?',
      
      // Options
      yes: 'Tak',
      no: 'Nie',
      dontKnow: 'Nie wiem',
      optional: '(Opcjonalne)',
      required: 'Wymagane',
      
      // Messages
      progressSaved: 'Postęp zapisany pomyślnie',
      submitting: 'Wysyłanie wniosku...',
      submitted: 'Wniosek złożony pomyślnie!',
      error: 'Wystąpił błąd. Spróbuj ponownie.',
      pleaseComplete: 'Proszę wypełnić wszystkie wymagane pola',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes
    },
  });

export default i18n;
