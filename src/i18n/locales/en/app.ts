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
  }
};

export default app;
