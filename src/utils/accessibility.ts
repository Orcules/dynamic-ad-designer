
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
