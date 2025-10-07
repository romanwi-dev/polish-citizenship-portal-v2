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
      { name: "applicant_first_name", label: "Applicant Given Names / Imię" },
      { name: "applicant_last_name", label: "Applicant Full Last Name / Nazwisko" },
      { name: "applicant_passport_number", label: "ID Document Number / Nr dokumentu tożsamości" },
      { name: "poa_date_filed", label: "Date Signed / Data Podpisania", type: "date" },
    ]
  },
  minor: {
    title: "Minor Power of Attorney",
    pdfType: "poa-minor",
    fields: [
      { name: "applicant_first_name", label: "Parent Given Names / Imię rodzica" },
      { name: "applicant_last_name", label: "Parent Full Last Name / Nazwisko rodzica" },
      { name: "applicant_passport_number", label: "Parent ID Document Number / Nr dokumentu tożsamości" },
      { name: "child_1_first_name", label: "Child Given Names / Imię dziecka" },
      { name: "child_1_last_name", label: "Child Full Last Name / Nazwisko dziecka" },
      { name: "poa_date_filed", label: "Date Signed / Data Podpisania", type: "date" },
    ]
  },
  spouses: {
    title: "Spouses Power of Attorney",
    pdfType: "poa-spouses",
    fields: [
      { name: "applicant_first_name", label: "Applicant Given Names" },
      { name: "applicant_last_name", label: "Applicant Full Last Name" },
      { name: "applicant_sex", label: "Applicant Sex (Male/Female)" },
      { name: "applicant_passport_number", label: "Applicant ID Document Number" },
      { name: "spouse_first_name", label: "Spouse Given Names" },
      { name: "spouse_last_name", label: "Spouse Full Last Name" },
      { name: "child_1_last_name", label: "Child 1 Surname" },
      { name: "child_2_last_name", label: "Child 2 Surname" },
      { name: "child_3_last_name", label: "Child 3 Surname" },
      { name: "poa_date_filed", label: "Date Signed / Data Podpisania", type: "date" },
    ]
  }
};
