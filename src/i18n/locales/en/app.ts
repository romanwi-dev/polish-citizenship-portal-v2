const app = {
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
  
  // Dashboard
  dashboard: {
    welcome: 'Welcome',
    overview: 'Overview',
    myApplications: 'My Applications',
    documents: 'Documents',
    messages: 'Messages',
    profile: 'Profile',
    settings: 'Settings'
  },
  
  // Auth
  auth: {
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?"
  },
  
  // Documents
  documents: {
    upload: 'Upload Document',
    download: 'Download',
    delete: 'Delete',
    pending: 'Pending Review',
    approved: 'Approved',
    rejected: 'Rejected'
  },
  
  // Profile
  profile: {
    personalInfo: 'Personal Information',
    contactInfo: 'Contact Information',
    saveChanges: 'Save Changes',
    cancel: 'Cancel'
  },
  
  // Common
  common: {
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    confirm: 'Confirm',
    back: 'Back'
  },
  
  // Errors
  errors: {
    general: 'An error occurred',
    networkError: 'Network error. Please check your connection.',
    unauthorized: 'You are not authorized to access this resource',
    notFound: 'The requested resource was not found',
    validation: 'Please check your input'
  },
  
  // Onboarding
  onboarding: {
    step1Number: '01',
    step1Title: 'Initial Consultation',
    step1Desc: 'Free consultation to discuss your Polish citizenship eligibility',
    step1Cta: 'Schedule Consultation',
    step1DetailedInfo: 'During our initial consultation, we\'ll review your family history, assess your eligibility for Polish citizenship by descent, and outline the complete process. This consultation is completely free with no obligations.',
    step1KeyPoints: [
      'Free 30-minute consultation with our experts',
      'Preliminary eligibility assessment',
      'Overview of the complete citizenship process',
      'Timeline and cost breakdown',
      'Q&A session tailored to your case'
    ],
    
    step2Number: '02',
    step2Title: 'Document Review',
    step2Desc: 'We review your family documents and identify missing records',
    step2Cta: 'Start Document Review',
    step2DetailedInfo: 'Our team conducts a comprehensive review of all your family documents, including birth certificates, marriage certificates, and historical records. We identify any missing documents and create a plan to obtain them.',
    step2KeyPoints: [
      'Thorough analysis of existing documents',
      'Identification of missing records',
      'Genealogical research when needed',
      'Document authenticity verification',
      'Clear action plan for next steps'
    ],
    
    step3Number: '03',
    step3Title: 'Service Agreement',
    step3Desc: 'Sign agreement and begin official citizenship application process',
    step3Cta: 'Review Agreement',
    step3DetailedInfo: 'Once we\'ve confirmed your eligibility and reviewed your documents, we\'ll prepare a comprehensive service agreement outlining our responsibilities, timeline, and transparent pricing structure.',
    step3KeyPoints: [
      'Clear, transparent pricing with no hidden fees',
      'Detailed timeline for each stage',
      'Defined scope of services',
      'Money-back guarantee conditions',
      'Secure payment options'
    ],
    
    step4Number: '04',
    step4Title: 'Legal Representation',
    step4Desc: 'Our lawyers handle all legal aspects of your citizenship application',
    step4Cta: 'Learn More',
    step4DetailedInfo: 'Our experienced Polish citizenship lawyers will prepare and submit your complete application, communicate with Polish authorities on your behalf, and navigate any legal complexities that arise.',
    step4KeyPoints: [
      'Expert legal representation in Poland',
      'Complete application preparation',
      'Direct communication with authorities',
      'Response to any government queries',
      'Updates at every stage of the process'
    ],
    
    step5Number: '05',
    step5Title: 'Citizenship Confirmation',
    step5Desc: 'Receive your Polish citizenship confirmation and EU passport',
    step5Cta: 'View Success Stories',
    step5DetailedInfo: 'Upon approval, you\'ll receive official confirmation of your Polish citizenship. We\'ll guide you through obtaining your Polish passport and accessing all benefits of EU citizenship.',
    step5KeyPoints: [
      'Official citizenship confirmation document',
      'Assistance with Polish passport application',
      'PESEL number registration',
      'Full EU citizenship rights',
      'Ongoing support and guidance'
    ]
  }
};

export default app;
