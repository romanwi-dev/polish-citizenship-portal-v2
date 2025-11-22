# Form System Architecture Documentation

## 🏗️ System Architecture

### Core Hook: `useFormManager`

The universal form manager that orchestrates all form functionality:

```typescript
export const useFormManager = (
  caseId: string | undefined,
  requiredFields: string[],
  dateFields: string[] = []
) => {
  // Returns:
  {
    formData,           // Current form state
    isLoading,          // Initial data fetch
    isSaving,           // Save in progress
    activeTab,          // Current tab
    setActiveTab,       // Tab switcher
    isFullView,         // Full view mode
    setIsFullView,      // Toggle full view
    completion,         // {completionPercentage, filledCount, totalCount, missingFields}
    validation,         // {errors, isValid, getFieldError}
    autoSave,           // {status, lastSaved}
    hasUnsavedChanges,  // Boolean
    handleInputChange,  // (field, value) => void
    handleSave,         // () => Promise<void>
    handleClearField,   // (field) => void
    handleClearAll,     // () => Promise<void>
  }
};
```

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     useFormManager                          │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │ useMasterData│───▶│  formData    │◀───│useRealtime   │ │
│  │   (Query)    │    │   (State)    │    │   Sync       │ │
│  └──────────────┘    └──────┬───────┘    └──────────────┘ │
│                             │                              │
│                             ▼                              │
│              ┌──────────────────────────┐                  │
│              │   handleInputChange      │                  │
│              │   (user types)           │                  │
│              └──────────┬───────────────┘                  │
│                         │                                  │
│          ┌──────────────┼──────────────┐                   │
│          ▼              ▼              ▼                   │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐             │
│   │Validation│   │Completion│   │Auto-Save │             │
│   │  (Live)  │   │   (%)    │   │(30s wait)│             │
│   └──────────┘   └──────────┘   └────┬─────┘             │
│                                       │                    │
│                                       ▼                    │
│                            ┌──────────────────┐            │
│                            │useUpdateMasterData│            │
│                            │   (Mutation)     │            │
│                            └──────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### State Management Flow

1. **Initial Load**
   ```
   useMasterData → formData state → useRealtimeFormSync subscribes
   ```

2. **User Input**
   ```
   User types → handleInputChange → formData updated → 
   hasUnsavedChanges = true → useAutoSave starts 30s timer
   ```

3. **Auto-Save**
   ```
   30s elapsed → useAutoSave calls handleAutoSave →
   useUpdateMasterData mutation → Success → hasUnsavedChanges = false
   ```

4. **Real-Time Update (other user)**
   ```
   Supabase realtime event → useRealtimeFormSync →
   formData updated → validation recalculated → UI updates
   ```

### Hook Dependencies

```
useFormManager
├── useMasterData (data fetching)
├── useUpdateMasterData (data saving)
├── useRealtimeFormSync (live updates)
│   └── useQueryClient (cache management)
├── useFormCompletion (% calculation)
├── useFieldValidation (error checking)
├── useAutoSave (debounced save)
│   └── useUpdateMasterData (mutation)
└── useUnsavedChanges (browser warning)
```

---

## 🔧 Component Integration

### Example: IntakeForm

```typescript
const IntakeForm = () => {
  const { id: caseId } = useParams();
  
  // All form logic in one hook
  const {
    formData,
    isLoading,
    isSaving,
    completion,
    validation,
    autoSave,
    handleInputChange,
    handleSave,
  } = useFormManager(
    caseId,
    INTAKE_FORM_REQUIRED_FIELDS,
    INTAKE_DATE_FIELDS
  );

  // Component just renders UI and calls handlers
  return (
    <form>
      <Input
        value={formData.applicant_first_name || ''}
        onChange={(e) => handleInputChange('applicant_first_name', e.target.value)}
      />
      
      {/* Auto-save status */}
      <AutosaveIndicator 
        status={autoSave.status}
        lastSaved={autoSave.lastSaved}
      />
      
      {/* Validation errors */}
      <FormValidationSummary errors={validation.errors} />
      
      {/* Completion badge */}
      <Badge>{completion.completionPercentage}% Complete</Badge>
    </form>
  );
};
```

---

## 📐 Validation Rules

### Required Fields Validation
- Checks if field is `null`, `undefined`, or empty string
- Returns error: "This field is required"

### Date Format Validation
- Format: `DD.MM.YYYY`
- Day: 01-31
- Month: 01-12
- Year: ≤2030
- Examples:
  - ✅ `15.03.2020`
  - ✅ `01.01.2000`
  - ❌ `32.01.2020` (day > 31)
  - ❌ `15.13.2020` (month > 12)
  - ❌ `15.03.2031` (year > 2030)

---

## 💾 Auto-Save Behavior

### Trigger Conditions
1. User types in any field
2. 30 seconds pass with no new changes
3. `hasUnsavedChanges === true`
4. Valid `caseId` exists

### Status States
- `idle` - No save pending
- `saving` - Save in progress
- `saved` - Save successful (shows for 3s)
- `error` - Save failed

### Debounce Logic
```typescript
// Each keystroke resets the 30s timer
Type 'A' → Timer starts (30s)
Type 'B' → Timer resets (30s)
Type 'C' → Timer resets (30s)
[30s pass] → Auto-save triggered
```

---

## 🔒 Unsaved Changes Protection

### Browser Navigation
When user tries to close tab/navigate away:
```typescript
if (hasUnsavedChanges) {
  // Browser shows: "Changes you made may not be saved"
  e.preventDefault();
  e.returnValue = "";
}
```

### React Router Navigation
- Not yet implemented (future enhancement)
- Would need `useBlocker` from react-router-dom

---

## 🔄 Real-Time Synchronization

### Supabase Channel Setup
```typescript
const channel = supabase
  .channel(`master_table_${caseId}`)
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'master_table',
      filter: `case_id=eq.${caseId}`,
    },
    (payload) => {
      // Update local state
      setFormData(prev => ({ ...prev, ...payload.new }));
      // Update React Query cache
      queryClient.setQueryData(['masterData', caseId], payload.new);
    }
  )
  .subscribe();
```

### Multi-User Scenario
```
User A opens form → Loads data
User B opens same form → Loads same data
User A edits field → Auto-saves after 30s → Supabase UPDATE
User B receives realtime event → Form updates automatically
```

---

## 📊 Performance Optimizations

### Memoization
- `useFormCompletion` uses `useMemo` to prevent recalculation
- Only recalculates when `formData` or `requiredFields` change

### Debouncing
- Auto-save debounced to 30s
- Prevents save spam during rapid typing
- Reduces database write operations

### Ref Usage
- Some forms use `useRef` to store latest data
- Prevents race conditions in async operations

---

## 🧪 Testing Checklist

### Unit Tests (Future)
- [ ] `useFormManager` hook tests
- [ ] `useAutoSave` debounce tests
- [ ] `useFieldValidation` rule tests
- [ ] `useFormCompletion` calculation tests

### Integration Tests (Manual)
- [x] Auto-save after 30s
- [x] Validation on invalid input
- [x] Unsaved changes warning
- [x] Real-time sync between users
- [x] Data persistence after refresh

---

## 🚀 Future Enhancements

### Planned Features
1. **Optimistic Updates** - Show changes immediately before save
2. **Offline Support** - Queue changes when offline
3. **Field-Level Locking** - Prevent conflicts in multi-user editing
4. **Undo/Redo** - History of changes
5. **Conflict Resolution** - Handle simultaneous edits

### Potential Improvements
- Add loading skeletons for better UX
- Implement field-level validation on blur
- Add custom validation rules per form
- Create form builder for dynamic forms

---

## 📚 Related Documentation

- `TESTING_CHECKLIST.md` - Comprehensive testing guide
- `QUICK_TEST_GUIDE.md` - 5-minute quick test
- `MIGRATION_VERIFICATION.md` - Migration report
- `COMPLETE_PLAN_STATUS.md` - Overall progress

---

Last Updated: 2025-10-13
