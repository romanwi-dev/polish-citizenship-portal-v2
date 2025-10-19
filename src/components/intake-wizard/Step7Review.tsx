import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { CheckCircle2, XCircle } from "lucide-react";

interface ReviewProps {
  formData: any;
  dontKnowFields: Set<string>;
}

export const Step7Review = ({ formData, dontKnowFields }: ReviewProps) => {
  const { t } = useTranslation();
  
  const renderField = (label: string, value: any, fieldName: string) => {
    if (dontKnowFields.has(fieldName)) {
      return (
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <Badge variant="outline" className="text-xs">{t('dontKnow')}</Badge>
        </div>
      );
    }
    
    return (
      <div className="flex justify-between items-center py-2 border-b">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="text-sm">{value || '-'}</span>
      </div>
    );
  };
  
  // Define sections with their required fields
  const sections = [
    {
      name: t('steps.basicInfo'),
      fields: ['first_name', 'last_name', 'date_of_birth', 'sex'],
      isComplete: false,
      missingFields: [] as string[]
    },
    {
      name: t('steps.contact'),
      fields: ['email', 'phone'],
      isComplete: false,
      missingFields: [] as string[]
    },
    {
      name: t('steps.passport'),
      fields: ['passport_number', 'passport_issuing_country'],
      isComplete: false,
      missingFields: [] as string[]
    },
    {
      name: t('steps.family'),
      fields: ['father_first_name', 'mother_first_name'],
      isComplete: false,
      missingFields: [] as string[]
    },
  ];

  // Calculate completion for each section
  sections.forEach(section => {
    const missing = section.fields.filter(f => !formData[f] && !dontKnowFields.has(f));
    section.missingFields = missing;
    section.isComplete = missing.length === 0;
  });

  const requiredFields = ['applicant_first_name', 'applicant_last_name', 'applicant_dob', 'applicant_sex', 'applicant_email'];
  const isComplete = requiredFields.every(field => formData[field] || dontKnowFields.has(field));
  
  return (
    <div className="space-y-6">
      {/* Overall Completion Status */}
      <Card className={isComplete ? "border-green-500 bg-green-50/50 dark:bg-green-950/20" : "border-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20"}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            {isComplete ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <div>
                  <p className="font-semibold">Application Complete</p>
                  <p className="text-sm text-muted-foreground">All required fields are filled</p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-yellow-500" />
                <div>
                  <p className="font-semibold">Missing Required Fields</p>
                  <p className="text-sm text-muted-foreground">Please complete all required fields</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section Completion Cards */}
      <div className="grid gap-3">
        {sections.map(section => (
          <Card 
            key={section.name}
            className={section.isComplete 
              ? "border-green-500 bg-green-50/30 dark:bg-green-950/10" 
              : "border-yellow-500 bg-yellow-50/30 dark:bg-yellow-950/10"
            }
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{section.name}</CardTitle>
                {section.isComplete ? (
                  <Badge variant="default" className="bg-green-600">Complete</Badge>
                ) : (
                  <Badge variant="secondary">{section.missingFields.length} missing</Badge>
                )}
              </div>
            </CardHeader>
            {!section.isComplete && (
              <CardContent className="pt-0">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Missing: {section.missingFields.join(', ')}
                </p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('steps.basicInfo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {renderField(t('firstName'), formData.applicant_first_name, 'applicant_first_name')}
          {renderField(t('lastName'), formData.applicant_last_name, 'applicant_last_name')}
          {renderField(t('dateOfBirth'), formData.applicant_dob, 'applicant_dob')}
          {renderField(t('sex'), formData.applicant_sex === 'M' ? t('male') : formData.applicant_sex === 'F' ? t('female') : '', 'applicant_sex')}
        </CardContent>
      </Card>

      {/* Contact Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('steps.contact')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {renderField(t('email'), formData.applicant_email, 'applicant_email')}
          {renderField(t('phone'), formData.applicant_phone, 'applicant_phone')}
          {renderField(t('address'), formData.applicant_address, 'applicant_address')}
          {renderField(t('city'), formData.applicant_city, 'applicant_city')}
          {renderField(t('state'), formData.applicant_state, 'applicant_state')}
          {renderField(t('zipCode'), formData.applicant_zip_code, 'applicant_zip_code')}
          {renderField(t('country'), formData.applicant_country, 'applicant_country')}
        </CardContent>
      </Card>

      {/* Passport */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('steps.passport')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {renderField(t('passportNumber'), formData.applicant_passport_number ? '****' + formData.applicant_passport_number.slice(-4) : '', 'applicant_passport_number')}
          {renderField(t('passportIssueDate'), formData.applicant_passport_issue_date, 'applicant_passport_issue_date')}
          {renderField(t('passportExpiryDate'), formData.applicant_passport_expiry_date, 'applicant_passport_expiry_date')}
          {renderField(t('passportCountry'), formData.applicant_passport_issuing_country, 'applicant_passport_issuing_country')}
        </CardContent>
      </Card>

      {/* Family */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('steps.family')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {renderField(t('fatherName'), formData.father_full_name, 'father_full_name')}
          {renderField(t('motherName'), formData.mother_full_name, 'mother_full_name')}
          {renderField(t('maritalStatus'), formData.applicant_marital_status, 'applicant_marital_status')}
        </CardContent>
      </Card>

      {/* Polish Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('steps.polishConnection')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {renderField(t('polishAncestor'), formData.has_polish_ancestors === 'yes' ? t('yes') : formData.has_polish_ancestors === 'no' ? t('no') : '', 'has_polish_ancestors')}
          {formData.has_polish_ancestors === 'yes' && renderField(t('ancestorDetails'), formData.polish_ancestor_details, 'polish_ancestor_details')}
          {renderField(t('polishDocuments'), formData.has_polish_documents === 'yes' ? t('yes') : formData.has_polish_documents === 'no' ? t('no') : '', 'has_polish_documents')}
        </CardContent>
      </Card>

      {/* Additional Notes */}
      {formData.client_notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{formData.client_notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
