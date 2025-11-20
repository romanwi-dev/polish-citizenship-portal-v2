/**
 * Utility to clear all crash recovery state
 * Use this to reset the app when stuck in an error loop
 */
export const clearAllCrashState = () => {
  // Clear sessionStorage crash tracking
  sessionStorage.removeItem('crash_recovery_session_id');
  sessionStorage.removeItem('error_boundary_crash_count');
  sessionStorage.removeItem('error_boundary_last_crash');
  
  // Clear localStorage if any crash data is stored there
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes('crash') || key.includes('error')) {
      localStorage.removeItem(key);
    }
  });
  
  console.log('[CrashRecovery] All crash state cleared');
};

// Make it available globally for easy debugging
if (typeof window !== 'undefined') {
  (window as any).clearCrashState = clearAllCrashState;
}
