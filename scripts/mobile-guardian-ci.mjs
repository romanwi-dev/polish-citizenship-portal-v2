#!/usr/bin/env node

/**
 * Mobile-First Guardian CI/CD Scanner
 * Runs compliance checks and generates reports for CI/CD pipelines
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const MINIMUM_SCORE = 80;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing required environment variables');
  console.error('Required: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function scanFiles() {
  console.log('📂 Scanning mobile-critical files...\n');
  
  const filesToScan = [
    { path: 'index.html', type: 'viewport', content: fs.readFileSync('index.html', 'utf8') },
    { path: 'src/pages/admin/POAForm.tsx', type: 'forms', content: fs.existsSync('src/pages/admin/POAForm.tsx') ? fs.readFileSync('src/pages/admin/POAForm.tsx', 'utf8') : '' },
    { path: 'src/components/poa/POAOCRScanner.tsx', type: 'upload', content: fs.existsSync('src/components/poa/POAOCRScanner.tsx') ? fs.readFileSync('src/components/poa/POAOCRScanner.tsx', 'utf8') : '' },
    { path: 'src/components/poa/PDFPreviewDialog.tsx', type: 'preview', content: fs.existsSync('src/components/poa/PDFPreviewDialog.tsx') ? fs.readFileSync('src/components/poa/PDFPreviewDialog.tsx', 'utf8') : '' },
    { path: 'src/index.css', type: 'styles', content: fs.readFileSync('src/index.css', 'utf8') }
  ].filter(f => f.content);

  console.log(`Found ${filesToScan.length} files to analyze\n`);

  const { data, error } = await supabase.functions.invoke('mobile-first-guardian', {
    body: { 
      action: 'scan',
      files: filesToScan
    }
  });

  if (error) {
    console.error('❌ Guardian scan failed:', error.message);
    process.exit(1);
  }

  if (!data.success || !data.result) {
    console.error('❌ Invalid scan result');
    process.exit(1);
  }

  return data.result;
}

function printReport(result) {
  const { overallScore, compliance, violations, recommendations, summary } = result;
  
  console.log('\n' + '='.repeat(60));
  console.log('📱 MOBILE-FIRST GUARDIAN CI/CD REPORT');
  console.log('='.repeat(60) + '\n');
  
  // Overall Score
  const scoreColor = overallScore >= 80 ? '\x1b[32m' : '\x1b[31m';
  const resetColor = '\x1b[0m';
  
  console.log(`${scoreColor}OVERALL SCORE: ${overallScore}/100${resetColor}`);
  console.log(`COMPLIANCE: ${compliance.toUpperCase()}\n`);
  console.log(`SUMMARY: ${summary}\n`);
  
  // Violations by severity
  const critical = violations.filter(v => v.severity === 'critical');
  const high = violations.filter(v => v.severity === 'high');
  const medium = violations.filter(v => v.severity === 'medium');
  const low = violations.filter(v => v.severity === 'low');
  
  if (violations.length > 0) {
    console.log('\n🚨 VIOLATIONS FOUND:\n');
    console.log(`  Critical: ${critical.length}`);
    console.log(`  High:     ${high.length}`);
    console.log(`  Medium:   ${medium.length}`);
    console.log(`  Low:      ${low.length}\n`);
    
    if (critical.length > 0) {
      console.log('\n🔴 CRITICAL VIOLATIONS:\n');
      critical.forEach((v, idx) => {
        console.log(`${idx + 1}. ${v.rule} (${v.file}${v.line ? ':' + v.line : ''})`);
        console.log(`   Issue: ${v.issue}`);
        console.log(`   Fix: ${v.fix}`);
        console.log(`   Impact: ${v.impact}\n`);
      });
    }
    
    if (high.length > 0) {
      console.log('\n🟠 HIGH PRIORITY VIOLATIONS:\n');
      high.forEach((v, idx) => {
        console.log(`${idx + 1}. ${v.rule} (${v.file}${v.line ? ':' + v.line : ''})`);
        console.log(`   Issue: ${v.issue}\n`);
      });
    }
  }
  
  if (recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS:\n');
    recommendations.slice(0, 10).forEach((rec, idx) => {
      console.log(`${idx + 1}. ${rec}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (overallScore >= MINIMUM_SCORE) {
    console.log(`${scoreColor}✅ DEPLOYMENT APPROVED${resetColor}`);
    console.log(`Score ${overallScore}/100 meets minimum threshold (${MINIMUM_SCORE}/100)`);
  } else {
    console.log(`${scoreColor}❌ DEPLOYMENT BLOCKED${resetColor}`);
    console.log(`Score ${overallScore}/100 below minimum threshold (${MINIMUM_SCORE}/100)`);
  }
  
  console.log('='.repeat(60) + '\n');
}

async function main() {
  console.log('🛡️  Mobile-First Guardian CI/CD Scanner v1.0\n');
  
  const result = await scanFiles();
  
  // Generate JSON report
  const reportPath = 'mobile-guardian-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
  console.log(`📄 Report saved to ${reportPath}\n`);
  
  // Print human-readable report
  printReport(result);
  
  // Exit with appropriate code
  if (result.overallScore < MINIMUM_SCORE) {
    process.exit(1);
  }
  
  process.exit(0);
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
