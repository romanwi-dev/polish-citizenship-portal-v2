# Workflows Phase 2 Implementation

## Status: ✅ COMPLETED

## Core Workflow Engine Built

### 1. ✅ Created Workflow Definitions Table
**Purpose**: Central registry of all workflow types and their configuration  
**Schema**:
```sql
- id (uuid)
- workflow_type (text, unique) - 'translations', 'archives', 'usc', 'passport'
- display_name (text)
- description (text)
- stages (jsonb) - Array of stage definitions with order
- default_sla_days (integer)
- auto_assign (boolean)
- assignment_rules (jsonb)
- is_active (boolean)
```

**Pre-loaded Workflows**:
- **Translations**: 14 stages, 14-day SLA
- **Archives**: 6 stages, 90-day SLA  
- **USC**: 5 stages, 60-day SLA
- **Passport**: 7 stages, 30-day SLA

### 2. ✅ Created Workflow Instances Table
**Purpose**: Unified tracking of all active workflows across all types  
**Schema**:
```sql
- id (uuid)
- workflow_type (text) → workflow_definitions
- case_id (uuid) → cases
- source_table (text) - 'translation_requests', 'archive_searches', etc.
- source_id (uuid) - ID in source table
- current_stage (text)
- status (workflow_status enum)
- assigned_to (uuid)
- assigned_at (timestamp)
- deadline (timestamp)
- sla_violated (boolean)
- priority (text)
- metadata (jsonb)
- started_at, completed_at, created_at, updated_at
```

**Key Features**:
- Polymorphic design: tracks workflows from any source table
- Automatic SLA deadline calculation
- Auto-created via triggers when workflow records inserted
- Indexed for fast queries by case, type, stage, status, assignee, deadline

### 3. ✅ Created Workflow Stage Transitions Table
**Purpose**: Complete audit trail of all stage changes  
**Schema**:
```sql
- id (uuid)
- workflow_instance_id (uuid) → workflow_instances
- from_stage (text)
- to_stage (text)
- transitioned_by (uuid)
- transition_reason (text)
- duration_seconds (integer)
- metadata (jsonb)
- created_at (timestamp)
```

**Tracks**:
- Who changed the stage
- When it changed
- Why it changed (optional reason)
- How long the workflow spent in the previous stage
- Additional context in metadata

### 4. ✅ Created Workflow SLA Rules Table
**Purpose**: Define SLA expectations for each workflow stage  
**Schema**:
```sql
- id (uuid)
- workflow_type (text) → workflow_definitions
- stage (text)
- max_duration_hours (integer)
- warning_threshold_hours (integer)
- escalate_to_role (text)
- send_notification (boolean)
- is_active (boolean)
```

**Pre-loaded Rules**:
- Translations HAC review: 48h max, 36h warning
- Translations sworn translator: 7 days max, 5 days warning
- Archives letter sent: 90 days max, 70 days warning
- USC letter sent: 60 days max, 45 days warning
- Passport appointment: 14 days max, 10 days warning

### 5. ✅ Implemented transition_workflow_stage() Function
**Purpose**: Atomic workflow stage transitions with full tracking  
**Parameters**:
- `p_workflow_instance_id` (uuid) - Workflow to transition
- `p_to_stage` (text) - Target stage
- `p_transitioned_by` (uuid) - User performing transition (defaults to auth.uid())
- `p_reason` (text) - Optional reason for transition

**What It Does**:
1. Validates workflow instance exists
2. Calculates duration in current stage
3. Updates workflow instance (stage, status, completed_at)
4. Updates source table (workflow_stage, stage_history)
5. Records transition in audit table
6. Logs to HAC logs
7. Returns success/error JSON

**Auto Status Mapping**:
- `completed`, `submitted_usc`, `received` → `completed`
- `*review*` stages → `review`
- `*approved*` stages → `approved`
- All others → `in_progress`

### 6. ✅ Auto-Create Workflow Instances
**Trigger Function**: `create_workflow_instance()`  
**Attached To**:
- `translation_requests` (AFTER INSERT)
- `archive_searches` (AFTER INSERT)
- `usc_requests` (AFTER INSERT)
- `passport_applications` (AFTER INSERT)

**What It Does**:
1. Maps table name to workflow type
2. Gets default SLA from workflow_definitions
3. Creates workflow_instance with:
   - Polymorphic reference (source_table + source_id)
   - Initial stage from record
   - Status = 'pending'
   - Deadline = now + SLA days
   - Priority from source record

### 7. ✅ Created React Hooks

**useWorkflowTransition.ts**:
```typescript
const { mutate: transitionStage } = useWorkflowTransition();

transitionStage({
  workflowInstanceId: 'uuid',
  toStage: 'hac_review',
  reason: 'Documents verified'
});
```

**useWorkflowInstances.ts**:
```typescript
// Get all workflows for a case
const { data: workflows } = useWorkflowInstances({ caseId: 'uuid' });

// Get all translation workflows
const { data: translations } = useWorkflowInstances({ workflowType: 'translations' });

// Get my assigned workflows
const { data: myWork } = useWorkflowInstances({ assignedTo: userId });

// Get single workflow
const { data: workflow } = useWorkflowInstance(workflowId);
```

## Database Objects Created

### Tables (4)
- `workflow_definitions`
- `workflow_instances`
- `workflow_stage_transitions`
- `workflow_sla_rules`

### Functions (2)
- `transition_workflow_stage()` - Stage transition with tracking
- `create_workflow_instance()` - Auto-create instances on insert

### Triggers (8)
- `create_workflow_instance_translation` - Auto-create for translations
- `create_workflow_instance_archive` - Auto-create for archives
- `create_workflow_instance_usc` - Auto-create for USC
- `create_workflow_instance_passport` - Auto-create for passport
- `update_workflow_definitions_updated_at` - Timestamp tracking
- `update_workflow_instances_updated_at` - Timestamp tracking
- `update_workflow_sla_rules_updated_at` - Timestamp tracking

### Indexes (9)
- `idx_workflow_instances_case` - Fast case lookups
- `idx_workflow_instances_type` - Fast type filtering
- `idx_workflow_instances_stage` - Fast stage filtering
- `idx_workflow_instances_status` - Fast status filtering
- `idx_workflow_instances_assigned` - Fast assignee filtering
- `idx_workflow_instances_deadline` - Fast SLA queries
- `idx_workflow_instances_source` - Unique polymorphic reference
- `idx_stage_transitions_workflow` - Fast transition history
- `idx_stage_transitions_created` - Fast temporal queries

### RLS Policies (11)
All tables secured with staff-view and admin-manage policies  
Workflow instances also have client-view policy

## Code Files Created

### Hooks
- `src/hooks/useWorkflowTransition.ts` - Stage transition mutation
- `src/hooks/useWorkflowInstances.ts` - Query workflow instances

## Architecture Benefits

### Before Phase 2:
- Each workflow table managed independently
- No unified tracking
- Manual stage transitions
- No audit trail
- No SLA tracking

### After Phase 2:
- ✅ Centralized workflow registry (definitions)
- ✅ Unified instance tracking (all workflows in one place)
- ✅ Atomic stage transitions with validation
- ✅ Complete audit trail (who, when, why, duration)
- ✅ SLA rules and deadline tracking
- ✅ Auto-creation of instances via triggers
- ✅ Polymorphic design (scales to new workflows easily)
- ✅ React hooks for easy frontend integration

## Usage Examples

### Transition a workflow stage:
```typescript
import { useWorkflowTransition } from '@/hooks/useWorkflowTransition';

const { mutate: transitionStage } = useWorkflowTransition();

transitionStage({
  workflowInstanceId: workflow.id,
  toStage: 'hac_approved',
  reason: 'All documents verified'
});
```

### Query workflows:
```typescript
import { useWorkflowInstances } from '@/hooks/useWorkflowInstances';

// Get all translation workflows
const { data } = useWorkflowInstances({ 
  workflowType: 'translations',
  status: 'in_progress'
});

// Get workflows approaching deadline
const { data: urgentWorkflows } = useWorkflowInstances();
const urgent = urgentWorkflows?.filter(w => 
  w.deadline && new Date(w.deadline) < new Date(Date.now() + 48*60*60*1000)
);
```

### Direct SQL transition:
```sql
SELECT transition_workflow_stage(
  'workflow-uuid',
  'sent_to_translator',
  auth.uid(),
  'AI translation approved by HAC'
);
```

## Next Steps (Phase 3)

1. Build unified `<WorkflowDashboard>` component
2. Create workflow-specific detail pages
3. Implement workflow analytics views
4. Add workflow assignment UI
5. Build SLA violation alerts

## Testing Checklist

### Database
- [x] Migration runs without errors
- [ ] Workflow instances auto-created on insert
- [ ] Stage transitions recorded correctly
- [ ] Source table stage_history updated
- [ ] HAC logs created on transition
- [ ] SLA deadlines calculated correctly
- [ ] Cascade deletes work properly

### Hooks
- [ ] useWorkflowTransition successfully transitions stages
- [ ] useWorkflowInstances filters correctly
- [ ] Query invalidation updates UI

### Integration
- [ ] Creating translation_request creates workflow_instance
- [ ] Creating archive_search creates workflow_instance
- [ ] Creating usc_request creates workflow_instance
- [ ] Creating passport_application creates workflow_instance
- [ ] Deleting case cascades to workflow_instances
- [ ] Deleting workflow record cascades to workflow_instances
