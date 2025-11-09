# PDF FONT STANDARD

## 🎯 Core Configuration

**All PDF generation across the system MUST use this standard font configuration:**

### Font Specification
- **Font Family**: Arial Black (Helvetica-Bold in pdf-lib)
- **Color**: Dark Blue `rgb(0, 0.2, 0.5)` 
- **Size**: Auto (size: 0 - auto-fits to PDF field dimensions)

---

## 📋 Implementation Details

### Location
- **Primary Implementation**: `supabase/functions/pdf-simple/index.ts` (lines 259-296)
- **All Edge Functions**: Any function generating PDFs must follow this standard

### Code Pattern
```typescript
// PDF FONT STANDARD: Arial Black, Dark Blue, Auto-size
const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
const darkBlue = rgb(0, 0.2, 0.5);

// Apply to each text field
field.setText(String(value));
field.updateAppearances(font);
field.setFontSize(0); // 0 = auto-size
field.defaultUpdateAppearances(font);
```

### Why Helvetica-Bold?
pdf-lib doesn't have Arial Black in its standard fonts. Helvetica-Bold is the closest match:
- Similar bold weight
- Clean, professional appearance
- Excellent readability
- Consistent across all platforms

---

## 🎨 Visual Characteristics

### Auto-Sizing Behavior
- **Large fields** (e.g., full names): Text scales to fill available space
- **Small fields** (e.g., dates): Text shrinks to fit within boundaries
- **Consistent appearance**: All fields use same font family and color
- **Professional output**: Dark blue provides excellent contrast on white background

### Color Psychology
**Dark Blue `rgb(0, 0.2, 0.5)`**:
- Professional and trustworthy
- Excellent readability
- Official document appearance
- High contrast on white background

---

## 📝 Applies to All PDF Types

This standard applies to **ALL** generated PDFs:
- ✅ POA Adult
- ✅ POA Minor  
- ✅ POA Spouses
- ✅ Citizenship Application
- ✅ Family Tree
- ✅ Civil Registry (Transcription)
- ✅ Any future PDF templates

---

## 🔒 Locked Configuration

**This is a LOCKED configuration.** When anyone mentions "PDF FONT", they are referring to this exact specification:

```
PDF FONT = {
  family: "Arial Black" (Helvetica-Bold),
  color: "Dark Blue" rgb(0, 0.2, 0.5),
  size: "Auto" (0)
}
```

---

## 🤖 Agent Memory Instructions

### For All AI Agents
When generating, reviewing, or modifying PDF code:
1. **Always** use the PDF FONT standard
2. **Never** change font family, color, or sizing approach
3. **Reference** this document when asked about PDF fonts
4. **Maintain** consistency across all PDF generation functions

### For UI/UX Agent
- PDF previews should reflect the dark blue color
- Documentation should reference "PDF FONT" standard
- Any PDF-related UI should mention this configuration

### For Code Review Agent
- Verify all PDF generation uses `StandardFonts.HelveticaBold`
- Confirm `rgb(0, 0.2, 0.5)` for text color
- Check `setFontSize(0)` for auto-sizing
- Ensure `updateAppearances(font)` is called

---

## ✅ Verification Checklist

Before deploying any PDF generation code:
- [ ] Font: Helvetica-Bold embedded
- [ ] Color: rgb(0, 0.2, 0.5) applied
- [ ] Size: setFontSize(0) for auto-fit
- [ ] updateAppearances() called with font
- [ ] Works across all PDF templates
- [ ] Consistent appearance in preview

---

## 🔧 Troubleshooting

### Issue: Text too small or too large
**Solution**: The auto-size (0) should handle this. If not, check that:
- `setFontSize(0)` is being called
- Field boundaries in PDF template are correctly sized
- `updateAppearances(font)` is called after setText()

### Issue: Wrong color appears
**Solution**: Verify:
- `rgb(0, 0.2, 0.5)` is defined
- Color is applied in the correct sequence
- PDF viewer supports RGB colors (all modern viewers do)

### Issue: Font looks different
**Solution**: 
- pdf-lib uses Helvetica-Bold as the standard bold font
- This is the closest match to Arial Black
- Appearance is consistent across all platforms

---

## 📌 Last Updated
2025-11-09 - Initial PDF FONT standard established

**Revision**: 1.0  
**Status**: ACTIVE & LOCKED
