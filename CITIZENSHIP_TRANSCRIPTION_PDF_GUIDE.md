# 📋 CITIZENSHIP & TRANSCRIPTION PDF GENERATION GUIDE

## 🎯 PURPOSE
This guide explains how to ensure successful PDF generation for **Citizenship Applications (OBY)** and **Civil Registry Transcription** forms.

---

## ✅ REQUIRED DATA FOR CITIZENSHIP PDF

### **Applicant Information** (CRITICAL)
| Field | Database Column | Required? | Format |
|-------|----------------|-----------|---------|
| First Name | `applicant_first_name` | ✅ YES | Text |
| Last Name | `applicant_last_name` | ✅ YES | Text |
| Maiden Name | `applicant_maiden_name` | ⚠️ If female | Text |
| Date of Birth | `applicant_dob` | ✅ YES | DD.MM.YYYY or YYYY-MM-DD |
| Place of Birth | `applicant_pob` | ✅ YES | City, Country |
| Sex | `applicant_sex` | ✅ YES | Male/Female |
| Current Citizenship | `applicant_current_citizenship` | ✅ YES | Country name |
| PESEL | `applicant_pesel` | ⚠️ Optional | 11 digits |

### **Mother Information** (CRITICAL)
| Field | Database Column | Required? | Format |
|-------|----------------|-----------|---------|
| First Name | `mother_first_name` | ✅ YES | Text |
| Last Name | `mother_last_name` | ✅ YES | Text |
| Maiden Name | `mother_maiden_name` | ✅ YES | Text |
| Date of Birth | `mother_dob` | ✅ YES | DD.MM.YYYY or YYYY-MM-DD |
| Place of Birth | `mother_pob` | ✅ YES | City, Country |
| PESEL | `mother_pesel` | ⚠️ Optional | 11 digits |

### **Father Information** (CRITICAL)
| Field | Database Column | Required? | Format |
|-------|----------------|-----------|---------|
| First Name | `father_first_name` | ✅ YES | Text |
| Last Name | `father_last_name` | ✅ YES | Text |
| Date of Birth | `father_dob` | ✅ YES | DD.MM.YYYY or YYYY-MM-DD |
| Place of Birth | `father_pob` | ✅ YES | City, Country |
| PESEL | `father_pesel` | ⚠️ Optional | 11 digits |

### **Maternal Grandparents (MGF, MGM)** (CRITICAL)
| Field | Database Column | Required? | Format |
|-------|----------------|-----------|---------|
| MGF First Name | `mgf_first_name` | ✅ YES | Text |
| MGF Last Name | `mgf_last_name` | ✅ YES | Text |
| MGF Date of Birth | `mgf_dob` | ✅ YES | DD.MM.YYYY or YYYY-MM-DD |
| MGF Place of Birth | `mgf_pob` | ✅ YES | City, Country |
| MGM First Name | `mgm_first_name` | ✅ YES | Text |
| MGM Last Name | `mgm_last_name` | ✅ YES | Text |
| MGM Maiden Name | `mgm_maiden_name` | ✅ YES | Text |
| MGM Date of Birth | `mgm_dob` | ✅ YES | DD.MM.YYYY or YYYY-MM-DD |
| MGM Place of Birth | `mgm_pob` | ✅ YES | City, Country |

### **Paternal Grandparents (PGF, PGM)** (CRITICAL)
| Field | Database Column | Required? | Format |
|-------|----------------|-----------|---------|
| PGF First Name | `pgf_first_name` | ✅ YES | Text |
| PGF Last Name | `pgf_last_name` | ✅ YES | Text |
| PGF Date of Birth | `pgf_dob` | ✅ YES | DD.MM.YYYY or YYYY-MM-DD |
| PGF Place of Birth | `pgf_pob` | ✅ YES | City, Country |
| PGM First Name | `pgm_first_name` | ✅ YES | Text |
| PGM Last Name | `pgm_last_name` | ✅ YES | Text |
| PGM Maiden Name | `pgm_maiden_name` | ✅ YES | Text |
| PGM Date of Birth | `pgm_dob` | ✅ YES | DD.MM.YYYY or YYYY-MM-DD |
| PGM Place of Birth | `pgm_pob` | ✅ YES | City, Country |

### **Optional Fields**
- Applicant marriage date/place
- Parents marriage date/place
- Grandparents marriage dates/places
- Biographical notes (życiorys) for each person
- PESEL numbers

---

## ✅ REQUIRED DATA FOR TRANSCRIPTION PDF

### **Foreign Act Details** (CRITICAL)
| Field | Database Column | Required? | Format |
|-------|----------------|-----------|---------|
| Foreign Country | `foreign_country` | ✅ YES | Country name |
| Birth City | `birth_city` | ✅ YES | City name |
| Birth Country | `birth_country` | ✅ YES | Country name |
| Birth Date | `birth_date` | ✅ YES | DD.MM.YYYY |

### **Applicant Details** (CRITICAL)
| Field | Database Column | Required? | Format |
|-------|----------------|-----------|---------|
| First Name | `applicant_first_name` | ✅ YES | Text |
| Last Name | `applicant_last_name` | ✅ YES | Text |

### **Supplementation Info** (Page 3)
| Field | Database Column | Required? | Format |
|-------|----------------|-----------|---------|
| Birth Certificate Number | `birth_certificate_number` | ⚠️ Optional | Text |
| Birth Year | `birth_year` | ⚠️ Optional | YYYY |
| Father Last Name | `father_last_name` | ⚠️ Optional | Text |
| Mother Maiden Name | `mother_maiden_name` | ⚠️ Optional | Text |

---

## 🔧 DATE FORMAT RULES

### **Forms Accept**
- `DD.MM.YYYY` (e.g., 15.03.1985)

### **Database Stores**
- `YYYY-MM-DD` (ISO format, e.g., 1985-03-15)

### **PDF Receives**
- **Split into 3 fields**: `day`, `month`, `year`
- Example: `applicant_dob` → `dzien_uro` (15), `miesiac_uro` (03), `rok_uro` (1985)

**⚠️ CRITICAL**: The system automatically converts between these formats. No manual intervention needed!

---

## 🚨 TROUBLESHOOTING

### **Problem: Fill Rate < 50%**
**Cause**: Missing required fields in database

**Solution**:
1. Go to Citizenship Form or Civil Registry Form
2. Check completion percentage
3. Fill in ALL required fields (marked with ✅ YES above)
4. Save form
5. Regenerate PDF

### **Problem: Dates Not Appearing in PDF**
**Cause**: Invalid date format

**Solution**:
1. Verify date is in `DD.MM.YYYY` format on form
2. Check database column contains valid ISO date (`YYYY-MM-DD`)
3. Regenerate PDF

### **Problem: Names Missing**
**Cause**: Special characters or empty fields

**Solution**:
1. Check for Polish characters (ą, ę, ć, etc.) - these are supported
2. Verify no fields are blank
3. Check spelling
4. Regenerate PDF

### **Problem: Grandparent Data Missing**
**Cause**: Only 2 grandparents filled instead of 4

**Solution**:
1. Citizenship PDF requires **ALL 4 grandparents**:
   - Maternal Grandfather (MGF)
   - Maternal Grandmother (MGM)
   - Paternal Grandfather (PGF)
   - Paternal Grandmother (PGM)
2. Fill in ALL 4 with complete data
3. Regenerate PDF

---

## 📊 EXPECTED FILL RATES

### **With Complete Data**
- **Citizenship PDF**: 80-90% fill rate (140 total fields)
- **Transcription PDF**: 90-95% fill rate (31 total fields)

### **With Minimal Data**
- **Citizenship PDF**: 40-50% fill rate (only required fields)
- **Transcription PDF**: 50-60% fill rate (only required fields)

### **Red Flags**
- ❌ **< 40% fill rate** → Critical data missing, check all required fields
- ⚠️ **40-70% fill rate** → Good core data, optional fields missing
- ✅ **> 70% fill rate** → Excellent data coverage

---

## 💡 BEST PRACTICES

### **Before Generating PDF**
1. ✅ Check form completion percentage (should be > 70%)
2. ✅ Verify all required fields are filled
3. ✅ Confirm dates are in correct format
4. ✅ Save form before generating

### **After Generating PDF**
1. ✅ Check fill rate in success message
2. ✅ Review PDF preview for accuracy
3. ✅ If fill rate < 70%, identify missing fields
4. ✅ Download editable PDF for manual completion if needed

### **Data Collection Strategy**
1. Start with applicant data (fastest to collect)
2. Then parents data
3. Then grandparents data (most time-consuming)
4. Add optional fields (marriage dates, biographical notes) last
5. Generate draft PDF early to identify gaps

---

## 🎓 TECHNICAL DETAILS (For Developers)

### **How PDF Generation Works**
1. User clicks "Generate PDF" button
2. System calls `pdf-simple` edge function with `templateType='citizenship'` or `'transcription'`
3. Edge function:
   - Downloads PDF template from storage
   - Fetches case data from `master_table`
   - Maps database columns to PDF field names using `FIELD_MAPS`
   - Uses **smart resolver** to handle:
     - Date splitting (`applicant_dob` → `day`, `month`, `year`)
     - Field concatenation (`first_name|last_name` → `"Jan Kowalski"`)
     - Nested objects (`applicant_address.city`)
     - Special values (checkboxes, defaults)
   - Fills PDF fields
   - Uploads to storage
   - Returns signed URL

### **Smart Resolver Handles**
- ✅ Date splitting (ISO → day/month/year)
- ✅ Field concatenation (pipe-separated)
- ✅ Nested objects (dot notation)
- ✅ Checkbox defaults
- ✅ Special constants (like USC office name)

### **NIE DOTYCZY Logic**
For citizenship PDFs, the system automatically fills irrelevant family lines with "NIE DOTYCZY":
- If **father is Polish** → maternal side gets "NIE DOTYCZY"
- If **mother is Polish** → paternal side gets "NIE DOTYCZY"

This prevents confusion and makes the PDF cleaner.

---

## 📝 EXAMPLE WORKFLOW

### **Scenario**: Generate citizenship PDF for Jan Kowalski

**Step 1**: Go to Citizenship Form
- Fill: Jan Kowalski, born 15.03.1985 in Warsaw, Poland
- Fill: Mother: Maria Kowalska (née Nowak), born 20.05.1960
- Fill: Father: Piotr Kowalski, born 10.07.1958
- Fill: All 4 grandparents with complete data
- **Completion: 85%**

**Step 2**: Click "Generate Citizenship Application"
- System processes data
- Success message: "PDF ready! Filled 119/140 fields (85%)"

**Step 3**: Review PDF
- Verify names are correct
- Check dates appear correctly
- Confirm all 4 grandparents are present

**Step 4**: Download
- Click "Download Editable PDF"
- Open in Adobe Acrobat
- Manually fill remaining 15% if needed

---

## ⚠️ CRITICAL NOTES

1. **Always save form before generating PDF**
2. **Date format is automatic** - system handles conversion
3. **Fill rate matters** - aim for > 70%
4. **All 4 grandparents required** for citizenship
5. **Polish characters (ą, ę, ć, ł, ń, ó, ś, ź, ż) are supported**
6. **PESEL is optional** but recommended
7. **Biographical notes are optional** but add value

---

## 🔗 RELATED RESOURCES

- **Citizenship Form**: `/admin/citizenship/:id`
- **Civil Registry Form**: `/admin/civil-registry/:id`
- **PDF Templates**: Stored in Supabase `pdf-templates` bucket
- **Generated PDFs**: Stored in `pdf-outputs/generated/`
- **Edge Function**: `supabase/functions/pdf-simple/index.ts`

---

**Last Updated**: 2025-01-09  
**Version**: 1.0  
**AI Agent**: Phase EX Implementation Complete
