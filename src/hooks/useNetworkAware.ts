import { useState, useEffect } from 'react';

export type ConnectionType = 'slow-2g' | '2g' | '3g' | '4g' | 'wifi';

/**
 * Detects network connection speed for adaptive asset loading
 */
export const useNetworkAware = (): ConnectionType => {
  const [connectionType, setConnectionType] = useState<ConnectionType>('4g');

  useEffect(() => {
    const updateConnectionType = () => {
      // @ts-ignore - connection API not in all TypeScript types
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      if (connection && connection.effectiveType) {
        setConnectionType(connection.effectiveType as ConnectionType);
      }
    };

    updateConnectionType();

    // @ts-ignore
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      connection.addEventListener('change', updateConnectionType);
      return () => connection.removeEventListener('change', updateConnectionType);
    }
  }, []);

  return connectionType;
};
