# WORKFLOW CARD STANDARDS - LOCKED CONFIGURATION

⚠️ **CRITICAL: These standards are LOCKED and must not be modified without explicit approval.**

## Universal Application

These standards apply to ALL workflow card displays across the entire portal:

1. ✅ Complete Legal Process Timeline
2. ✅ How to Become Our Client
3. ✅ Documents Workflow (reference implementation)
4. ✅ All Case Workflows:
   - Translations Workflow
   - Archives/Research Workflow  
   - Citizenship Workflow
   - Civil Acts/Transcription Workflow
   - Passport Workflow
   - Extended Services Workflow

## Design Specifications

### Timeline Dots (MANDATORY)
- **Size**: 48px × 48px (`w-12 h-12`)
- **Style**: Circular with blue background
- **Border**: 4px white border (`border-4 border-background`)
- **Content**: White step number centered inside
- **Shadow**: Blue glow effect (`shadow-[0_0_20px_rgba(59,130,246,0.3)]`)
- **Number**: White, bold, font-heading, text-lg

### Card Display Rules
- ❌ **NO number badges** on card fronts
- ❌ **NO gradient number overlays** on cards
- ✅ **Numbers ONLY** on timeline dots

### Layout Proportions
- Card: `md:w-[42%]`
- Timeline: `md:w-[16%]`  
- Empty space: `md:w-[42%]`
- Alternating left-right layout

### Card Height
- Desktop/Mobile: `h-[520px]` (fixed)

## AI Agent Memory

This configuration is stored in:
- `src/config/workflowCardStandards.ts` (TypeScript config)
- `src/components/workflows/workflow-card-standards.ts` (existing standards file)
- This documentation file (markdown reference)

When making ANY changes to workflow cards, always:
1. ✅ Check this documentation first
2. ✅ Import and use `WORKFLOW_CARD_STANDARDS`
3. ✅ Maintain consistency across ALL workflows
4. ✅ Never deviate from locked specifications
