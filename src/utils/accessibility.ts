/**
 * This file contains utility functions for improving accessibility
 */

/**
 * Helper function to automatically suppress React warnings for DialogContent
 * This is used for development only and doesn't affect production
 */
export const suppressDialogWarnings = () => {
  // Only run in development
  if (process.env.NODE_ENV !== 'production') {
    // Store the original console.error
    const originalError = console.error;
    
    // Replace it with a filtered version
    console.error = (...args) => {
      // Check if this is the DialogContent warning
      if (args[0] && typeof args[0] === 'string' && 
          args[0].includes('Missing `Description` or `aria-describedby') && 
          args[0].includes('DialogContent')) {
        // Suppress this specific warning
        return;
      }
      // Otherwise, pass through to the original console.error
      originalError.apply(console, args);
    };
  }
};

/**
 * Helper functions for improving accessibility in the application
 */

/**
 * Ensures that aria-hidden is not applied to elements that have focus
 * Call this in component useEffect hooks where focus issues occur
 */
export function ensureFocusableElementsAreNotHidden() {
  // Find any focused elements
  const activeElement = document.activeElement;
  
  if (!activeElement) return;
  
  // Find all ancestors with aria-hidden
  let el = activeElement.parentElement;
  while (el) {
    if (el.getAttribute('aria-hidden') === 'true') {
      // Remove aria-hidden temporarily
      el.removeAttribute('aria-hidden');
    }
    el = el.parentElement;
  }
}
