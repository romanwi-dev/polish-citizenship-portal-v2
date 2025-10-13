# Mobile Navigation Design System

## Overview

This project features **10 completely different, visually stunning mobile navigation designs** that can be switched on-the-fly. Each design offers a unique aesthetic while maintaining consistent functionality.

## Features

- ✨ **Full-screen mobile navigation** using Sheet component
- 🔍 **Real-time search** across all navigation links
- 🕐 **Last Visited** tracking with timestamps
- 🎨 **10 unique design variations**
- 🌓 **Dark mode compatible** across all designs
- 📱 **Vertically scrollable** content
- 🔐 **Dynamic Login/Register button** based on auth state
- ⌨️ **Keyboard accessible** and screen reader friendly
- 💾 **Design preference saved** to localStorage

## How to Switch Designs

1. Click the **"Design"** button in the top navigation bar
2. Choose from 10 stunning variations:
   - Glassmorphic Aurora
   - Cyberpunk Neon
   - Minimal Zen
   - Neumorphic Soft
   - Material You 3D
   - Brutalist Bold
   - Gradient Mesh Flow
   - Retro Terminal
   - Luxury Gold Foil
   - Animated Particle Field

3. Your choice is automatically saved and persists across sessions

## Design Descriptions

### 1. Glassmorphic Aurora
- **Aesthetic:** Frosted glass with animated aurora gradients
- **Colors:** Blue → Purple → Pink gradients
- **Best for:** Modern, ethereal feel
- **Effects:** Animated background blobs, glassmorphism, neon glow on hover

### 2. Cyberpunk Neon
- **Aesthetic:** Dark tech with bright neon accents
- **Colors:** #00ff41 (neon green), #ff00ff (magenta), #00d4ff (cyan)
- **Best for:** Futuristic, tech-forward brands
- **Effects:** Scanline overlay, glowing borders, monospace fonts

### 3. Minimal Zen
- **Aesthetic:** Clean and minimal with subtle animations
- **Colors:** Pure black/white based on theme
- **Best for:** Professionals, minimalists
- **Effects:** Hairline underline animation, generous whitespace

### 4. Neumorphic Soft
- **Aesthetic:** Soft shadows creating tactile depth
- **Colors:** Pastel grays with subtle gradients
- **Best for:** Approachable, friendly interfaces
- **Effects:** Raised/pressed shadow effects, rounded corners

### 5. Material You 3D
- **Aesthetic:** Google Material Design 3 principles
- **Colors:** Dynamic color theming
- **Best for:** Modern Android-style apps
- **Effects:** Elevated cards with realistic shadows, hover lift

### 6. Brutalist Bold
- **Aesthetic:** Raw, high-contrast grid layout
- **Colors:** Black, white, red accents
- **Best for:** Bold statements, artistic projects
- **Effects:** Heavy typography, sharp angles, offset shadows

### 7. Gradient Mesh Flow
- **Aesthetic:** Animated mesh gradients with organic shapes
- **Colors:** Flowing purple → pink gradients
- **Best for:** Creative, fluid brands
- **Effects:** Animated background mesh, iridescent borders

### 8. Retro Terminal
- **Aesthetic:** Green monochrome CRT terminal
- **Colors:** #00ff00 (terminal green) on black
- **Best for:** Retro tech, developer tools
- **Effects:** CRT scanlines, text shadow glow, blink animation

### 9. Luxury Gold Foil
- **Aesthetic:** Dark navy with gold metallic accents
- **Colors:** Navy (#1e293b), Gold (#FFD700)
- **Best for:** Premium, luxury brands
- **Effects:** Floating gold particles, serif fonts, elegant shadows

### 10. Animated Particle Field
- **Aesthetic:** Interactive particles with sci-fi feel
- **Colors:** Blue/purple particles on black
- **Best for:** Tech, innovation-focused brands
- **Effects:** Canvas-based particles, connection lines, depth blur

## Technical Implementation

### File Structure
```
src/
├── components/
│   ├── MobileNavigationSheet.tsx (main container)
│   └── navigation/
│       ├── NavigationSearch.tsx
│       ├── LastVisitedLinks.tsx
│       ├── NavigationLinks.tsx
│       ├── DesignSelector.tsx
│       └── designs/
│           ├── GlassmorphicDesign.tsx
│           ├── CyberpunkDesign.tsx
│           ├── MinimalDesign.tsx
│           ├── NeumorphicDesign.tsx
│           ├── MaterialDesign.tsx
│           ├── BrutalistDesign.tsx
│           ├── GradientDesign.tsx
│           ├── RetroDesign.tsx
│           ├── LuxuryDesign.tsx
│           └── ParticleDesign.tsx
└── hooks/
    ├── useLastVisited.ts
    └── useNavigationDesign.ts
```

### Key Hooks

**useNavigationDesign**
- Manages current design selection
- Persists to localStorage
- Returns `{ design, changeDesign }`

**useLastVisited**
- Tracks user's navigation history
- Stores last 5 visited routes
- Auto-filters current route
- Returns visited routes with timestamps

### Navigation Structure

#### Top Section
- Documents, Law, Passport (text links)

#### Featured
- Intake Demo (highlighted)

#### Main Navigation
- FAQ, Pricing, Contact, Timeline, Services

#### Resources
- Resources, Paperwork, Testimonials

#### Admin Tools
- AI Agent, Family Tree, Client Intake, Management (with icons)

#### Auth & CTA
- Login/Register button (dynamic based on auth)
- Citizenship Test button (sticky at bottom)

## Dark Mode Support

All 10 designs are fully compatible with dark mode:
- CSS variables adjust automatically
- Contrast ratios meet WCAG AA standards
- Gradients and effects adapt to theme
- Text remains readable in all states

## Performance

- Lazy-loaded design components
- CSS transforms for GPU acceleration
- Debounced search input
- Optimized framer-motion animations
- Lightweight canvas rendering for Particle design

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation (Tab, Shift+Tab)
- Esc key closes sheet
- Focus trap when open
- Screen reader announcements
- Reduced motion support (respects user preferences)

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile Safari (iOS 14+)
- Chrome Android
- Responsive across all device sizes

## Future Enhancements

- [ ] More design variations (anime, watercolor, 3D isometric)
- [ ] Custom theme creator
- [ ] Import/export design configs
- [ ] A/B testing analytics
- [ ] User-submitted designs gallery

---

Built with ❤️ using React, Tailwind CSS, Framer Motion, and Radix UI
