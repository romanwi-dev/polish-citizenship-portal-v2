# MAIN CTA STANDARDS - PROJECT CORE MEMORY

## Overview
This document defines the **MAIN CTA** button style used across the entire application. This is the primary call-to-action pattern for critical user actions like "Take Polish Citizenship Test", "Get Started", "Apply Now", etc.

## Critical Rules

### ❌ NEVER DO:
- **NEVER** add `px-4`, `px-6`, or any padding to the wrapper div
- **NEVER** use `w-full` or `max-w-*` width constraints on the button
- **NEVER** override the standard padding values
- **NEVER** use different size props (always `size="lg"`)

### ✅ ALWAYS DO:
- **ALWAYS** use `size="lg"` prop on Button component
- **ALWAYS** use the exact padding: `px-12 py-6 md:px-20 md:py-6`
- **ALWAYS** center with wrapper: `flex justify-center`
- **ALWAYS** let the button size naturally based on its internal padding

## Standard Implementation

### Wrapper Pattern
```jsx
<div className="flex justify-center mt-40 mb-20 animate-fade-in" style={{ animationDelay: '600ms' }}>
  {/* Button goes here */}
</div>
```

**Key Points:**
- Simple centering with `flex justify-center`
- NO padding classes (`px-*`)
- Animation delay optional based on section timing

### Button Pattern
```jsx
<Button 
  size="lg" 
  className="text-xl md:text-2xl font-bold px-12 py-6 md:px-20 md:py-6 h-auto min-h-[64px] md:min-h-[72px] rounded-lg bg-red-700 dark:bg-red-900/60 hover:bg-red-800 dark:hover:bg-red-900/70 text-white shadow-[0_0_40px_rgba(185,28,28,0.6)] dark:shadow-[0_0_40px_rgba(127,29,29,0.6)] hover:shadow-[0_0_60px_rgba(185,28,28,0.8)] dark:hover:shadow-[0_0_60px_rgba(127,29,29,0.8)] group relative overflow-hidden backdrop-blur-md border-2 border-red-600 dark:border-red-800/40 hover:border-red-500 dark:hover:border-red-700/60 transition-all duration-300 hover:scale-105 animate-pulse"
  onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank')}
  aria-label="Take the Polish Citizenship Test to check your eligibility"
>
  <span className="relative z-10 flex items-center gap-3">
    Take Polish Citizenship Test
    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
  </span>
  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
</Button>
```

## Style Breakdown

### Size & Spacing
- **Prop:** `size="lg"`
- **Text Size:** `text-xl md:text-2xl`
- **Font Weight:** `font-bold`
- **Padding:** `px-12 py-6 md:px-20 md:py-6` (Mobile: 12px/6px, Desktop: 20px/6px)
- **Height:** `h-auto min-h-[64px] md:min-h-[72px]`
- **Border Radius:** `rounded-lg`

### Colors & Backgrounds
- **Background:** `bg-red-700 dark:bg-red-900/60`
- **Hover Background:** `hover:bg-red-800 dark:hover:bg-red-900/70`
- **Text:** `text-white`
- **Border:** `border-2 border-red-600 dark:border-red-800/40`
- **Hover Border:** `hover:border-red-500 dark:hover:border-red-700/60`

### Shadows & Effects
- **Base Shadow:** `shadow-[0_0_40px_rgba(185,28,28,0.6)] dark:shadow-[0_0_40px_rgba(127,29,29,0.6)]`
- **Hover Shadow:** `hover:shadow-[0_0_60px_rgba(185,28,28,0.8)] dark:hover:shadow-[0_0_60px_rgba(127,29,29,0.8)]`
- **Backdrop:** `backdrop-blur-md`

### Animations & Interactions
- **Base Animation:** `animate-pulse`
- **Hover Scale:** `hover:scale-105`
- **Transitions:** `transition-all duration-300`
- **Group Effects:** `group relative overflow-hidden`

### Inner Content Pattern
```jsx
<span className="relative z-10 flex items-center gap-3">
  {/* Button Text */}
  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
</span>
<div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
```

## Reference Implementations

### Current Locations Using MAIN CTA:
1. **TestimonialsSection.tsx** (Line 142-154) ✅ CORRECT
2. **HeroWeb3.tsx** - Primary hero CTA
3. **AIAnalysisSection.tsx** - Analysis start CTA
4. **PricingSection.tsx** - Plan selection CTAs

## Validation Checklist

When implementing or reviewing a MAIN CTA, verify:
- [ ] Wrapper has NO `px-*` padding classes
- [ ] Button has NO `w-full` or `max-w-*` width classes
- [ ] Button has `size="lg"` prop
- [ ] Button has exact padding: `px-12 py-6 md:px-20 md:py-6`
- [ ] Button has all color/shadow classes from standard pattern
- [ ] Button has arrow icon with `group-hover:translate-x-1`
- [ ] Button has gradient overlay div for hover effect
- [ ] Button has proper `aria-label` for accessibility

## Common Mistakes & Fixes

### Mistake 1: Button too wide on mobile
**Problem:** Added `w-full max-w-2xl` to button
**Fix:** Remove width constraints, let padding control size

### Mistake 2: Button too narrow
**Problem:** Added `px-4` to wrapper
**Fix:** Remove wrapper padding, button has its own internal padding

### Mistake 3: Inconsistent appearance
**Problem:** Modified spacing or colors
**Fix:** Use exact classes from this standard, no customization

## Memory Agent Instructions

When generating or modifying CTA buttons:
1. Check if this is a PRIMARY action → Use MAIN CTA
2. Check if this is a SECONDARY action → Use standard Button variants
3. ALWAYS reference this document for MAIN CTA implementation
4. NEVER deviate from the standard pattern
5. If user requests CTA changes, confirm if they want MAIN CTA or custom button

---

**Last Updated:** 2025-01-11
**Status:** LOCKED - Do not modify without approval
**Reference File:** `src/components/TestimonialsSection.tsx` (Line 142-154)
