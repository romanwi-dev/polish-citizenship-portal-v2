# Workflows Phase 1 Implementation

## Status: ✅ COMPLETED

## Emergency Fixes Applied

### 1. ✅ Fixed Broken Translation Workflow Table Reference
**Issue**: `TranslationWorkflowBoard.tsx` referenced non-existent `translation_workflows` table  
**Fix**: Changed to use `translation_requests` table (the actual table name)  
**Files**: `src/components/translations/TranslationWorkflowBoard.tsx`

### 2. ✅ Added ON DELETE CASCADE to Workflow Foreign Keys
**Issue**: Workflow records becoming orphaned when cases are deleted  
**Fix**: Added CASCADE deletes for:
- `translation_requests.case_id → cases.id`
- `translation_requests.document_id → documents.id`
- `archive_searches.case_id → cases.id`
- `usc_requests.case_id → cases.id`
- `passport_applications.case_id → cases.id`

**Impact**: Prevents orphaned workflow records and maintains data integrity

### 3. ✅ Added Workflow Stage Tracking
**Issue**: No consistent workflow state tracking across tables  
**Fix**: Added to all workflow tables:
- `workflow_stage` (text) - current stage in workflow
- `stage_entered_at` (timestamp) - when entered current stage
- `stage_history` (jsonb) - array of stage transitions with timestamps
- Indexed `workflow_stage` for fast queries

**Tables Updated**:
- `translation_requests`
- `archive_searches`
- `usc_requests`
- `passport_applications`

### 4. ✅ Created Unified Workflow Status Enum
**Issue**: Inconsistent status vocabularies across workflows  
**Fix**: Created `workflow_status` enum with standard values:
- `pending` - awaiting action
- `assigned` - assigned to team member
- `in_progress` - actively being worked on
- `review` - submitted for review
- `approved` - approved by HAC
- `completed` - finished successfully
- `blocked` - blocked by external dependency
- `cancelled` - cancelled by user/admin

**Note**: Existing status columns maintained for backward compatibility. New code should use workflow_stage.

### 5. ✅ Added Active Workflows Tracking to Cases
**Issue**: No way to see workflow counts per case  
**Fix**: 
- Added `active_workflows` JSONB column to `cases` table
- Tracks count of active workflows by type:
  ```json
  {
    "translations": 3,
    "archives": 1,
    "usc": 0,
    "passport": 1,
    "civil_acts": 0
  }
  ```
- GIN index for fast JSONB queries
- Auto-updated via triggers

### 6. ✅ Created Auto-Update Triggers
**Function**: `update_active_workflows()`
- Recalculates workflow counts whenever workflow records change
- Triggered on INSERT, UPDATE (status), DELETE
- Updates cases.active_workflows JSONB

**Triggers Created** (12 total):
- Translation: `update_workflows_on_translation_insert/update/delete`
- Archives: `update_workflows_on_archive_insert/update/delete`
- USC: `update_workflows_on_usc_insert/update/delete`
- Passport: `update_workflows_on_passport_insert/update/delete`

## Database Changes

### New Columns
```sql
-- All workflow tables
ALTER TABLE <workflow_table> ADD COLUMN workflow_stage text;
ALTER TABLE <workflow_table> ADD COLUMN stage_entered_at timestamp with time zone DEFAULT now();
ALTER TABLE <workflow_table> ADD COLUMN stage_history jsonb DEFAULT '[]'::jsonb;

-- Cases table
ALTER TABLE cases ADD COLUMN active_workflows jsonb DEFAULT '{...}'::jsonb;
```

### New Enums
```sql
CREATE TYPE workflow_status AS ENUM (
  'pending', 'assigned', 'in_progress', 'review', 
  'approved', 'completed', 'blocked', 'cancelled'
);
```

### New Indexes
```sql
CREATE INDEX idx_translation_requests_workflow_stage ON translation_requests(workflow_stage);
CREATE INDEX idx_archive_searches_workflow_stage ON archive_searches(workflow_stage);
CREATE INDEX idx_usc_requests_workflow_stage ON usc_requests(workflow_stage);
CREATE INDEX idx_passport_applications_workflow_stage ON passport_applications(workflow_stage);
CREATE INDEX idx_cases_active_workflows ON cases USING gin(active_workflows);
```

### New Functions
- `update_active_workflows()` - Recalculates active workflow counts

### New Triggers
- 12 triggers across 4 workflow tables for auto-updating counts

## Code Changes

### Files Modified
1. `src/components/translations/TranslationWorkflowBoard.tsx`
   - Fixed table reference: `translation_workflows` → `translation_requests`
   - Updated filter to check `workflow_stage` or `status` for backward compatibility

## Testing Required

### Database
- [x] Migration runs without errors
- [ ] Cascade deletes work (delete a case with workflows)
- [ ] Workflow counts auto-update on insert/update/delete
- [ ] Stage history tracking works

### UI
- [ ] TranslationWorkflowBoard displays workflows correctly
- [ ] Workflows filter by stage properly
- [ ] Case cards show active workflow counts

## Next Steps (Phase 2)

1. Create core workflow engine tables
2. Implement `transition_workflow_stage()` function
3. Build unified workflow dashboard component
4. Add SLA tracking and notifications

## Notes

- Backward compatible: existing `status` columns still work
- New code should use `workflow_stage` for consistency
- `workflow_status` enum ready for Phase 2 migration
- All workflow counts now live-tracked on cases table
