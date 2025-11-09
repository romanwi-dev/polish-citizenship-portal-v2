# PDF FONT STANDARD (POA Templates Only)

## 🎯 Core Configuration

**POA PDF generation uses this standard font configuration:**

### Font Specification
- **Font Family**: Arial Black (Helvetica-Bold in pdf-lib)
- **Color**: Dark Blue `rgb(0, 0.2, 0.5)` 
- **Size**: Auto (size: 0 - auto-fits to PDF field dimensions)

### ⚠️ Important Scope
**This standard ONLY applies to POA templates:**
- POA Adult
- POA Minor
- POA Spouses
- POA Combined

**NOT applied to:**
- Citizenship Application (uses default fonts)
- Civil Registry / Transcription (uses default fonts)
- Family Tree (uses default fonts)

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

## 📝 Applies to POA PDFs Only

This standard applies **ONLY** to POA generated PDFs:
- ✅ POA Adult
- ✅ POA Minor  
- ✅ POA Spouses
- ✅ POA Combined

**Does NOT apply to:**
- ❌ Citizenship Application
- ❌ Family Tree
- ❌ Civil Registry (Transcription)

### Future: Font Editing Options
A font editing interface is planned to allow customization of fonts for different PDF types.

---

## 🔒 Locked Configuration

**This is a LOCKED configuration for POA templates.** When anyone mentions "PDF FONT", they are referring to this exact specification for POA documents:

```
PDF FONT (POA only) = {
  family: "Arial Black" (Helvetica-Bold),
  color: "Dark Blue" rgb(0, 0.2, 0.5),
  size: "Auto" (0)
}
```

---

## 🤖 Agent Memory Instructions

### For All AI Agents
When generating, reviewing, or modifying PDF code:
1. **Always** use the PDF FONT standard for POA templates
2. **Never** apply this font to non-POA templates (citizenship, family-tree, transcription)
3. **Reference** this document when asked about PDF fonts
4. **Maintain** consistency across POA generation functions

### For UI/UX Agent
- PDF previews should reflect the dark blue color
- Documentation should reference "PDF FONT" standard
- Any PDF-related UI should mention this configuration

### For Code Review Agent
- Verify POA PDF generation uses `StandardFonts.HelveticaBold`
- Confirm `rgb(0, 0.2, 0.5)` for text color in POA templates
- Check `setFontSize(0)` for auto-sizing in POA templates
- Ensure `updateAppearances(font)` is called for POA fields
- Verify NON-POA templates (citizenship, family-tree, transcription) do NOT use custom fonts

---

## ✅ Verification Checklist

Before deploying any POA PDF generation code:
- [ ] Font: Helvetica-Bold embedded (POA templates only)
- [ ] Color: rgb(0, 0.2, 0.5) applied (POA templates only)
- [ ] Size: setFontSize(0) for auto-fit (POA templates only)
- [ ] updateAppearances() called with font (POA templates only)
- [ ] Non-POA templates use default fonts
- [ ] Works across all POA PDF templates
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
2025-11-09 - PDF FONT standard restricted to POA templates only

**Revision**: 2.0  
**Status**: ACTIVE & LOCKED (POA only)

**Future Enhancement**: Font editing interface for all PDF types
