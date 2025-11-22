# Form System Testing Checklist

## Step 3: Auto-Save Testing (30 min)

### Manual Testing Checklist
- [ ] Open each form (Intake, POA, Citizenship, Family Tree, Civil Registry, Family History)
- [ ] Make changes to form fields
- [ ] Wait 30 seconds without manually saving
- [ ] Verify "Saving..." indicator appears in header
- [ ] Verify "Saved at HH:MM:SS" appears after save completes
- [ ] Refresh page
- [ ] Verify data persisted correctly
- [ ] Test with slow network (Chrome DevTools → Network → Throttling → Slow 3G)

### Edge Cases to Test
- [ ] Rapid typing doesn't trigger multiple saves (debounced properly)
- [ ] Closing tab during save shows browser warning
- [ ] Network failure shows error indicator (disconnect WiFi during save)
- [ ] Auto-save doesn't interfere with manual save button
- [ ] Date fields trigger auto-save correctly
- [ ] Empty fields don't cause save errors

---

## Step 4: Security & Performance Audits (90 min)

### Security Testing
- [ ] Run Supabase Security Linter (use tool)
- [ ] Check for RLS policy gaps
- [ ] Verify all tables have proper access control
- [ ] **Target: Zero warnings**

### Performance Testing
- [ ] Run Lighthouse audit on mobile (Chrome DevTools)
  - [ ] Performance score >80
  - [ ] Accessibility score >90
  - [ ] Best Practices score >90
  - [ ] SEO score >90
- [ ] Test on throttled 3G connection
  - [ ] Forms load within 3 seconds
  - [ ] Auto-save doesn't block UI
- [ ] Verify lazy loading works
  - [ ] 3D components don't block initial render
  - [ ] Timeline images load progressively

### Responsive Testing
Test on these viewport sizes:
- [ ] 320px width (iPhone SE)
  - [ ] All forms render correctly
  - [ ] Buttons are touch-friendly (min 44x44px)
  - [ ] No horizontal scrolling
- [ ] 375px width (iPhone 12/13)
  - [ ] Form fields stack properly
  - [ ] Navigation is accessible
- [ ] 768px width (iPad portrait)
  - [ ] Two-column layouts work
  - [ ] Tabs are visible
- [ ] 1024px width (iPad landscape)
  - [ ] Full desktop experience
  - [ ] All features accessible

---

## Step 5: User Journey End-to-End Test (60 min)

### Complete Flow with Real Data

1. **Create New Case**
   - [ ] Navigate to `/admin/cases`
   - [ ] Click "New Case"
   - [ ] Enter case name and client info
   - [ ] Verify case appears in dashboard

2. **Intake Form**
   - [ ] Open Intake Form for new case
   - [ ] Fill all required fields:
     - [ ] Applicant: first name, last name, DOB, POB
     - [ ] Contact: email, phone
     - [ ] Address: full address
     - [ ] Passport: number, issue/expiry dates
   - [ ] Upload passport photo (test OCR)
   - [ ] Verify auto-save works (wait 30s)
   - [ ] Verify completion badge shows 100%

3. **POA Form**
   - [ ] Navigate to POA Form
   - [ ] Verify Intake data auto-populated
   - [ ] Fill additional POA-specific fields
   - [ ] Generate POA Adult PDF
   - [ ] Verify PDF contains correct data
   - [ ] Download and inspect PDF

4. **Citizenship Form**
   - [ ] Navigate to Citizenship Form
   - [ ] Verify data from Intake/POA populated
   - [ ] Fill parents and grandparents data
   - [ ] Test validation:
     - [ ] Try submitting with missing required field
     - [ ] Verify error message appears
     - [ ] Verify submission blocked
   - [ ] Fill missing fields
   - [ ] Verify validation passes

5. **Family Tree Form**
   - [ ] Navigate to Family Tree Form
   - [ ] Verify family data populated
   - [ ] Add additional family members
   - [ ] Generate Family Tree PDF
   - [ ] Verify PDF accuracy

### Test Validation Blocking
- [ ] Open any form
- [ ] Clear a required field
- [ ] Try to save or generate PDF
- [ ] Verify error message appears
- [ ] Verify action is blocked
- [ ] Fill the field
- [ ] Verify validation passes
- [ ] Verify action succeeds

### Test Unsaved Changes Protection
- [ ] Open any form
- [ ] Make changes (don't save)
- [ ] Try to navigate away (click browser back)
- [ ] Verify warning dialog appears: "You have unsaved changes"
- [ ] Click "Cancel" in dialog
- [ ] Verify navigation cancelled
- [ ] Verify changes retained in form
- [ ] Click "Save" button
- [ ] Try navigating away again
- [ ] Verify no warning appears (data saved)

---

## Step 6: Known Issues & Improvements

### High Priority
- [ ] Document any critical bugs found during testing
- [ ] Create issues for performance bottlenecks
- [ ] Note any UX improvements needed

### Medium Priority
- [ ] Accessibility improvements (keyboard navigation, screen readers)
- [ ] Mobile-specific optimizations
- [ ] Form field help text/tooltips

### Low Priority
- [ ] Additional validation rules
- [ ] Enhanced error messages
- [ ] Offline support

---

## Test Environment Setup

### Browser Testing
Test in these browsers:
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Network Conditions
Test under these conditions:
- [ ] Fast 4G (normal)
- [ ] Slow 3G (throttled)
- [ ] Offline (airplane mode)

### Device Testing
Test on:
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## Success Criteria Summary

✅ **Auto-Save:**
- Works on all 6 forms
- 30-second delay after last change
- Visual indicator shows status
- Data persists after page refresh

✅ **Validation:**
- Required fields enforced
- Date format validation works (DD.MM.YYYY)
- Inline error messages appear
- Form-level validation summary shows

✅ **Performance:**
- Lighthouse mobile score >80
- Forms load in <3 seconds on 3G
- No blocking 3D components
- Progressive image loading

✅ **Security:**
- Zero Supabase linter warnings
- All RLS policies verified
- Sensitive data protected

✅ **User Experience:**
- Complete flow works end-to-end
- Unsaved changes protected
- Responsive on all viewports
- Accessible (keyboard, screen reader)
