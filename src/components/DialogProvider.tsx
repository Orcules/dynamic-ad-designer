
import React, { createContext, useContext, useEffect } from 'react';
import { setupAccessibilityFixes, suppressDialogWarnings } from '@/utils/accessibility';

const DialogAccessibilityContext = createContext<boolean>(false);

/**
 * This provider ensures that all dialogs in the application have proper accessibility attributes
 */
export function DialogAccessibilityProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Apply accessibility fixes when the component mounts
    suppressDialogWarnings();
    const cleanup = setupAccessibilityFixes();
    
    // Apply fixes immediately and also after a short delay to catch any dialogs created later
    const timeouts = [
      setTimeout(suppressDialogWarnings, 100),
      setTimeout(setupAccessibilityFixes, 300),
      setTimeout(setupAccessibilityFixes, 1000),
    ];
    
    return () => {
      cleanup();
      timeouts.forEach(clearTimeout);
    };
  }, []);
  
  return (
    <DialogAccessibilityContext.Provider value={true}>
      {children}
    </DialogAccessibilityContext.Provider>
  );
}

/**
 * Hook to ensure dialog accessibility is set up
 */
export function useDialogAccessibility() {
  const isSet = useContext(DialogAccessibilityContext);
  
  // If accessed outside provider, set up accessibility anyway
  useEffect(() => {
    if (!isSet) {
      console.warn('useDialogAccessibility used outside DialogAccessibilityProvider');
      setupAccessibilityFixes();
    }
  }, [isSet]);
  
  return isSet;
}
