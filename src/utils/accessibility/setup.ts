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
    
    // Keep track of processed dialogs to avoid duplication
    const processedDialogs = new WeakSet();
    
    const observer = new MutationObserver(mutations => {
      try {
        safeExecute(fixAriaHiddenFocusableIssue, 'fixAriaHiddenFocusableIssue');
        
        mutations.forEach(mutation => {
          if (mutation.type === 'childList' && mutation.addedNodes.length) {
            setTimeout(() => {
              try {
                document.querySelectorAll('[role="dialog"]:not([aria-describedby])').forEach((dialog, idx) => {
                  if (dialog instanceof HTMLElement && !processedDialogs.has(dialog)) {
                    processedDialogs.add(dialog);
                    
                    const descId = `dialog-desc-${Date.now()}-${idx}`;
                    const descEl = document.createElement('div');
                    descEl.id = descId;
                    descEl.style.display = 'none';
                    descEl.textContent = 'Dialog content';
                    dialog.appendChild(descEl);
                    dialog.setAttribute('aria-describedby', descId);
                    
                    // Add title if missing
                    if (!dialog.getAttribute('aria-labelledby')) {
                      const titleId = `dialog-title-${Date.now()}-${idx}`;
                      const titleEl = document.createElement('div');
                      titleEl.id = titleId;
                      titleEl.style.display = 'none';
                      titleEl.textContent = 'Dialog';
                      dialog.appendChild(titleEl);
                      dialog.setAttribute('aria-labelledby', titleId);
                    }
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
    
    // Fix existing dialogs immediately
    setTimeout(() => {
      try {
        document.querySelectorAll('[role="dialog"]').forEach((dialog, idx) => {
          if (dialog instanceof HTMLElement && !processedDialogs.has(dialog)) {
            processedDialogs.add(dialog);
            
            // Add description if missing
            if (!dialog.getAttribute('aria-describedby')) {
              const descId = `dialog-desc-init-${Date.now()}-${idx}`;
              const descEl = document.createElement('div');
              descEl.id = descId;
              descEl.style.display = 'none';
              descEl.textContent = 'Dialog content';
              dialog.appendChild(descEl);
              dialog.setAttribute('aria-describedby', descId);
            }
            
            // Add title if missing
            if (!dialog.getAttribute('aria-labelledby')) {
              const titleId = `dialog-title-init-${Date.now()}-${idx}`;
              const titleEl = document.createElement('div');
              titleEl.id = titleId;
              titleEl.style.display = 'none';
              titleEl.textContent = 'Dialog';
              dialog.appendChild(titleEl);
              dialog.setAttribute('aria-labelledby', titleId);
            }
          }
        });
      } catch (error) {
        console.error('Error fixing existing dialogs:', error);
      }
    }, 100);
    
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
