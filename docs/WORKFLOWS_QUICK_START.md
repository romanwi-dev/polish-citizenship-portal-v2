# Workflows System - Quick Start Guide

## For HAC Admins

### Accessing Workflows

**Main Dashboard:**
```
Navigate to: /admin/workflows
```
Shows all workflows across the entire system.

**Workflow-Specific Pages:**
- Translations: `/admin/translations`
- Archives: `/admin/archives-search`
- Passport: `/admin/passport`
- Notifications: `/admin/workflow-notifications`

### Managing Workflows

#### View Workflows
1. Navigate to specific workflow page
2. See all workflows with their current status
3. Filter by status, priority, or assignment
4. View analytics tab for performance metrics

#### Advance a Workflow to Next Stage
1. Find the workflow card
2. Click "Advance to [Next Stage]" button
3. Workflow transitions automatically
4. Notification sent to assigned user
5. Audit trail created

#### Check SLA Status
**Visual Indicators:**
- 🟢 On track (normal background)
- 🟡 Warning (yellow background, approaching deadline)
- 🔴 Violated (red background, past deadline)

**Manual Check:**
1. Go to `/admin/workflow-notifications`
2. Click "Check SLAs Now" button
3. View violations in SLA Violations tab

#### View Notifications
1. Navigate to `/admin/workflow-notifications`
2. See all notifications in Notifications tab
3. Click individual notification to mark as read
4. Click "Mark all as read" to clear all

### Common Tasks

#### Assign a Workflow
```typescript
// Update workflow instance
Update workflow_instances
SET assigned_to = 'user-id'
WHERE id = 'workflow-id'
```
→ Automatically sends notification to assigned user

#### Resolve an SLA Violation
1. Go to `/admin/workflow-notifications`
2. Click SLA Violations tab
3. Click "View Case" on violation card
4. Complete the workflow or advance stage
5. Mark violation as resolved in database

#### Generate Reports
1. Go to workflow page
2. Click Analytics tab
3. View charts and metrics
4. Export data (future feature)

---

## For Developers

### Creating a Workflow Instance

**Automatic (Recommended):**
```typescript
// Just insert into source table
const { data, error } = await supabase
  .from('translation_requests')
  .insert({
    case_id: caseId,
    document_id: documentId,
    source_language: 'EN',
    target_language: 'PL',
    priority: 'high'
  });

// workflow_instance automatically created via trigger
```

**Manual:**
```typescript
const { data, error } = await supabase
  .from('workflow_instances')
  .insert({
    workflow_type: 'translations',
    case_id: caseId,
    source_table: 'translation_requests',
    source_id: sourceId,
    current_stage: 'pending',
    status: 'pending',
    deadline: new Date(Date.now() + 14*24*60*60*1000) // 14 days
  });
```

### Transitioning Stages

**Using Hook:**
```typescript
import { useWorkflowTransition } from '@/hooks/useWorkflowTransition';

const { mutate: transitionStage } = useWorkflowTransition();

transitionStage({
  workflowInstanceId: workflow.id,
  toStage: 'hac_review',
  reason: 'Documents verified'
});
```

**Using RPC:**
```typescript
const { data, error } = await supabase.rpc('transition_workflow_stage', {
  p_workflow_instance_id: workflowId,
  p_to_stage: 'hac_approved',
  p_reason: 'Approved by HAC'
});
```

### Querying Workflows

**All Workflows:**
```typescript
import { useWorkflowInstances } from '@/hooks/useWorkflowInstances';

const { data: workflows } = useWorkflowInstances();
```

**By Type:**
```typescript
const { data: translations } = useWorkflowInstances({ 
  workflowType: 'translations' 
});
```

**By Case:**
```typescript
const { data: caseWorkflows } = useWorkflowInstances({ 
  caseId: 'case-uuid' 
});
```

**By Status:**
```typescript
const { data: inProgress } = useWorkflowInstances({ 
  status: 'in_progress' 
});
```

**By Assignment:**
```typescript
const { data: myWorkflows } = useWorkflowInstances({ 
  assignedTo: userId 
});
```

### Checking SLAs

**Violations:**
```typescript
import { useCheckSLAViolations } from '@/hooks/useWorkflowNotifications';

const { mutate: checkViolations } = useCheckSLAViolations();
checkViolations(); // Finds all overdue workflows
```

**Warnings:**
```typescript
import { useCheckSLAWarnings } from '@/hooks/useWorkflowNotifications';

const { mutate: checkWarnings } = useCheckSLAWarnings();
checkWarnings(); // Finds workflows approaching deadline
```

### Working with Notifications

**Query Notifications:**
```typescript
import { useWorkflowNotifications } from '@/hooks/useWorkflowNotifications';

const { data: notifications } = useWorkflowNotifications(userId);
```

**Get Unread Count:**
```typescript
import { useUnreadNotificationsCount } from '@/hooks/useWorkflowNotifications';

const { data: unreadCount } = useUnreadNotificationsCount(userId);
```

**Mark as Read:**
```typescript
import { useMarkNotificationAsRead } from '@/hooks/useWorkflowNotifications';

const { mutate: markAsRead } = useMarkNotificationAsRead();
markAsRead(notificationId);
```

### Adding a New Workflow Type

**1. Insert Definition:**
```sql
INSERT INTO workflow_definitions (
  workflow_type,
  display_name,
  description,
  stages,
  default_sla_days
) VALUES (
  'new_workflow',
  'New Workflow Type',
  'Description of workflow',
  '[
    {\"stage\": \"pending\", \"name\": \"Pending\", \"order\": 1},
    {\"stage\": \"in_progress\", \"name\": \"In Progress\", \"order\": 2},
    {\"stage\": \"completed\", \"name\": \"Completed\", \"order\": 3}
  ]'::jsonb,
  30
);
```

**2. Add Columns to Source Table:**
```sql
ALTER TABLE your_source_table
  ADD COLUMN workflow_stage text,
  ADD COLUMN stage_entered_at timestamp with time zone DEFAULT now(),
  ADD COLUMN stage_history jsonb DEFAULT '[]'::jsonb;

CREATE INDEX idx_your_source_table_workflow_stage 
  ON your_source_table(workflow_stage);
```

**3. Add Trigger:**
```sql
CREATE TRIGGER create_workflow_instance_your_table
  AFTER INSERT ON your_source_table
  FOR EACH ROW EXECUTE FUNCTION create_workflow_instance();

CREATE TRIGGER update_workflows_on_your_table_insert
  AFTER INSERT ON your_source_table
  FOR EACH ROW EXECUTE FUNCTION update_active_workflows();

CREATE TRIGGER update_workflows_on_your_table_update
  AFTER UPDATE OF status ON your_source_table
  FOR EACH ROW EXECUTE FUNCTION update_active_workflows();

CREATE TRIGGER update_workflows_on_your_table_delete
  AFTER DELETE ON your_source_table
  FOR EACH ROW EXECUTE FUNCTION update_active_workflows();
```

**4. Update cases.active_workflows:**
```sql
-- Update the default value to include new workflow type
ALTER TABLE cases 
ALTER COLUMN active_workflows 
SET DEFAULT '{
  "translations": 0,
  "archives": 0,
  "usc": 0,
  "passport": 0,
  "new_workflow": 0
}'::jsonb;

-- Update existing cases
UPDATE cases
SET active_workflows = active_workflows || '{"new_workflow": 0}'::jsonb;
```

**5. Create Page (Optional):**
```tsx
// src/pages/admin/NewWorkflow.tsx
import { UnifiedWorkflowDashboard } from "@/components/workflows/UnifiedWorkflowDashboard";
import { WorkflowAnalytics } from "@/components/workflows/WorkflowAnalytics";

const NewWorkflow = () => {
  return (
    <AdminLayout>
      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <UnifiedWorkflowDashboard 
            workflowType="new_workflow" 
            showAnalytics={true} 
          />
        </TabsContent>
        
        <TabsContent value="analytics">
          <WorkflowAnalytics workflowType="new_workflow" />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};
```

**6. Add Route:**
```tsx
// src/App.tsx
const NewWorkflow = lazy(() => import("./pages/admin/NewWorkflow"));

// In Routes:
<Route 
  path="/admin/new-workflow" 
  element={
    <Suspense fallback={<AdminLoader />}>
      <NewWorkflow />
    </Suspense>
  } 
/>
```

**7. Update WorkflowNavigation (Optional):**
```tsx
// src/components/workflows/WorkflowNavigation.tsx
const WORKFLOWS = [
  // ... existing workflows
  {
    id: 'new-workflow',
    label: 'New Workflow',
    icon: YourIcon,
    path: '/admin/new-workflow'
  }
];
```

**Done!** New workflow type is now fully integrated.

---

## SQL Quick Reference

### Find Overdue Workflows
```sql
SELECT 
  wi.*,
  c.client_name,
  wd.display_name as workflow_name
FROM workflow_instances wi
JOIN cases c ON c.id = wi.case_id
JOIN workflow_definitions wd ON wd.workflow_type = wi.workflow_type
WHERE wi.deadline < now()
  AND wi.status NOT IN ('completed', 'cancelled')
ORDER BY wi.deadline ASC;
```

### Get Workflow History
```sql
SELECT 
  wst.*,
  wi.workflow_type,
  c.client_name
FROM workflow_stage_transitions wst
JOIN workflow_instances wi ON wi.id = wst.workflow_instance_id
JOIN cases c ON c.id = wi.case_id
WHERE wst.workflow_instance_id = 'your-workflow-id'
ORDER BY wst.created_at ASC;
```

### Get Active Workflows by Type
```sql
SELECT 
  workflow_type,
  COUNT(*) as active_count,
  COUNT(*) FILTER (WHERE sla_violated) as violated_count,
  COUNT(*) FILTER (WHERE deadline < now() + interval '48 hours') as warning_count
FROM workflow_instances
WHERE status NOT IN ('completed', 'cancelled')
GROUP BY workflow_type;
```

### Get Unresolved Violations
```sql
SELECT 
  wsv.*,
  wi.workflow_type,
  wi.current_stage,
  c.client_name
FROM workflow_sla_violations wsv
JOIN workflow_instances wi ON wi.id = wsv.workflow_instance_id
JOIN cases c ON c.id = wi.case_id
WHERE NOT wsv.resolved
ORDER BY wsv.delay_hours DESC;
```

### Get Unread Notifications for User
```sql
SELECT 
  wn.*,
  wi.workflow_type,
  c.client_name
FROM workflow_notifications wn
JOIN workflow_instances wi ON wi.id = wn.workflow_instance_id
JOIN cases c ON c.id = wi.case_id
WHERE wn.recipient_user_id = 'user-id'
  AND wn.read_at IS NULL
ORDER BY wn.created_at DESC;
```

---

## Common Pitfalls & Solutions

### Issue: Workflow instance not created
**Cause**: Trigger not firing or foreign key invalid  
**Solution**: 
1. Check case_id exists in cases table
2. Verify triggers enabled: `SELECT * FROM pg_trigger WHERE tgname LIKE 'create_workflow%';`
3. Check source table has correct columns

### Issue: Notifications not appearing
**Cause**: RLS policy blocking access  
**Solution**:
1. Verify user is authenticated
2. Check recipient_user_id matches auth.uid()
3. Staff should have role in user_roles table

### Issue: SLA violations not detecting
**Cause**: Function not running  
**Solution**:
1. Manually run: `SELECT check_workflow_sla_violations();`
2. Check cron job configured
3. Verify deadline field populated on workflows

### Issue: Stage transition fails
**Cause**: Invalid next stage  
**Solution**:
1. Check stage exists in workflow_definitions.stages
2. Verify workflow_instance_id is valid
3. Check workflow not already completed

### Issue: Active workflow counts wrong
**Cause**: Triggers not firing or initial values not set  
**Solution**:
1. Run manual update (see Migration Guide)
2. Verify triggers on all workflow tables
3. Check cases.active_workflows column exists

---

## Performance Tips

1. **Use Filters**: Always filter by workflow_type or case_id when possible
2. **Limit Results**: Use pagination for large result sets
3. **Cache Definitions**: workflow_definitions rarely change, cache in frontend
4. **Batch Operations**: Use batch inserts/updates when creating multiple workflows
5. **Index Usage**: Ensure queries use indexes (check EXPLAIN ANALYZE)

---

## Support Contacts

**System Architect**: AI Implementation Team  
**Documentation**: See docs/WORKFLOWS_*.md files  
**Issues**: Create ticket with workflow ID and error details  
**Feature Requests**: Propose new workflow types or enhancements

---

**Last Updated**: 2025-11-02  
**Version**: 1.0 (Production Ready)
