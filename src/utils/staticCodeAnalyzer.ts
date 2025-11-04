/**
 * Static Code Analyzer
 * Performs local analysis without AI credits
 * Catches common code smells and issues
 */

export interface StaticIssue {
  line: number;
  severity: 'warning' | 'info';
  category: string;
  title: string;
  description: string;
}

export interface StaticAnalysisResult {
  fileName: string;
  issues: StaticIssue[];
  stats: {
    totalLines: number;
    consoleLogsFound: number;
    todosFound: number;
    missingErrorHandling: number;
    longFunctions: number;
  };
}

/**
 * Analyze a single file for common issues
 */
export function analyzeFile(fileName: string, content: string): StaticAnalysisResult {
  const lines = content.split('\n');
  const issues: StaticIssue[] = [];
  
  const stats = {
    totalLines: lines.length,
    consoleLogsFound: 0,
    todosFound: 0,
    missingErrorHandling: 0,
    longFunctions: 0,
  };

  // Track function boundaries for error handling checks
  let inFunction = false;
  let functionStartLine = 0;
  let functionHasErrorHandling = false;
  let functionName = '';
  let functionLineCount = 0;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();

    // 1. Check for console.log statements
    if (/console\.(log|warn|error|debug|info)/.test(line)) {
      stats.consoleLogsFound++;
      issues.push({
        line: lineNumber,
        severity: 'warning',
        category: 'Debug Code',
        title: 'Console statement found',
        description: 'Remove console statements before production. Use proper logging utilities instead.',
      });
    }

    // 2. Check for TODO/FIXME comments
    if (/\/\/\s*(TODO|FIXME|XXX|HACK)/i.test(line)) {
      stats.todosFound++;
      issues.push({
        line: lineNumber,
        severity: 'info',
        category: 'Technical Debt',
        title: 'TODO comment found',
        description: 'Unresolved TODO comment. Consider creating a task or fixing before production.',
      });
    }

    // 3. Check for debugger statements
    if (/^\s*debugger[;\s]*$/.test(trimmedLine)) {
      issues.push({
        line: lineNumber,
        severity: 'warning',
        category: 'Debug Code',
        title: 'Debugger statement found',
        description: 'Remove debugger statements before production deployment.',
      });
    }

    // 4. Track function boundaries for error handling and length checks
    const functionMatch = line.match(/(async\s+)?function\s+(\w+)|const\s+(\w+)\s*=\s*(async\s+)?\(/);
    if (functionMatch && trimmedLine.includes('{')) {
      inFunction = true;
      functionStartLine = lineNumber;
      functionHasErrorHandling = false;
      functionName = functionMatch[2] || functionMatch[3] || 'anonymous';
      functionLineCount = 0;
    }

    if (inFunction) {
      functionLineCount++;
      
      // Check for error handling patterns
      if (/try\s*{|catch\s*\(|\.catch\(|throw\s+/.test(line)) {
        functionHasErrorHandling = true;
      }

      // Check for function end
      if (trimmedLine === '}' && functionLineCount > 1) {
        // Function ended - check for issues
        
        // Check if function is too long (>50 lines)
        if (functionLineCount > 50) {
          stats.longFunctions++;
          issues.push({
            line: functionStartLine,
            severity: 'info',
            category: 'Maintainability',
            title: `Function "${functionName}" is too long (${functionLineCount} lines)`,
            description: 'Consider breaking down into smaller functions. Functions over 50 lines are harder to maintain.',
          });
        }

        // Check for missing error handling in async functions
        const isAsync = lines[functionStartLine - 1]?.includes('async');
        if (isAsync && !functionHasErrorHandling && functionLineCount > 5) {
          stats.missingErrorHandling++;
          issues.push({
            line: functionStartLine,
            severity: 'warning',
            category: 'Error Handling',
            title: `Async function "${functionName}" missing error handling`,
            description: 'Async functions should have try-catch blocks or .catch() handlers to prevent unhandled promise rejections.',
          });
        }

        inFunction = false;
      }
    }

    // 5. Check for any type usage
    if (/:\s*any[\s,;\)\]]/.test(line) || /as\s+any/.test(line)) {
      issues.push({
        line: lineNumber,
        severity: 'info',
        category: 'Type Safety',
        title: 'Usage of "any" type',
        description: 'Avoid using "any" type. Use specific types or "unknown" for better type safety.',
      });
    }

    // 6. Check for hardcoded credentials patterns
    if (/password\s*=\s*['"][^'"]+['"]|api[_-]?key\s*=\s*['"][^'"]+['"]/i.test(line)) {
      issues.push({
        line: lineNumber,
        severity: 'warning',
        category: 'Security',
        title: 'Potential hardcoded credentials',
        description: 'Never hardcode passwords or API keys. Use environment variables or secrets management.',
      });
    }

    // 7. Check for direct DOM manipulation in React files
    if (fileName.endsWith('.tsx') || fileName.endsWith('.jsx')) {
      if (/document\.(getElementById|querySelector|getElementsBy)/.test(line)) {
        issues.push({
          line: lineNumber,
          severity: 'info',
          category: 'React Best Practices',
          title: 'Direct DOM manipulation in React',
          description: 'Use React refs instead of direct DOM queries. Direct DOM access can cause conflicts with React\'s virtual DOM.',
        });
      }
    }

    // 8. Check for eval usage
    if (/\beval\s*\(/.test(line)) {
      issues.push({
        line: lineNumber,
        severity: 'warning',
        category: 'Security',
        title: 'eval() usage detected',
        description: 'Avoid using eval(). It poses security risks and performance issues.',
      });
    }
  });

  return {
    fileName,
    issues,
    stats,
  };
}

/**
 * Generate a summary report for multiple files
 */
export function generateSummary(results: StaticAnalysisResult[]) {
  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
  const totalWarnings = results.reduce(
    (sum, r) => sum + r.issues.filter(i => i.severity === 'warning').length, 
    0
  );
  const totalInfo = results.reduce(
    (sum, r) => sum + r.issues.filter(i => i.severity === 'info').length, 
    0
  );

  const categoryBreakdown = results.reduce((acc, result) => {
    result.issues.forEach(issue => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  return {
    totalFiles: results.length,
    totalIssues,
    totalWarnings,
    totalInfo,
    categoryBreakdown,
    criticalFiles: results
      .filter(r => r.issues.filter(i => i.severity === 'warning').length > 3)
      .map(r => r.fileName),
  };
}
