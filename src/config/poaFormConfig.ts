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
    title: "Adult Power of Attorney",
    pdfType: "poa-adult",
    fields: [
      { name: "applicant_first_name", label: "Applicant First Name(s) / Imię" },
      { name: "applicant_last_name", label: "Applicant Last Name / Nazwisko" },
      { name: "applicant_passport_number", label: "ID Document Number / Nr dokumentu tożsamości" },
      { name: "poa_date_filed", label: "Date Signed / Data Podpisania", type: "date" },
    ]
  },
  minor: {
    title: "Minor Power of Attorney",
    pdfType: "poa-minor",
    fields: [
      { name: "applicant_first_name", label: "Parent First Name(s) / Imię rodzica" },
      { name: "applicant_last_name", label: "Parent Last Name / Nazwisko rodzica" },
      { name: "applicant_passport_number", label: "Parent ID Document Number / Nr dokumentu tożsamości" },
      { name: "child_1_first_name", label: "Child First Name(s) / Imię dziecka" },
      { name: "child_1_last_name", label: "Child Last Name / Nazwisko dziecka" },
      { name: "poa_date_filed", label: "Date Signed / Data Podpisania", type: "date" },
    ]
  },
  spouses: {
    title: "Spouses Power of Attorney",
    pdfType: "poa-spouses",
    fields: [
      { name: "applicant_first_name", label: "Applicant First Name(s)" },
      { name: "applicant_last_name", label: "Applicant Last Name" },
      { name: "applicant_sex", label: "Applicant Sex (Male/Female)" },
      { name: "applicant_passport_number", label: "Applicant ID Document Number" },
      { name: "spouse_first_name", label: "Spouse First Name(s)" },
      { name: "spouse_last_name", label: "Spouse Last Name" },
      { name: "child_1_last_name", label: "Child 1 Surname" },
      { name: "child_2_last_name", label: "Child 2 Surname" },
      { name: "child_3_last_name", label: "Child 3 Surname" },
      { name: "poa_date_filed", label: "Date Signed / Data Podpisania", type: "date" },
    ]
  }
};
