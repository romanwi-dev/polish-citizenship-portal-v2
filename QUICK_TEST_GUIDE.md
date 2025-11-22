# Quick Start Testing Guide

## 🚀 How to Test the New Form System (5 Minutes)

### Step 1: Pick Any Form
Navigate to any of these in the admin panel:
- `/admin/intake/:id`
- `/admin/poa/:id`
- `/admin/citizenship/:id`
- `/admin/family-tree/:id`
- `/admin/civil-registry/:id`
- `/admin/family-history/:id`

### Step 2: Test Auto-Save (2 min)
1. Type something in any field
2. **Stop typing and wait 30 seconds**
3. Watch for "Saving..." indicator
4. See "Saved at [time]" appear
5. **Refresh the page**
6. Verify your text is still there ✅

### Step 3: Test Validation (1 min)
1. Find a date field
2. Type invalid date: `99.99.9999`
3. Look for red error message ❌
4. Type valid date: `15.03.2020`
5. Error disappears ✅

### Step 4: Test Unsaved Changes (1 min)
1. Type something (don't wait 30s)
2. Try to close the tab
3. Browser warning appears ✅
4. Cancel the close
5. Wait 30s for auto-save
6. Try to close tab again
7. No warning (data saved) ✅

### Step 5: Test Real-Time (1 min)
1. Open same form in two browser windows
2. Edit in window 1
3. Wait for auto-save
4. Watch window 2 update automatically ✅

---

## ✅ Success Criteria

If all 5 steps work, the system is functioning perfectly!

- ✅ Auto-save prevents data loss
- ✅ Validation catches errors
- ✅ Unsaved changes protected
- ✅ Real-time sync working
- ✅ Forms are production-ready

---

## 🐛 If Something Doesn't Work

1. Check browser console for errors (F12)
2. Verify you're on a valid case ID (not `:id`)
3. Check network tab for failed requests
4. Report issue with specific form name and error message

---

**Next:** See `TESTING_CHECKLIST.md` for comprehensive testing
