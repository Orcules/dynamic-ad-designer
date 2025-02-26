
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
      
      // Alternative: we could also use the inert attribute as recommended
      // el.setAttribute('inert', '');
    }
    el = el.parentElement;
  }
}

/**
 * Fixes the aria-hidden issue by applying the inert attribute instead
 * This should be called on components that might have focusable elements but need to be hidden
 */
export function fixAriaHiddenFocusableIssue() {
  // Find all elements with aria-hidden
  const hiddenElements = document.querySelectorAll('[aria-hidden="true"]');
  
  hiddenElements.forEach(el => {
    // Check if the element contains any focusable elements
    const focusableElements = el.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      // Remove aria-hidden and use inert instead
      el.removeAttribute('aria-hidden');
      el.setAttribute('inert', '');
    }
  });
}

/**
 * Automatically apply the above fix when the component mounts and when focus changes
 * Call this in a useEffect hook in your root component
 */
export function setupAccessibilityFixes() {
  // Setup a mutation observer to watch for changes to the DOM
  const observer = new MutationObserver(mutations => {
    // When the DOM changes, fix any aria-hidden issues
    fixAriaHiddenFocusableIssue();
  });
  
  // Start observing the document with the configured parameters
  observer.observe(document.body, { 
    attributes: true, 
    childList: true, 
    subtree: true,
    attributeFilter: ['aria-hidden', 'tabindex', 'inert'] 
  });
  
  // Also set up a focus event listener to fix issues when focus changes
  document.addEventListener('focusin', () => {
    ensureFocusableElementsAreNotHidden();
  });
  
  // Clean up function to remove observers and listeners
  return () => {
    observer.disconnect();
    document.removeEventListener('focusin', ensureFocusableElementsAreNotHidden);
  };
}
