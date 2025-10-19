# Typeform Integration Guide

## Overview
The Typeform webhook integration automatically creates new leads in the Polish Citizenship Portal when users submit the intake form.

---

## ✅ What's Already Built

### Edge Function: `typeform-webhook`
- **Location:** `supabase/functions/typeform-webhook/index.ts`
- **Status:** Fully deployed and ready
- **Capabilities:**
  - Receives Typeform webhook payloads
  - Extracts form data
  - Generates unique `LEAD-###` case codes
  - Creates cases in `cases` table
  - Populates `intake_data` table
  - Creates high-priority "Review New Typeform Lead" task

---

## 🔧 Required Setup (User Action)

### Step 1: Access Typeform Dashboard
1. Log in to Typeform at https://www.typeform.com
2. Navigate to your form: https://polishcitizenship.typeform.com/to/PS5ecU
3. Open form settings

### Step 2: Configure Webhook
1. Go to **Connect → Webhooks**
2. Click **Add a webhook**
3. Enter webhook URL:
   ```
   https://oogmuakyqadpynnrasnd.supabase.co/functions/v1/typeform-webhook
   ```
4. Set trigger: **On form submission**
5. Click **Save**

### Step 3: Verify Field Mapping
The edge function expects these field reference names in your Typeform:

| Field Reference | Expected Data | Required |
|----------------|---------------|----------|
| `first_name` | First name | Yes |
| `last_name` | Last name | Yes |
| `email` | Email address | Yes |
| `phone` | Phone number | No |
| `country` | Country of residence | No |
| `date_of_birth` | Date of birth (DD.MM.YYYY) | No |
| `father_first_name` | Father's first name | No |
| `mother_first_name` | Mother's first name | No |
| `passport_number` | Passport number | No |

**To verify field refs in Typeform:**
1. Open form editor
2. Click on each field
3. Check **Field Reference** in right panel
4. Update if needed to match table above

---

## 🧪 Testing

### Test Submission
1. Submit a test form with complete data
2. Check webhook delivery in Typeform dashboard
3. Verify new case created in Admin Dashboard
4. Check case has format: `LEAD-###`
5. Verify intake data populated
6. Verify task created for HAC review

### Check Logs
View edge function logs to debug any issues:
```
Lovable Cloud → Edge Functions → typeform-webhook → Logs
```

### Expected Success Log:
```
New lead created: LEAD-001 for [Name]
Intake data saved for case: [case_id]
Task created: Review New Typeform Lead
```

### Common Issues

**Issue:** Webhook returns 500 error  
**Solution:** Check field refs match exactly (case-sensitive)

**Issue:** Missing data in intake_data table  
**Solution:** Some fields are optional, only email/name are required

**Issue:** Case not appearing in dashboard  
**Solution:** Check RLS policies, ensure user has admin role

---

## 📊 Data Flow

```
Typeform Submission
  ↓
Webhook POST → typeform-webhook edge function
  ↓
Extract answers (findAnswer helper)
  ↓
Generate LEAD-### code
  ↓
Create case in 'cases' table
  ↓
Create intake_data in 'intake_data' table
  ↓
Create task in 'tasks' table
  ↓
Return success response
```

---

## 🎯 Success Criteria

- ✅ Webhook URL configured in Typeform
- ✅ Test submission creates `LEAD-###` case
- ✅ Case appears in Admin Dashboard
- ✅ Intake data populated in case
- ✅ Task created with "high" priority
- ✅ HAC receives notification
- ✅ No errors in edge function logs

---

## 🔒 Security Notes

- Webhook is public (no JWT verification required)
- All data validated before insertion
- RLS policies protect case access
- Duplicate submissions prevented by unique constraints
- Sensitive data (passport) masked in logs

---

## 📈 Next Steps After Configuration

1. Monitor first 5-10 submissions
2. Verify data quality
3. Adjust field mapping if needed
4. Document any custom fields added
5. Set up monitoring alerts for failures

---

**Status:** ✅ Edge function deployed | ⏳ Webhook configuration pending user action
