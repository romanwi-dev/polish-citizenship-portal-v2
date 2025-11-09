export interface MobileFirstViolation {
  severity: 'critical' | 'high' | 'medium' | 'low';
  file: string;
  line?: number;
  rule: string;
  issue: string;
  fix: string;
  impact: string;
}

export interface MobileFirstScanResult {
  overallScore: number;
  compliance: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  violations: MobileFirstViolation[];
  recommendations: string[];
  summary: string;
}

export const MOBILE_FIRST_RULES = {
  viewport: {
    name: "Viewport Meta Tag",
    check: "Must include user-scalable=no, maximum-scale=1.0, viewport-fit=cover",
    severity: "critical" as const
  },
  touchTargets: {
    name: "Touch Target Size",
    check: "Minimum 44x44px (iOS) / 48x48px (Android)",
    severity: "high" as const
  },
  responsive: {
    name: "Mobile-First CSS",
    check: "Use min-width media queries, NOT max-width",
    severity: "high" as const
  },
  share: {
    name: "Native Share API",
    check: "Use navigator.share() for sharing on mobile",
    severity: "high" as const
  },
  images: {
    name: "Image Optimization",
    check: "Lazy loading, WebP, max 1200px, compression",
    severity: "medium" as const
  },
  forms: {
    name: "Mobile Form Inputs",
    check: "inputMode, autoCapitalize, autoComplete, touch-manipulation",
    severity: "medium" as const
  },
  fonts: {
    name: "Font Sizing",
    check: "Minimum 16px base font (prevents iOS zoom)",
    severity: "medium" as const
  },
  performance: {
    name: "Mobile Performance",
    check: "Code splitting, lazy loading, Service Worker",
    severity: "low" as const
  }
};

export function getComplianceColor(compliance: string): string {
  switch (compliance) {
    case 'excellent': return 'text-green-500';
    case 'good': return 'text-blue-500';
    case 'fair': return 'text-yellow-500';
    case 'poor': return 'text-orange-500';
    case 'critical': return 'text-red-500';
    default: return 'text-muted-foreground';
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'bg-red-500';
    case 'high': return 'bg-orange-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-blue-500';
    default: return 'bg-muted';
  }
}
