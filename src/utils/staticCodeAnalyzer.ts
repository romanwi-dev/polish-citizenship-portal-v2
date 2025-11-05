/**
 * PHASE 3: Static Code Analyzer for Security Scanning
 * Detects common vulnerabilities: SQL injection, XSS, hardcoded secrets, insecure API calls
 */

export type VulnerabilitySeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface SecurityFinding {
  id: string;
  type: VulnerabilityType;
  severity: VulnerabilitySeverity;
  line?: number;
  column?: number;
  message: string;
  description: string;
  recommendation: string;
  codeSnippet?: string;
  cwe?: string;
}

export type VulnerabilityType =
  | 'sql_injection'
  | 'xss'
  | 'hardcoded_secret'
  | 'insecure_api'
  | 'insecure_random'
  | 'path_traversal'
  | 'command_injection'
  | 'weak_crypto'
  | 'exposed_pii'
  | 'missing_validation'
  | 'insecure_auth';

interface ScanOptions {
  checkSQLInjection?: boolean;
  checkXSS?: boolean;
  checkSecrets?: boolean;
  checkInsecureAPIs?: boolean;
  checkAll?: boolean;
}

const SECURITY_PATTERNS = {
  sqlInjection: [
    {
      pattern: /(\$\{[^}]*\}|\+\s*['\"`]|['\"`]\s*\+).*?(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)/gi,
      message: 'Potential SQL injection: Dynamic SQL construction with string concatenation',
      cwe: 'CWE-89'
    }
  ],

  xss: [
    {
      pattern: /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html:/gi,
      message: 'XSS risk: dangerouslySetInnerHTML without sanitization',
      cwe: 'CWE-79'
    },
    {
      pattern: /eval\s*\(/gi,
      message: 'XSS/Code injection risk: eval() executes arbitrary code',
      cwe: 'CWE-95'
    }
  ],

  secrets: [
    {
      pattern: /(?:api[_-]?key|apikey|secret[_-]?key|password|passwd|pwd|token|auth[_-]?token|access[_-]?token|private[_-]?key)\s*[:=]\s*['\"`][\w\-_]{16,}['\"`]/gi,
      message: 'Hardcoded secret detected: API key or password in source code',
      cwe: 'CWE-798'
    }
  ],

  insecureAPI: [
    {
      pattern: /fetch\s*\(\s*['\"`]http:\/\//gi,
      message: 'Insecure API call: Using HTTP instead of HTTPS',
      cwe: 'CWE-319'
    }
  ]
};

const SEVERITY_MAP: Record<VulnerabilityType, VulnerabilitySeverity> = {
  sql_injection: 'critical',
  xss: 'high',
  hardcoded_secret: 'critical',
  insecure_api: 'high',
  insecure_random: 'medium',
  path_traversal: 'high',
  command_injection: 'critical',
  weak_crypto: 'medium',
  exposed_pii: 'high',
  missing_validation: 'medium',
  insecure_auth: 'critical'
};

const RECOMMENDATIONS: Record<VulnerabilityType, string> = {
  sql_injection: 'Use parameterized queries or prepared statements.',
  xss: 'Sanitize user input with DOMPurify before rendering.',
  hardcoded_secret: 'Store secrets in Lovable Cloud secrets.',
  insecure_api: 'Always use HTTPS for API calls.',
  insecure_random: 'Use crypto.getRandomValues() for security operations.',
  path_traversal: 'Validate and sanitize file paths.',
  command_injection: 'Avoid shell command execution with user input.',
  weak_crypto: 'Use strong algorithms: AES-256-GCM for encryption.',
  exposed_pii: 'Never log PII to console or store in browser storage.',
  missing_validation: 'Validate all user inputs with schema validation.',
  insecure_auth: 'Implement server-side authentication.'
};

export class StaticCodeAnalyzer {
  private findings: SecurityFinding[] = [];
  private findingIdCounter = 0;

  scanCode(code: string, options: ScanOptions = { checkAll: true }): SecurityFinding[] {
    this.findings = [];
    this.findingIdCounter = 0;

    const shouldCheckAll = options.checkAll !== false;

    if (shouldCheckAll || options.checkSQLInjection) {
      this.checkSQLInjection(code);
    }

    if (shouldCheckAll || options.checkXSS) {
      this.checkXSS(code);
    }

    if (shouldCheckAll || options.checkSecrets) {
      this.checkHardcodedSecrets(code);
    }

    if (shouldCheckAll || options.checkInsecureAPIs) {
      this.checkInsecureAPIs(code);
    }

    return this.findings;
  }

  private checkSQLInjection(code: string): void {
    SECURITY_PATTERNS.sqlInjection.forEach(({ pattern, message, cwe }) => {
      this.findMatches(code, pattern, 'sql_injection', message, cwe);
    });
  }

  private checkXSS(code: string): void {
    SECURITY_PATTERNS.xss.forEach(({ pattern, message, cwe }) => {
      this.findMatches(code, pattern, 'xss', message, cwe);
    });
  }

  private checkHardcodedSecrets(code: string): void {
    SECURITY_PATTERNS.secrets.forEach(({ pattern, message, cwe }) => {
      this.findMatches(code, pattern, 'hardcoded_secret', message, cwe);
    });
  }

  private checkInsecureAPIs(code: string): void {
    SECURITY_PATTERNS.insecureAPI.forEach(({ pattern, message, cwe }) => {
      this.findMatches(code, pattern, 'insecure_api', message, cwe);
    });
  }

  private findMatches(
    code: string,
    pattern: RegExp,
    type: VulnerabilityType,
    message: string,
    cwe?: string
  ): void {
    const lines = code.split('\n');
    let match: RegExpExecArray | null;

    pattern.lastIndex = 0;

    while ((match = pattern.exec(code)) !== null) {
      const matchIndex = match.index;
      const lineNumber = this.getLineNumber(code, matchIndex);
      const column = this.getColumnNumber(code, matchIndex);
      const codeSnippet = this.extractCodeSnippet(lines, lineNumber);

      this.findings.push({
        id: `finding-${++this.findingIdCounter}`,
        type,
        severity: SEVERITY_MAP[type],
        line: lineNumber,
        column,
        message,
        description: this.getDescription(type, match[0]),
        recommendation: RECOMMENDATIONS[type],
        codeSnippet,
        cwe
      });
    }
  }

  private getLineNumber(code: string, index: number): number {
    return code.substring(0, index).split('\n').length;
  }

  private getColumnNumber(code: string, index: number): number {
    const lastNewline = code.lastIndexOf('\n', index);
    return index - lastNewline;
  }

  private extractCodeSnippet(lines: string[], lineNumber: number): string {
    const startLine = Math.max(0, lineNumber - 2);
    const endLine = Math.min(lines.length, lineNumber + 1);
    return lines.slice(startLine, endLine).join('\n');
  }

  private getDescription(type: VulnerabilityType, matchedCode: string): string {
    const descriptions: Record<VulnerabilityType, string> = {
      sql_injection: `SQL injection vulnerability found: "${matchedCode.substring(0, 50)}..."`,
      xss: `XSS vulnerability found: "${matchedCode.substring(0, 50)}..."`,
      hardcoded_secret: `Hardcoded secret found: "${matchedCode.substring(0, 30)}..."`,
      insecure_api: `Insecure API found: "${matchedCode.substring(0, 50)}..."`,
      insecure_random: `Insecure random found: "${matchedCode.substring(0, 50)}..."`,
      path_traversal: `Path traversal found: "${matchedCode.substring(0, 50)}..."`,
      command_injection: `Command injection found: "${matchedCode.substring(0, 50)}..."`,
      weak_crypto: `Weak crypto found: "${matchedCode.substring(0, 50)}..."`,
      exposed_pii: `Exposed PII found: "${matchedCode.substring(0, 50)}..."`,
      missing_validation: `Missing validation found: "${matchedCode.substring(0, 50)}..."`,
      insecure_auth: `Insecure auth found: "${matchedCode.substring(0, 50)}..."`
    };

    return descriptions[type];
  }

  getSummary() {
    const summary = {
      total: this.findings.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
      byType: {} as Record<VulnerabilityType, number>
    };

    this.findings.forEach(finding => {
      summary[finding.severity]++;
      summary.byType[finding.type] = (summary.byType[finding.type] || 0) + 1;
    });

    return summary;
  }
}

export function scanCodeForVulnerabilities(code: string, options?: ScanOptions): SecurityFinding[] {
  const analyzer = new StaticCodeAnalyzer();
  return analyzer.scanCode(code, options);
}

/**
 * Legacy compatibility exports for existing components
 */
export interface StaticAnalysisResult {
  fileName: string;
  findings: SecurityFinding[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    byType: Record<VulnerabilityType, number>;
  };
}

export async function analyzeFile(
  fileName: string,
  content: string,
  options?: ScanOptions
): Promise<StaticAnalysisResult> {
  try {
    const analyzer = new StaticCodeAnalyzer();
    const findings = analyzer.scanCode(content, options);
    const summary = analyzer.getSummary();

    return {
      fileName,
      findings,
      summary
    };
  } catch (error) {
    // Return empty analysis on error
    console.error(`Static analysis failed for ${fileName}:`, error);
    return {
      fileName,
      findings: [],
      summary: {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
        byType: {} as Record<VulnerabilityType, number>
      }
    };
  }
}

export function generateSummary(results: StaticAnalysisResult[]): {
  totalFiles: number;
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  mostCommonVulnerability: VulnerabilityType | null;
} {
  const summary = {
    totalFiles: results.length,
    totalFindings: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    infoCount: 0,
    mostCommonVulnerability: null as VulnerabilityType | null
  };

  const vulnerabilityCounts: Record<string, number> = {};

  results.forEach(result => {
    summary.totalFindings += result.findings.length;
    summary.criticalCount += result.summary.critical;
    summary.highCount += result.summary.high;
    summary.mediumCount += result.summary.medium;
    summary.lowCount += result.summary.low;
    summary.infoCount += result.summary.info;

    result.findings.forEach(finding => {
      vulnerabilityCounts[finding.type] = (vulnerabilityCounts[finding.type] || 0) + 1;
    });
  });

  if (Object.keys(vulnerabilityCounts).length > 0) {
    const mostCommon = Object.entries(vulnerabilityCounts).sort((a, b) => b[1] - a[1])[0];
    summary.mostCommonVulnerability = mostCommon[0] as VulnerabilityType;
  }

  return summary;
}
