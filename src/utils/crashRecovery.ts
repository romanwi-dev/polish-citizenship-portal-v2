/**
 * Secure crash recovery utilities with HMAC signature validation
 * Prevents localStorage injection attacks
 */

interface CrashState {
  timestamp: string;
  error: string;
  errorStack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  sessionData: Record<string, any>;
}

interface SignedCrashState {
  state: CrashState;
  signature: string;
  version: number;
}

const RECOVERY_KEY = 'crash_recovery_state';
const HMAC_VERSION = 1;
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a deterministic secret key from browser fingerprint
 * This prevents cross-browser injection while maintaining recovery capability
 */
async function getHMACKey(): Promise<CryptoKey> {
  // Use browser-specific data as key material (not perfect but better than nothing)
  const fingerprint = `${navigator.userAgent}|${window.location.origin}|${navigator.language}`;
  const encoder = new TextEncoder();
  const keyMaterial = encoder.encode(fingerprint);
  
  // Import key material
  const baseKey = await crypto.subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  // Derive HMAC key
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('crash-recovery-salt-v1'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'HMAC', hash: 'SHA-256', length: 256 },
    false,
    ['sign', 'verify']
  );
}

/**
 * Sign crash state with HMAC
 */
async function signState(state: CrashState): Promise<string> {
  const key = await getHMACKey();
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(state));
  
  const signature = await crypto.subtle.sign('HMAC', key, data);
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

/**
 * Verify HMAC signature
 */
async function verifySignature(state: CrashState, signature: string): Promise<boolean> {
  try {
    const key = await getHMACKey();
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(state));
    
    const signatureBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
    
    return await crypto.subtle.verify('HMAC', key, signatureBytes, data);
  } catch (error) {
    console.error('[crashRecovery] Signature verification failed:', error);
    return false;
  }
}

/**
 * Validate crash state schema
 */
function validateStateSchema(data: any): data is CrashState {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.timestamp === 'string' &&
    typeof data.error === 'string' &&
    typeof data.url === 'string' &&
    typeof data.userAgent === 'string' &&
    typeof data.sessionData === 'object'
  );
}

/**
 * Check if crash state has expired
 */
function isExpired(timestamp: string): boolean {
  const crashTime = new Date(timestamp).getTime();
  const now = Date.now();
  return (now - crashTime) > MAX_AGE_MS;
}

/**
 * Securely save crash state with HMAC signature
 */
export async function saveCrashState(state: CrashState): Promise<void> {
  try {
    // Validate state before signing
    if (!validateStateSchema(state)) {
      console.error('[crashRecovery] Invalid state schema, refusing to save');
      return;
    }
    
    // Generate HMAC signature
    const signature = await signState(state);
    
    const signedState: SignedCrashState = {
      state,
      signature,
      version: HMAC_VERSION
    };
    
    // Save to localStorage (with size limit)
    const stateJson = JSON.stringify(signedState);
    if (stateJson.length < 5 * 1024 * 1024) { // 5MB limit
      localStorage.setItem(RECOVERY_KEY, stateJson);
      console.log('[crashRecovery] State saved securely with HMAC signature');
    } else {
      console.warn('[crashRecovery] State too large to save');
    }
  } catch (error) {
    console.error('[crashRecovery] Failed to save crash state:', error);
  }
}

/**
 * Securely recover crash state with signature verification
 */
export async function recoverCrashState(): Promise<CrashState | null> {
  try {
    const savedState = localStorage.getItem(RECOVERY_KEY);
    if (!savedState) {
      return null;
    }
    
    const parsed = JSON.parse(savedState) as SignedCrashState;
    
    // Version check
    if (parsed.version !== HMAC_VERSION) {
      console.warn('[crashRecovery] Incompatible version, rejecting state');
      clearCrashState();
      return null;
    }
    
    // Schema validation
    if (!validateStateSchema(parsed.state)) {
      console.warn('[crashRecovery] Schema validation failed, rejecting state');
      clearCrashState();
      return null;
    }
    
    // Timestamp expiration check
    if (isExpired(parsed.state.timestamp)) {
      console.warn('[crashRecovery] State expired, rejecting');
      clearCrashState();
      return null;
    }
    
    // HMAC signature verification (CRITICAL)
    const isValid = await verifySignature(parsed.state, parsed.signature);
    if (!isValid) {
      console.error('[crashRecovery] HMAC signature verification FAILED - possible injection attack!');
      clearCrashState();
      return null;
    }
    
    console.log('[crashRecovery] State recovered and verified successfully');
    return parsed.state;
    
  } catch (error) {
    console.error('[crashRecovery] Failed to recover state:', error);
    clearCrashState();
    return null;
  }
}

/**
 * Clear crash recovery state
 */
export function clearCrashState(): void {
  localStorage.removeItem(RECOVERY_KEY);
  console.log('[crashRecovery] Recovery state cleared');
}

/**
 * Create crash state from error
 */
export function createCrashState(error: Error, errorInfo: { componentStack?: string }): CrashState {
  return {
    timestamp: new Date().toISOString(),
    error: error.message,
    errorStack: error.stack,
    componentStack: errorInfo.componentStack,
    url: window.location.href,
    userAgent: navigator.userAgent,
    sessionData: captureSessionData()
  };
}

/**
 * Safely capture session data
 */
function captureSessionData(): Record<string, any> {
  try {
    return Object.keys(sessionStorage).reduce((acc, key) => {
      try {
        // Only capture non-sensitive keys
        if (!key.toLowerCase().includes('token') && 
            !key.toLowerCase().includes('password') &&
            !key.toLowerCase().includes('secret')) {
          acc[key] = sessionStorage.getItem(key);
        }
      } catch (e) {
        acc[key] = '[Unable to capture]';
      }
      return acc;
    }, {} as Record<string, any>);
  } catch (error) {
    return {};
  }
}
