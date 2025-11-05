# PDF Workflow Documentation

## Overview

The complete AI Documents Workflow enables preview, edit, download, and print capabilities for all generated PDFs.

## Workflow Stages

```
GENERATE → PREVIEW → EDIT → LOCK → PRINT
   ↓          ↓        ↓      ↓       ↓
editable   view    manual  flatten  final
 PDF      fields   edit    fields    PDF
```

## Database Schema

### Documents Table (New Columns)

- `pdf_original_url` - URL of first generated editable PDF
- `pdf_edited_url` - URL of manually edited PDF (uploaded by user)
- `pdf_locked_url` - URL of final locked PDF ready for printing
- `edit_count` - Number of times PDF has been edited
- `last_edited_at` - Timestamp of last edit
- `locked_at` - Timestamp when PDF was locked for printing

## Edge Functions

### lock-pdf

**Purpose:** Flatten all PDF form fields to create a print-ready locked PDF

**Input:**
```json
{
  "documentId": "uuid",
  "caseId": "uuid",
  "pdfUrl": "signed-url"
}
```

**Output:**
```json
{
  "success": true,
  "lockedUrl": "signed-url",
  "filename": "path/to/locked.pdf",
  "fieldsFlattened": 42
}
```

**Process:**
1. Fetches PDF from storage
2. Loads PDF with pdf-lib
3. Flattens all form fields (makes non-editable)
4. Saves locked PDF to storage
5. Updates document record
6. Creates pdf_history entry

## React Hooks

### useDocumentWorkflowActions

**New Function:** `lockPDFForPrinting(documentId, pdfUrl, documentName)`

**Returns:**
```typescript
{
  success: boolean;
  lockedUrl?: string;
}
```

**Usage:**
```typescript
const { lockPDFForPrinting, isLockingPDF } = useDocumentWorkflowActions({ caseId });

const result = await lockPDFForPrinting(
  documentId,
  pdfUrl,
  "POA_Adult.pdf"
);

if (result.success) {
  // Download locked PDF
  window.open(result.lockedUrl);
}
```

## Components

### PDFPreviewDialog (Enhanced)

**New Props:**
- `documentId?: string` - Required for locking
- `caseId?: string` - Required for locking
- `onLockForPrint?: (lockedUrl: string) => void` - Callback after locking

**New Features:**
- "Lock for Print" button (desktop only)
- Shows flattened field count
- Updates preview with locked PDF
- Loading state during lock operation

## User Workflow

### Desktop Workflow

1. **Generate PDF** from form data → Creates editable PDF
2. **Preview** in dialog → View all fields
3. **Lock for Print** → Flattens all fields (optional)
4. **Download** → Choose editable or locked version
5. **Print** → Direct from browser

### Mobile Workflow

1. **Generate PDF** from form data
2. **Download Editable** → Opens in Share sheet
3. **Edit locally** in Adobe Acrobat Reader / Xodo / PDF Expert
4. **Save and send** back (optional)
5. **Lock for Print** on desktop → Final version

## Platform Detection

Uses `detectDevice()` utility to handle:
- **iOS**: Open in new tab + Share sheet instructions
- **Android**: Direct download
- **Desktop**: Download + Print options

## Security

- ✅ V7 atomic locking prevents concurrent PDF generation
- ✅ RLS policies enforce staff-only document modification
- ✅ Authentication required for lock-pdf edge function
- ✅ pdf_history tracks all status changes
- ✅ Field locking preserves form structure (doesn't break signatures)

## Performance Considerations

### Storage Optimization

- Original PDF: ~200-500KB
- Locked PDF: ~150-400KB (slightly smaller, flattened)
- Total per document: ~400-900KB

**Recommendation:** Implement cleanup job to delete old edited versions after 30 days.

### Caching Strategy

- Locked PDFs can be cached until source data changes
- Use document.updated_at to invalidate cache
- Implement in future enhancement

## Error Handling

### Common Errors

1. **"Missing authorization header"** → User not authenticated
2. **"Failed to fetch PDF"** → Invalid URL or expired signed URL
3. **"Upload failed"** → Storage quota exceeded
4. **"Database update failed"** → RLS policy violation

### Rollback

If lock-pdf fails:
- Original editable PDF remains available
- No database changes committed
- User can retry or download editable version

## Future Enhancements

1. **Field-level diff tracking** - Show exactly what changed
2. **Version history UI** - View all PDF versions
3. **Automated cleanup** - Delete old versions after 30 days
4. **Batch locking** - Lock multiple PDFs at once
5. **Progressive Web App** - Better mobile experience with app install

## Testing Checklist

- [ ] Generate POA PDF
- [ ] Preview in modal
- [ ] Lock for print
- [ ] Verify all fields flattened
- [ ] Download locked version
- [ ] Print from browser
- [ ] Test on iOS (Share sheet)
- [ ] Test on Android (direct download)
- [ ] Verify database updates
- [ ] Check pdf_history entries

## Support

For issues or questions, see:
- Edge function logs: `supabase functions logs lock-pdf`
- Database queries: Check `documents` and `pdf_history` tables
- Browser console: Check for fetch/CORS errors
