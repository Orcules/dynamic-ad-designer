
import { suppressDialogWarnings, enhanceDialogAccessibility } from './dialog';
import { ensureFocusableElementsAreNotHidden, fixAriaHiddenFocusableIssue } from './focus';

/**
 * Automatically apply accessibility fixes when the component mounts and when focus changes
 */
export function setupAccessibilityFixes() {
  suppressDialogWarnings();
  const cleanupEnhanceDialog = enhanceDialogAccessibility();
  
  const observer = new MutationObserver(mutations => {
    fixAriaHiddenFocusableIssue();
    
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length) {
        setTimeout(() => {
          document.querySelectorAll('[role="dialog"]:not([aria-describedby])').forEach((dialog, idx) => {
            if (dialog instanceof HTMLElement) {
              const descId = `dialog-desc-${Date.now()}-${idx}`;
              const descEl = document.createElement('div');
              descEl.id = descId;
              descEl.style.display = 'none';
              descEl.textContent = 'Dialog content';
              dialog.appendChild(descEl);
              dialog.setAttribute('aria-describedby', descId);
            }
          });
        }, 0);
      }
    });
  });
  
  observer.observe(document.body, { 
    attributes: true, 
    childList: true, 
    subtree: true
  });
  
  document.addEventListener('focusin', ensureFocusableElementsAreNotHidden);
  
  return () => {
    observer.disconnect();
    document.removeEventListener('focusin', ensureFocusableElementsAreNotHidden);
    cleanupEnhanceDialog();
  };
}
