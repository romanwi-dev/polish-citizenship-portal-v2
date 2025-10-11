// Polish Citizenship Case Stages
// Comprehensive stage definitions for Polish citizenship by descent cases

export interface Stage {
  id: string;
  name: string;
  description: string;
  part: number;
  isClientVisible: boolean;
  isMilestone: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  order: number;
}

export const CASE_STAGES: Stage[] = [
  // PART 1 - FIRST STEPS (8 stages)
  { id: 'first_contact', name: 'First Contact', description: 'Initial client contact', part: 1, isClientVisible: true, isMilestone: false, priority: 'high', order: 1 },
  { id: 'contact_waving', name: 'Contact Waving', description: 'Follow-up communications', part: 1, isClientVisible: false, isMilestone: false, priority: 'medium', order: 2 },
  { id: 'answering_inquiry', name: 'Answering Inquiry', description: 'Responding to client questions', part: 1, isClientVisible: false, isMilestone: false, priority: 'medium', order: 3 },
  { id: 'citizenship_test', name: 'Citizenship Test', description: 'Initial eligibility test', part: 1, isClientVisible: true, isMilestone: true, priority: 'high', order: 4 },
  { id: 'family_tree', name: 'Family Tree', description: 'Creating family tree diagram', part: 1, isClientVisible: true, isMilestone: true, priority: 'high', order: 5 },
  { id: 'eligibility_examination', name: 'Eligibility Examination', description: 'Eligibility examination (yes, maybe, no)', part: 1, isClientVisible: false, isMilestone: false, priority: 'high', order: 6 },
  { id: 'difficulty_evaluation', name: 'Case Difficulty Evaluation', description: 'Case difficulty evaluation on 1-10 scale', part: 1, isClientVisible: false, isMilestone: false, priority: 'medium', order: 7 },
  { id: 'eligibility_call', name: 'Eligibility Call', description: 'Initial eligibility consultation call', part: 1, isClientVisible: true, isMilestone: true, priority: 'high', order: 8 },

  // PART 2 - TERMS & PRICING (4 stages)
  { id: 'initial_assessment_email', name: 'Initial Assessment Email', description: 'Emailing initial assessment to client', part: 2, isClientVisible: true, isMilestone: false, priority: 'high', order: 9 },
  { id: 'full_process_info', name: 'Full Process Info', description: 'Emailing full process info with pricing', part: 2, isClientVisible: true, isMilestone: false, priority: 'high', order: 10 },
  { id: 'client_confirmation', name: 'Client Confirmation', description: 'Client\'s confirmation to proceed', part: 2, isClientVisible: true, isMilestone: true, priority: 'critical', order: 11 },
  { id: 'documents_list_email', name: 'Documents List Email', description: 'Emailing list of all needed documents', part: 2, isClientVisible: true, isMilestone: false, priority: 'high', order: 12 },

  // PART 3 - ADVANCE & ACCOUNT (2 stages)
  { id: 'advance_payment', name: 'Advance Payment', description: 'Receiving advance payment from client', part: 3, isClientVisible: true, isMilestone: true, priority: 'critical', order: 13 },
  { id: 'opening_account', name: 'Opening Account', description: 'Opening client account on portal', part: 3, isClientVisible: true, isMilestone: true, priority: 'high', order: 14 },

  // PART 4 - DETAILS & POAs (4 stages)
  { id: 'basic_details', name: 'Basic Details Provided', description: 'Client provides basic details (passport, address, birth certificate, phone, family history)', part: 4, isClientVisible: true, isMilestone: false, priority: 'high', order: 15 },
  { id: 'preparing_poas', name: 'Preparing POAs', description: 'Preparing the power of attorney documents', part: 4, isClientVisible: true, isMilestone: false, priority: 'high', order: 16 },
  { id: 'emailing_poas', name: 'Emailing POAs', description: 'Sending POAs to client for signature', part: 4, isClientVisible: true, isMilestone: false, priority: 'high', order: 17 },
  { id: 'poas_received', name: 'POAs Received', description: 'Client sends signed POAs by Fedex to Warsaw office', part: 4, isClientVisible: true, isMilestone: true, priority: 'critical', order: 18 },

  // PART 5 - DATA & APPLICATION (7 stages)
  { id: 'master_form', name: 'Master Form', description: 'Client fills master form with all required data', part: 5, isClientVisible: true, isMilestone: true, priority: 'critical', order: 19 },
  { id: 'ai_paperwork', name: 'AI Paperwork Generation', description: 'AI agent generates all required paperwork', part: 5, isClientVisible: true, isMilestone: false, priority: 'medium', order: 20 },
  { id: 'draft_application', name: 'Draft Application', description: 'Draft citizenship application prepared', part: 5, isClientVisible: true, isMilestone: false, priority: 'high', order: 21 },
  { id: 'application_submitted', name: 'Application Submitted', description: 'Submitting citizenship application', part: 5, isClientVisible: true, isMilestone: true, priority: 'critical', order: 22 },
  { id: 'awaiting_initial_response', name: 'Awaiting Initial Response', description: 'Awaiting initial response (10-18 months)', part: 5, isClientVisible: true, isMilestone: true, priority: 'medium', order: 23 },
  { id: 'email_submission_copy', name: 'Email Submission Copy', description: 'Emailing copy of official application submission', part: 5, isClientVisible: true, isMilestone: false, priority: 'low', order: 24 },
  { id: 'add_copy_to_account', name: 'Add Copy to Account', description: 'Adding submission copy to client account', part: 5, isClientVisible: true, isMilestone: false, priority: 'low', order: 25 },

  // PART 6 - LOCAL DOCUMENTS (6 stages)
  { id: 'documents_clarification', name: 'Documents List Clarification', description: 'Clarifying required documents with client', part: 6, isClientVisible: true, isMilestone: false, priority: 'high', order: 26 },
  { id: 'gathering_local_docs', name: 'Gathering Local Documents', description: 'Client gathering local documents', part: 6, isClientVisible: true, isMilestone: false, priority: 'high', order: 27 },
  { id: 'local_agent_advising', name: 'Local Agent Advising', description: 'Advising by local agent', part: 6, isClientVisible: false, isMilestone: false, priority: 'medium', order: 28 },
  { id: 'partners_collecting', name: 'Partners Collecting Documents', description: 'Connecting to partners to help collect documents', part: 6, isClientVisible: true, isMilestone: false, priority: 'medium', order: 29 },
  { id: 'receiving_documents', name: 'Receiving Documents', description: 'Receiving documents from client/partners', part: 6, isClientVisible: false, isMilestone: false, priority: 'high', order: 30 },
  { id: 'examining_documents', name: 'Examining Documents', description: 'Examining and choosing documents to translate and file', part: 6, isClientVisible: false, isMilestone: false, priority: 'high', order: 31 },

  // PART 7 - POLISH DOCUMENTS (6 stages)
  { id: 'polish_archives', name: 'Polish Archives Search', description: 'Searching Polish archives for historical documents', part: 7, isClientVisible: true, isMilestone: false, priority: 'high', order: 32 },
  { id: 'international_archives', name: 'International Archives Search', description: 'Searching international archives', part: 7, isClientVisible: true, isMilestone: false, priority: 'medium', order: 33 },
  { id: 'family_possessions', name: 'Family Possessions Search', description: 'Searching family possessions for old Polish documents', part: 7, isClientVisible: true, isMilestone: false, priority: 'medium', order: 34 },
  { id: 'partners_archives', name: 'Partners Processing Search', description: 'Connecting to partners to process each search', part: 7, isClientVisible: true, isMilestone: false, priority: 'medium', order: 35 },
  { id: 'receiving_archival', name: 'Receiving Archival Documents', description: 'Receiving documents from archives', part: 7, isClientVisible: false, isMilestone: false, priority: 'high', order: 36 },
  { id: 'examining_archival', name: 'Examining Archival Documents', description: 'Examining archival documents for filing', part: 7, isClientVisible: false, isMilestone: false, priority: 'high', order: 37 },

  // PART 8 - TRANSLATIONS (4 stages)
  { id: 'ai_translations', name: 'AI Translations', description: 'AI translation service on portal', part: 8, isClientVisible: true, isMilestone: false, priority: 'medium', order: 38 },
  { id: 'certified_translations', name: 'Certified Translations', description: 'Certifying translations with Polish Certified Sworn Translator', part: 8, isClientVisible: true, isMilestone: false, priority: 'high', order: 39 },
  { id: 'translations_agent', name: 'Translations Agent Process', description: 'Dedicated translations agent processing', part: 8, isClientVisible: true, isMilestone: false, priority: 'medium', order: 40 },
  { id: 'translation_check', name: 'Translation Double-Check', description: 'Independent agent double-checking translations', part: 8, isClientVisible: false, isMilestone: false, priority: 'high', order: 41 },

  // PART 9 - FILING DOCUMENTS (3 stages)
  { id: 'submit_local_docs', name: 'Submit Local Documents', description: 'Submitting local documents (birth, marriage certificates, etc.)', part: 9, isClientVisible: true, isMilestone: true, priority: 'high', order: 42 },
  { id: 'submit_family_info', name: 'Submit Family Information', description: 'Submitting detailed family information', part: 9, isClientVisible: true, isMilestone: false, priority: 'high', order: 43 },
  { id: 'filing_before_response', name: 'Filing Before Response', description: 'Filing all documents before initial response if possible', part: 9, isClientVisible: false, isMilestone: false, priority: 'medium', order: 44 },

  // PART 10 - CIVIL ACTS (5 stages)
  { id: 'prepare_civil_apps', name: 'Prepare Civil Acts Applications', description: 'Preparing Polish civil acts applications', part: 10, isClientVisible: true, isMilestone: false, priority: 'high', order: 45 },
  { id: 'civil_acts_payment', name: 'Civil Acts Payment', description: 'Charging payment for Polish civil acts', part: 10, isClientVisible: true, isMilestone: true, priority: 'critical', order: 46 },
  { id: 'civil_acts_agent', name: 'Civil Acts Agent', description: 'Dedicated civil acts agent supervision', part: 10, isClientVisible: true, isMilestone: false, priority: 'medium', order: 47 },
  { id: 'submit_civil_apps', name: 'Submit Civil Applications', description: 'Submitting applications to Polish Civil Registry office', part: 10, isClientVisible: true, isMilestone: false, priority: 'high', order: 48 },
  { id: 'receive_civil_certs', name: 'Receive Civil Certificates', description: 'Receiving Polish birth and marriage certificates', part: 10, isClientVisible: true, isMilestone: true, priority: 'high', order: 49 },

  // PART 11 - INITIAL RESPONSE (5 stages)
  { id: 'initial_response', name: 'Initial Response Received', description: 'Receiving initial response from Masovian Voivoda\'s office', part: 11, isClientVisible: true, isMilestone: true, priority: 'critical', order: 50 },
  { id: 'evaluate_demands', name: 'Evaluate Demands', description: 'Evaluating demands put by government', part: 11, isClientVisible: false, isMilestone: false, priority: 'high', order: 51 },
  { id: 'send_letter_copy', name: 'Send Letter Copy', description: 'Sending copy of letter with explanations to client', part: 11, isClientVisible: true, isMilestone: false, priority: 'high', order: 52 },
  { id: 'extend_term', name: 'Extend Term', description: 'Extending term of citizenship procedure', part: 11, isClientVisible: true, isMilestone: true, priority: 'high', order: 53 },
  { id: 'await_additional_evidence', name: 'Awaiting Additional Evidence', description: 'Awaiting additional documents and info from client', part: 11, isClientVisible: true, isMilestone: false, priority: 'medium', order: 54 },

  // PART 11.5 - WSC LETTER STAGE (NEW - Between Initial Response and Push Schemes)
  { id: 'wsc_letter_received', name: 'WSC Letter Received', description: 'Letter from WSC (Masovian Voivoda) received', part: 11.5, isClientVisible: true, isMilestone: true, priority: 'critical', order: 54.5 },
  { id: 'wsc_letter_review', name: 'WSC Letter Review', description: 'HAC reviewing letter content and deadline', part: 11.5, isClientVisible: false, isMilestone: false, priority: 'high', order: 54.6 },
  { id: 'wsc_strategy_set', name: 'WSC Strategy Set', description: 'Response strategy determined (PUSH/NUDGE/SITDOWN)', part: 11.5, isClientVisible: true, isMilestone: true, priority: 'high', order: 54.7 },

  // PART 12 - PUSH SCHEMES (6 stages)
  { id: 'offer_push_schemes', name: 'Offer Push Schemes', description: 'Offering pushing schemes to client: PUSH, NUDGE, SIT-DOWN', part: 12, isClientVisible: true, isMilestone: false, priority: 'medium', order: 55 },
  { id: 'explain_schemes', name: 'Explain Schemes', description: 'Explaining schemes in detail', part: 12, isClientVisible: true, isMilestone: false, priority: 'medium', order: 56 },
  { id: 'schemes_payment', name: 'Schemes Payment', description: 'Payments for push schemes', part: 12, isClientVisible: true, isMilestone: false, priority: 'medium', order: 57 },
  { id: 'introduce_schemes', name: 'Introduce Schemes', description: 'Introducing schemes in practice', part: 12, isClientVisible: true, isMilestone: true, priority: 'high', order: 58 },
  { id: 'second_response', name: 'Second Response', description: 'Receiving 2nd response from government', part: 12, isClientVisible: true, isMilestone: true, priority: 'critical', order: 59 },
  { id: 'schemes_again', name: 'Schemes Again', description: 'Introducing schemes again', part: 12, isClientVisible: true, isMilestone: false, priority: 'medium', order: 60 },

  // PART 13 - CITIZENSHIP DECISION (3 stages)
  { id: 'citizenship_decision', name: 'Citizenship Decision', description: 'Polish citizenship confirmation decision received', part: 13, isClientVisible: true, isMilestone: true, priority: 'critical', order: 61 },
  { id: 'email_decision_copy', name: 'Email Decision Copy', description: 'Emailing copy of decision and adding to account', part: 13, isClientVisible: true, isMilestone: false, priority: 'high', order: 62 },
  { id: 'appeal_if_negative', name: 'Appeal (If Negative)', description: 'Preparing and filing appeal to Ministry of Interior if decision negative', part: 13, isClientVisible: true, isMilestone: false, priority: 'critical', order: 63 },

  // PART 14 - POLISH PASSPORT (6 stages)
  { id: 'prepare_passport_docs', name: 'Prepare Passport Documents', description: 'Preparing all documents for Polish passport application', part: 14, isClientVisible: true, isMilestone: false, priority: 'high', order: 64 },
  { id: 'final_payment', name: 'Final Payment', description: 'Charging the final payment', part: 14, isClientVisible: true, isMilestone: true, priority: 'critical', order: 65 },
  { id: 'send_docs_fedex', name: 'Send Documents by Fedex', description: 'Sending all documents by Fedex', part: 14, isClientVisible: true, isMilestone: false, priority: 'high', order: 66 },
  { id: 'schedule_consulate', name: 'Schedule Consulate Visit', description: 'Scheduling visit at Polish Consulate', part: 14, isClientVisible: true, isMilestone: false, priority: 'high', order: 67 },
  { id: 'client_applies_passport', name: 'Client Applies for Passport', description: 'Client applies for Polish passport', part: 14, isClientVisible: true, isMilestone: false, priority: 'high', order: 68 },
  { id: 'passport_obtained', name: 'Polish Passport Obtained', description: 'Polish passport obtained - CASE COMPLETE', part: 14, isClientVisible: true, isMilestone: true, priority: 'critical', order: 69 },

  // PART 15 - EXTENDED SERVICES (1 stage)
  { id: 'extended_services', name: 'Extended Family Legal Services', description: 'Additional services for extended family members', part: 15, isClientVisible: true, isMilestone: true, priority: 'low', order: 70 },
];

export const PART_NAMES = [
  'First Steps',
  'Terms & Pricing',
  'Advance & Account',
  'Details & POAs',
  'Data & Application',
  'Local Documents',
  'Polish Documents',
  'Translations',
  'Filing Documents',
  'Civil Acts',
  'Initial Response',
  'WSC Letter', // NEW
  'Push Schemes',
  'Citizenship Decision',
  'Polish Passport',
  'Extended Services',
];

export const getStagesByPart = (part: number): Stage[] => {
  return CASE_STAGES.filter(stage => stage.part === part);
};

export const getStageById = (id: string): Stage | undefined => {
  return CASE_STAGES.find(stage => stage.id === id);
};

export const getTotalStages = () => CASE_STAGES.length;

export const getClientVisibleStages = () => 
  CASE_STAGES.filter(stage => stage.isClientVisible).length;

export const getMilestones = () => 
  CASE_STAGES.filter(stage => stage.isMilestone).length;

export const getPartStageCount = (part: number) => 
  CASE_STAGES.filter(stage => stage.part === part).length;
