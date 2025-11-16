/**
 * SEO Validation Utility
 * Automated checks for SEO best practices across all language versions
 */

interface SEOValidationResult {
  category: string;
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

export class SEOValidator {
  private results: SEOValidationResult[] = [];
  private baseUrl: string;

  constructor(baseUrl: string = window.location.origin) {
    this.baseUrl = baseUrl;
  }

  /**
   * Run all SEO validation tests
   */
  async runAllTests(): Promise<SEOValidationResult[]> {
    this.results = [];

    await this.validateMetaTags();
    await this.validateStructuredData();
    await this.validateHreflang();
    await this.validateImages();
    await this.validatePerformance();
    await this.validateAccessibility();

    return this.results;
  }

  /**
   * Validate meta tags
   */
  private async validateMetaTags(): Promise<void> {
    const title = document.querySelector('title');
    const description = document.querySelector('meta[name="description"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');

    // Title validation
    if (title && title.textContent) {
      const titleLength = title.textContent.length;
      if (titleLength > 0 && titleLength <= 60) {
        this.addResult('Meta Tags', 'Title Length', 'pass', `Title is ${titleLength} characters (optimal: 50-60)`);
      } else if (titleLength > 60) {
        this.addResult('Meta Tags', 'Title Length', 'warning', `Title is ${titleLength} characters (may be truncated in search results)`);
      } else {
        this.addResult('Meta Tags', 'Title Length', 'fail', 'Title is missing');
      }
    }

    // Description validation
    if (description) {
      const content = description.getAttribute('content') || '';
      const descLength = content.length;
      if (descLength > 0 && descLength <= 160) {
        this.addResult('Meta Tags', 'Description Length', 'pass', `Description is ${descLength} characters (optimal: 150-160)`);
      } else if (descLength > 160) {
        this.addResult('Meta Tags', 'Description Length', 'warning', `Description is ${descLength} characters (may be truncated)`);
      } else {
        this.addResult('Meta Tags', 'Description Length', 'fail', 'Description is missing');
      }
    }

    // Open Graph validation
    if (ogTitle && ogDescription && ogImage) {
      this.addResult('Meta Tags', 'Open Graph', 'pass', 'All required OG tags present');
    } else {
      this.addResult('Meta Tags', 'Open Graph', 'fail', 'Missing required Open Graph tags');
    }

    // Canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      this.addResult('Meta Tags', 'Canonical URL', 'pass', 'Canonical URL is set');
    } else {
      this.addResult('Meta Tags', 'Canonical URL', 'warning', 'Canonical URL is missing');
    }
  }

  /**
   * Validate structured data (JSON-LD)
   */
  private async validateStructuredData(): Promise<void> {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    
    if (scripts.length === 0) {
      this.addResult('Structured Data', 'JSON-LD', 'fail', 'No structured data found');
      return;
    }

    let validSchemas = 0;
    let invalidSchemas = 0;

    scripts.forEach((script) => {
      try {
        const data = JSON.parse(script.textContent || '');
        
        if (data['@context'] && data['@type']) {
          validSchemas++;
          this.addResult('Structured Data', `${data['@type']} Schema`, 'pass', `Valid ${data['@type']} schema found`);
        } else {
          invalidSchemas++;
        }
      } catch (e) {
        invalidSchemas++;
        this.addResult('Structured Data', 'JSON-LD Parse', 'fail', 'Invalid JSON-LD syntax');
      }
    });

    this.addResult('Structured Data', 'Schema Summary', 'pass', 
      `${validSchemas} valid schemas, ${invalidSchemas} invalid schemas`);
  }

  /**
   * Validate hreflang implementation
   */
  private async validateHreflang(): Promise<void> {
    const hreflangs = document.querySelectorAll('link[rel="alternate"][hreflang]');
    
    if (hreflangs.length === 0) {
      this.addResult('Hreflang', 'Tags Present', 'fail', 'No hreflang tags found');
      return;
    }

    const languages = new Set<string>();
    const urls = new Map<string, string>();

    hreflangs.forEach((link) => {
      const lang = link.getAttribute('hreflang');
      const href = link.getAttribute('href');
      
      if (lang && href) {
        languages.add(lang);
        urls.set(lang, href);
      }
    });

    // Check for x-default
    const hasXDefault = Array.from(hreflangs).some(
      link => link.getAttribute('hreflang') === 'x-default'
    );

    if (hasXDefault) {
      this.addResult('Hreflang', 'X-Default', 'pass', 'x-default fallback is set');
    } else {
      this.addResult('Hreflang', 'X-Default', 'warning', 'x-default fallback is missing');
    }

    this.addResult('Hreflang', 'Language Coverage', 'pass', 
      `${languages.size} languages configured: ${Array.from(languages).join(', ')}`);
  }

  /**
   * Validate images
   */
  private async validateImages(): Promise<void> {
    const images = document.querySelectorAll('img');
    let totalImages = 0;
    let imagesWithAlt = 0;
    let imagesWithoutAlt = 0;
    let imagesWithLazyLoading = 0;

    images.forEach((img) => {
      totalImages++;
      
      if (img.alt) {
        imagesWithAlt++;
      } else {
        imagesWithoutAlt++;
      }

      if (img.loading === 'lazy') {
        imagesWithLazyLoading++;
      }
    });

    if (imagesWithoutAlt === 0) {
      this.addResult('Images', 'Alt Tags', 'pass', `All ${totalImages} images have alt tags`);
    } else {
      this.addResult('Images', 'Alt Tags', 'fail', 
        `${imagesWithoutAlt} of ${totalImages} images are missing alt tags`);
    }

    const lazyLoadPercentage = Math.round((imagesWithLazyLoading / totalImages) * 100);
    if (lazyLoadPercentage > 50) {
      this.addResult('Images', 'Lazy Loading', 'pass', 
        `${lazyLoadPercentage}% of images use lazy loading`);
    } else {
      this.addResult('Images', 'Lazy Loading', 'warning', 
        `Only ${lazyLoadPercentage}% of images use lazy loading`);
    }
  }

  /**
   * Validate performance metrics
   */
  private async validatePerformance(): Promise<void> {
    if ('web-vitals' in window || (window as any).webVitals) {
      this.addResult('Performance', 'Web Vitals', 'pass', 'Web Vitals tracking is enabled');
    } else {
      this.addResult('Performance', 'Web Vitals', 'warning', 'Web Vitals tracking not detected');
    }

    // Check for resource hints
    const preconnects = document.querySelectorAll('link[rel="preconnect"]');
    const dnsPrefetch = document.querySelectorAll('link[rel="dns-prefetch"]');
    const preloads = document.querySelectorAll('link[rel="preload"]');

    if (preconnects.length > 0) {
      this.addResult('Performance', 'Preconnect', 'pass', `${preconnects.length} preconnect hints found`);
    }

    if (dnsPrefetch.length > 0) {
      this.addResult('Performance', 'DNS Prefetch', 'pass', `${dnsPrefetch.length} DNS prefetch hints found`);
    }

    if (preloads.length > 0) {
      this.addResult('Performance', 'Preload', 'pass', `${preloads.length} resource preloads found`);
    }

    // Check for service worker
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        this.addResult('Performance', 'Service Worker', 'pass', 'Service worker is registered and active');
      } else {
        this.addResult('Performance', 'Service Worker', 'warning', 'Service worker not registered (expected in dev)');
      }
    }
  }

  /**
   * Validate basic accessibility
   */
  private async validateAccessibility(): Promise<void> {
    // Check for lang attribute
    const htmlLang = document.documentElement.lang;
    if (htmlLang) {
      this.addResult('Accessibility', 'Language', 'pass', `HTML lang attribute is set to "${htmlLang}"`);
    } else {
      this.addResult('Accessibility', 'Language', 'fail', 'HTML lang attribute is missing');
    }

    // Check for viewport meta
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      this.addResult('Accessibility', 'Viewport', 'pass', 'Viewport meta tag is present');
    } else {
      this.addResult('Accessibility', 'Viewport', 'fail', 'Viewport meta tag is missing');
    }

    // Check for skip links
    const skipLink = document.querySelector('a[href^="#"][href*="main"], a[href^="#"][href*="content"]');
    if (skipLink) {
      this.addResult('Accessibility', 'Skip Links', 'pass', 'Skip to content link found');
    } else {
      this.addResult('Accessibility', 'Skip Links', 'warning', 'No skip to content link found');
    }

    // Check heading hierarchy
    const h1s = document.querySelectorAll('h1');
    if (h1s.length === 1) {
      this.addResult('Accessibility', 'H1 Tags', 'pass', 'Single H1 tag found (best practice)');
    } else if (h1s.length === 0) {
      this.addResult('Accessibility', 'H1 Tags', 'fail', 'No H1 tag found');
    } else {
      this.addResult('Accessibility', 'H1 Tags', 'warning', `Multiple H1 tags found (${h1s.length})`);
    }
  }

  /**
   * Add a validation result
   */
  private addResult(
    category: string, 
    test: string, 
    status: 'pass' | 'fail' | 'warning', 
    message: string,
    details?: any
  ): void {
    this.results.push({ category, test, status, message, details });
  }

  /**
   * Get results grouped by category
   */
  getResultsByCategory(): Record<string, SEOValidationResult[]> {
    const grouped: Record<string, SEOValidationResult[]> = {};
    
    this.results.forEach(result => {
      if (!grouped[result.category]) {
        grouped[result.category] = [];
      }
      grouped[result.category].push(result);
    });

    return grouped;
  }

  /**
   * Get summary statistics
   */
  getSummary(): { total: number; passed: number; failed: number; warnings: number } {
    return {
      total: this.results.length,
      passed: this.results.filter(r => r.status === 'pass').length,
      failed: this.results.filter(r => r.status === 'fail').length,
      warnings: this.results.filter(r => r.status === 'warning').length,
    };
  }

  /**
   * Export results as JSON
   */
  exportJSON(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      url: window.location.href,
      summary: this.getSummary(),
      results: this.results,
    }, null, 2);
  }

  /**
   * Print results to console
   */
  printToConsole(): void {
    console.group('🔍 SEO Validation Results');
    
    const summary = this.getSummary();
    console.log(`Total Tests: ${summary.total}`);
    console.log(`✅ Passed: ${summary.passed}`);
    console.log(`❌ Failed: ${summary.failed}`);
    console.log(`⚠️  Warnings: ${summary.warnings}`);
    console.log('');

    const grouped = this.getResultsByCategory();
    Object.entries(grouped).forEach(([category, results]) => {
      console.group(`📁 ${category}`);
      results.forEach(result => {
        const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
        console.log(`${icon} ${result.test}: ${result.message}`);
      });
      console.groupEnd();
    });

    console.groupEnd();
  }
}

/**
 * Run SEO validation (can be called from console)
 */
export async function validateSEO(): Promise<void> {
  const validator = new SEOValidator();
  await validator.runAllTests();
  validator.printToConsole();
  
  // Also make results available globally
  (window as any).seoValidationResults = validator;
}

// Make available globally in development
if (import.meta.env.DEV) {
  (window as any).validateSEO = validateSEO;
  console.log('💡 Run validateSEO() in console to check SEO implementation');
}
