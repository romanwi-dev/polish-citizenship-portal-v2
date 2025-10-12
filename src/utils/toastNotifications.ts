import { toast } from "sonner";

// Standardized toast notifications for consistent UX across the app

export const toastSuccess = {
  caseCreated: () => toast.success("Case created successfully"),
  caseUpdated: () => toast.success("Case updated successfully"),
  caseDeleted: () => toast.success("Case deleted successfully"),
  statusUpdated: () => toast.success("Status updated successfully"),
  processingModeUpdated: () => toast.success("Processing mode updated"),
  documentUploaded: () => toast.success("Document uploaded successfully"),
  documentDeleted: () => toast.success("Document deleted successfully"),
  formSaved: () => toast.success("Form saved successfully"),
  photoUploaded: () => toast.success("Photo uploaded successfully"),
  dataCopied: () => toast.success("Copied to clipboard"),
  pdfGenerated: () => toast.success("PDF generated successfully"),
  refreshed: (entity: string) => toast.success(`${entity} refreshed`),
};

export const toastError = {
  generic: (action: string) => toast.error(`Failed to ${action}. Please try again.`),
  caseCreate: () => toast.error("Failed to create case. Please try again."),
  caseUpdate: () => toast.error("Failed to update case. Please try again."),
  caseDelete: () => toast.error("Failed to delete case. Please try again."),
  statusUpdate: () => toast.error("Failed to update status. Please try again."),
  documentUpload: () => toast.error("Failed to upload document. Please try again."),
  documentDelete: () => toast.error("Failed to delete document. Please try again."),
  formLoad: () => toast.error("Failed to load form data. Please try again."),
  formSave: () => toast.error("Failed to save form. Please try again."),
  photoUpload: () => toast.error("Failed to upload photo. Please try again."),
  pdfGeneration: () => toast.error("Failed to generate PDF. Please try again."),
  networkError: () => toast.error("Network error. Please check your connection."),
  unauthorized: () => toast.error("You don't have permission to perform this action."),
};

export const toastInfo = {
  processing: (action: string) => toast.info(`Processing ${action}...`),
  loading: (entity: string) => toast.info(`Loading ${entity}...`),
  autoSaving: () => toast.info("Auto-saving...", { duration: 1000 }),
  formIncomplete: () => toast.info("Please fill in all required fields"),
};

export const toastWarning = {
  unsavedChanges: () => toast.warning("You have unsaved changes"),
  formIncomplete: () => toast.warning("Form is incomplete. Some fields are missing."),
  duplicateEntry: () => toast.warning("This entry already exists"),
  quotaExceeded: () => toast.warning("Storage quota exceeded"),
};

// Custom toast with promise for async operations
export const toastAsync = {
  operation: async <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, messages);
  },
};
