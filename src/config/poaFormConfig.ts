export interface POAField {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
}

export interface POAFormConfig {
  title: string;
  pdfType: string;
  fields: POAField[];
}

export const poaFormConfigs: Record<string, POAFormConfig> = {
  adult: {
    title: "POA Adult",
    pdfType: "poa-adult",
    fields: [
      { name: "applicant_first_name", label: "Applicant given names / Imię/ imiona" },
      { name: "applicant_last_name", label: "Applicant full last name / Nazwisko" },
      { name: "applicant_passport_number", label: "ID/ passport number / Nr dokumentu tożsamości" },
    ]
  },
  minor: {
    title: "POA Minor",
    pdfType: "poa-minor",
    fields: [
      { name: "applicant_first_name", label: "Parent given names / Imię/ imiona rodzica" },
      { name: "applicant_last_name", label: "Parent full last name / Nazwisko rodzica" },
      { name: "applicant_passport_number", label: "Parent ID/ passport number / Nr dokumentu tożsamości" },
      { name: "child_1_first_name", label: "Child given names / Imię/ imiona dziecka" },
      { name: "child_1_last_name", label: "Child full last name / Nazwisko dziecka" },
    ]
  },
  spouses: {
    title: "POA Spouses",
    pdfType: "poa-spouses",
    fields: [
      { name: "applicant_first_name", label: "Applicant given names / Imię/ imiona" },
      { name: "applicant_last_name", label: "Applicant full last name / Nazwisko" },
      { name: "applicant_sex", label: "Applicant sex (Male/Female)" },
      { name: "applicant_passport_number", label: "Applicant ID/ passport number / Nr dokumentu tożsamości" },
      { name: "spouse_first_name", label: "Spouse given names / Imię/ imiona" },
      { name: "spouse_last_name", label: "Spouse full last name / Nazwisko" },
      { name: "child_1_last_name", label: "Child 1 surname" },
      { name: "child_2_last_name", label: "Child 2 surname" },
      { name: "child_3_last_name", label: "Child 3 surname" },
      { name: "child_4_last_name", label: "Child 4 surname" },
    ]
  }
};
