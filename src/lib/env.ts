/**
 * V7 Environment Variable Safety Layer
 * Prevents crashes from missing or malformed environment variables
 */

interface EnvConfig {
  supabase: {
    url: string;
    publishableKey: string;
    projectId: string;
  };
  ga: {
    measurementId: string | null;
  };
}

/**
 * Safely get environment variable with fallback
 */
function getEnvVar(key: string, fallback: string = ''): string {
  try {
    const value = import.meta.env[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
    
    if (import.meta.env.DEV && !value) {
      console.warn(`⚠️ Environment variable ${key} is not set. Using fallback.`);
    }
    
    return fallback;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`❌ Error reading ${key}:`, error);
    }
    return fallback;
  }
}

/**
 * Validated environment configuration
 * Guarantees safe values for all critical environment variables
 */
export const env: EnvConfig = {
  supabase: {
    url: getEnvVar('VITE_SUPABASE_URL', ''),
    publishableKey: getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY', ''),
    projectId: getEnvVar('VITE_SUPABASE_PROJECT_ID', ''),
  },
  ga: {
    measurementId: getEnvVar('VITE_GA_MEASUREMENT_ID') || null,
  },
};

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(env.supabase.url && env.supabase.publishableKey);
}

/**
 * Check if Google Analytics is properly configured
 */
export function isGAConfigured(): boolean {
  return Boolean(env.ga.measurementId);
}
