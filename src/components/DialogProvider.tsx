
import React, { createContext, useContext, useEffect } from 'react';
import { setupAccessibilityFixes, suppressDialogWarnings } from '@/utils/accessibility';

const DialogAccessibilityContext = createContext<boolean>(false);

/**
 * This provider ensures that all dialogs in the application have proper accessibility attributes
 */
export function DialogAccessibilityProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      // Apply accessibility fixes when the component mounts
      suppressDialogWarnings();
      let cleanup = () => {};
      
      try {
        cleanup = setupAccessibilityFixes();
      } catch (setupError) {
        console.error("Error in setupAccessibilityFixes:", setupError);
      }
      
      // Apply fixes immediately and also after a short delay to catch any dialogs created later
      const timeouts = [
        setTimeout(() => {
          try {
            suppressDialogWarnings();
          } catch (e) {
            console.error("Error in delayed suppressDialogWarnings:", e);
          }
        }, 100),
        setTimeout(() => {
          try {
            setupAccessibilityFixes();
          } catch (e) {
            console.error("Error in delayed setupAccessibilityFixes:", e);
          }
        }, 300),
        setTimeout(() => {
          try {
            setupAccessibilityFixes();
          } catch (e) {
            console.error("Error in second delayed setupAccessibilityFixes:", e);
          }
        }, 1000),
      ];
      
      return () => {
        try {
          cleanup();
        } catch (e) {
          console.error("Error in cleanup function:", e);
        }
        timeouts.forEach(clearTimeout);
      };
    } catch (error) {
      console.error("Fatal error in DialogAccessibilityProvider:", error);
      return () => {}; // Return empty cleanup function
    }
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
      try {
        setupAccessibilityFixes();
      } catch (error) {
        console.error("Error in useDialogAccessibility setupAccessibilityFixes:", error);
      }
    }
  }, [isSet]);
  
  return isSet;
}
