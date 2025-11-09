# PREVIEW SCREEN STANDARD

## Overview
This document defines the standardized layout and behavior for all PDF preview screens across the application.

## Display Settings

### Window Type
- **Format**: Modal Dialog (Popup)
- **Position**: Centered overlay on top of all content
- **NOT**: Embedded at bottom of forms
- **Size**: 
  - Desktop: `max-w-7xl` (98vw max)
  - Height: `95vh`
  - Mobile: Full screen with proper padding

### Visibility
The PDF must be **immediately visible** in the preview iframe when the dialog opens. Users should see the document content without needing to download or open in a new tab.

## Button Layout

### Desktop
- **Alignment**: Centered horizontally
- **Button Order** (left to right):
  1. Close
  2. Optimize
  3. Edit
  4. Download (dropdown menu)
  5. Print

- **Button Styling**:
  - Minimum width: `140px`
  - Consistent spacing: `gap-3`
  - Close: `outline` variant
  - Optimize: `secondary` variant (currently disabled)
  - Edit: `secondary` variant
  - Download: `default` variant (primary)
  - Print: `secondary` variant

### Mobile
- **Layout**: Stacked vertically
- **Button Order** (top to bottom):
  1. Print PDF (with icon)
  2. Download Editable PDF (with icon)
  3. Download Final (Locked) (with icon)
  4. Close

- **Button Styling**:
  - Full width: `w-full`
  - Icons included for clarity

## Button Functions

1. **Close**: Closes the preview dialog
2. **Optimize**: Reserved for future PDF optimization features (currently disabled)
3. **Edit**: Opens PDF in new tab for editing
4. **Download**: Dropdown menu with two options:
   - Editable (for offline editing)
   - Final (locked fields)
5. **Print**: Opens print dialog or new tab (mobile-optimized)

## Usage Notes

- This standard applies to ALL PDF preview dialogs
- POA, Citizenship Applications, and other document types must follow this layout
- The preview must appear as a popup dialog, not embedded in page flow
- Mobile users should see helpful editing instructions when applicable

## Implementation Reference

See `src/components/PDFPreviewDialog.tsx` for the reference implementation.

---

**Keyword**: `PREVIEW SCREEN` - Use this trigger to reference these standards.
