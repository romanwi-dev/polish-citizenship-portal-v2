import DOMPurify from 'dompurify';
import type { Config } from 'dompurify';

/**
 * Sanitizes AI-generated HTML content to prevent XSS attacks
 * All AI outputs should pass through this before rendering
 */

interface SanitizeOptions {
  allowImages?: boolean;
  allowLinks?: boolean;
  allowLists?: boolean;
}

const DEFAULT_CONFIG: Config = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'code', 'pre', 'blockquote'],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
};

/**
 * Sanitize AI-generated HTML content
 */
export function sanitizeAIContent(
  content: string,
  options: SanitizeOptions = {}
): string {
  if (!content) return '';

  const config = { ...DEFAULT_CONFIG };

  // Add additional tags based on options
  if (options.allowImages) {
    config.ALLOWED_TAGS?.push('img');
    config.ALLOWED_ATTR?.push('src', 'alt', 'width', 'height');
  }

  if (options.allowLinks) {
    config.ALLOWED_TAGS?.push('a');
    config.ALLOWED_ATTR?.push('href', 'target', 'rel');
    // Force all links to open in new tab with noopener
    config.ADD_ATTR = ['target="_blank"', 'rel="noopener noreferrer"'];
  }

  if (options.allowLists) {
    config.ALLOWED_TAGS?.push('ul', 'ol', 'li');
  }

  return DOMPurify.sanitize(content, config) as string;
}

/**
 * Sanitize AI JSON output
 * Ensures all string values are safe for rendering
 */
export function sanitizeAIJSON<T extends Record<string, any>>(
  data: T,
  options: SanitizeOptions = {}
): T {
  if (!data || typeof data !== 'object') return data;

  const sanitized: Record<string, any> = { ...data };

  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeAIContent(value, options);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeAIJSON(value, options);
    }
  }

  return sanitized as T;
}

/**
 * Create a safe display string from AI output
 * Strips all HTML and returns plain text
 */
export function toPlainText(content: string): string {
  if (!content) return '';
  
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true,
  }) as string;
}

/**
 * Validate that content doesn't contain suspicious patterns
 */
export function validateAIContent(content: string): {
  isValid: boolean;
  reason?: string;
} {
  if (!content) return { isValid: true };

  // Check for common XSS patterns that might slip through
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick, onerror, etc.
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(content)) {
      return {
        isValid: false,
        reason: `Content contains suspicious pattern: ${pattern}`,
      };
    }
  }

  return { isValid: true };
}
