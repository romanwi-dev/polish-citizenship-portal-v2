/**
 * Service Worker Registration
 * Registers and manages the service worker for offline support
 */

export const registerServiceWorker = async () => {
  // Only register in production
  if (import.meta.env.DEV) {
    console.log('Service Worker: Disabled in development');
    return;
  }

  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker: Not supported in this browser');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('Service Worker: Registered successfully', registration);

    // Check for updates periodically
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000); // Check every hour

    // Handle service worker updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker is ready
          console.log('Service Worker: New version available');
          
          // Notify user about update (optional)
          if (confirm('New version available! Reload to update?')) {
            newWorker.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
          }
        }
      });
    });

    // Handle controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service Worker: Controller changed');
      window.location.reload();
    });

  } catch (error) {
    console.error('Service Worker: Registration failed', error);
  }
};

/**
 * Unregister service worker (for development/testing)
 */
export const unregisterServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.unregister();
      console.log('Service Worker: Unregistered successfully');
    }
  } catch (error) {
    console.error('Service Worker: Unregistration failed', error);
  }
};
