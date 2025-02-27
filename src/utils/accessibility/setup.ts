
import { suppressDialogWarnings, enhanceDialogAccessibility } from './dialog';
import { ensureFocusableElementsAreNotHidden, fixAriaHiddenFocusableIssue } from './focus';
import { Logger } from '@/utils/logger';

/**
 * Safely execute a function and log any errors without throwing
 */
function safeExecute(fn: Function, fnName: string): any {
  try {
    return fn();
  } catch (error) {
    console.error(`Error executing ${fnName}:`, error);
    return () => {}; // Return no-op cleanup function
  }
}

/**
 * Automatically apply accessibility fixes when the component mounts and when focus changes
 */
export function setupAccessibilityFixes() {
  try {
    safeExecute(suppressDialogWarnings, 'suppressDialogWarnings');
    
    const cleanupEnhanceDialog = safeExecute(enhanceDialogAccessibility, 'enhanceDialogAccessibility');
    
    const observer = new MutationObserver(mutations => {
      try {
        safeExecute(fixAriaHiddenFocusableIssue, 'fixAriaHiddenFocusableIssue');
        
        mutations.forEach(mutation => {
          if (mutation.type === 'childList' && mutation.addedNodes.length) {
            setTimeout(() => {
              try {
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
              } catch (error) {
                console.error('Error fixing dialogs:', error);
              }
            }, 0);
          }
        });
      } catch (error) {
        console.error('Error in MutationObserver callback:', error);
      }
    });
    
    try {
      observer.observe(document.body, { 
        attributes: true, 
        childList: true, 
        subtree: true
      });
    } catch (error) {
      console.error('Error starting MutationObserver:', error);
    }
    
    try {
      document.addEventListener('focusin', ensureFocusableElementsAreNotHidden);
    } catch (error) {
      console.error('Error adding focusin event listener:', error);
    }
    
    return () => {
      try {
        observer.disconnect();
      } catch (e) {
        console.error('Error disconnecting observer:', e);
      }
      
      try {
        document.removeEventListener('focusin', ensureFocusableElementsAreNotHidden);
      } catch (e) {
        console.error('Error removing event listener:', e);
      }
      
      try {
        if (typeof cleanupEnhanceDialog === 'function') {
          cleanupEnhanceDialog();
        }
      } catch (e) {
        console.error('Error in cleanupEnhanceDialog:', e);
      }
    };
  } catch (error) {
    console.error('Error in setupAccessibilityFixes:', error);
    return () => {}; // Return empty cleanup function
  }
}
