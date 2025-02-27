
/**
 * Ensures that aria-hidden is not applied to elements that have focus
 */
export function ensureFocusableElementsAreNotHidden() {
  const activeElement = document.activeElement;
  
  if (!activeElement) return;
  
  let el = activeElement.parentElement;
  while (el) {
    if (el.getAttribute('aria-hidden') === 'true') {
      el.removeAttribute('aria-hidden');
    }
    el = el.parentElement;
  }
}

/**
 * Fixes the aria-hidden issue by applying the inert attribute instead
 */
export function fixAriaHiddenFocusableIssue() {
  const hiddenElements = document.querySelectorAll('[aria-hidden="true"]');
  
  hiddenElements.forEach(el => {
    const focusableElements = el.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      el.removeAttribute('aria-hidden');
      el.setAttribute('inert', '');
    }
  });
}
