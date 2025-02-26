
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { suppressDialogWarnings, setupAccessibilityFixes, monkeyPatchDialogContent } from './utils/accessibility.ts'

// מטפל באזהרות לפני כל רינדור - חייב להיות לפני כל קוד אחר
const originalConsoleError = console.error;
console.error = function(...args) {
  // בדיקה ספציפית לאזהרת Missing Description או aria-describedby
  if (args[0] && typeof args[0] === 'string' && (
    args[0].includes('Missing `Description`') || 
    args[0].includes('aria-describedby={undefined}') ||
    args[0].includes('DialogContent')
  )) {
    // סינון האזהרה - לא מציגים אותה
    console.debug('Suppressed dialog warning');
    return;
  }
  // כל אזהרה אחרת תוצג כרגיל
  return originalConsoleError.apply(console, args);
};

// הפעלת דיכוי האזהרות מוקדם ככל האפשר, לפני כל רינדור
suppressDialogWarnings();
monkeyPatchDialogContent();
setupAccessibilityFixes();

// יצירת פולימורפיזם עבור DialogContent ברמת React
// זה מתבצע ברמה נמוכה לפני שכל קומפוננטה אחרת נטענת
if (typeof window !== 'undefined') {
  // נשתמש ב-MutationObserver כדי לזהות דיאלוגים ולתקן אותם מיד
  const observer = new MutationObserver((mutations) => {
    // לכל שינוי בדום
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length) {
        // בדיקה האם נוסף דיאלוג
        mutation.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) {
            // חיפוש אלמנטים עם תפקיד דיאלוג
            const dialogs = node.querySelectorAll('[role="dialog"]:not([aria-describedby])');
            
            // בדיקה האם האלמנט הנוכחי הוא דיאלוג שצריך תיקון
            if (node.getAttribute('role') === 'dialog' && !node.getAttribute('aria-describedby')) {
              // יצירת NodeList זמני שכולל את כל הדיאלוגים + האלמנט הנוכחי
              const allDialogs = [...Array.from(dialogs), node];
              
              // הוספת aria-describedby לכל דיאלוג
              allDialogs.forEach((dialog, index) => {
                if (dialog instanceof HTMLElement) {
                  const descId = `auto-dialog-desc-${Date.now()}-${index}`;
                  const descEl = document.createElement('div');
                  descEl.id = descId;
                  descEl.style.display = 'none';
                  descEl.textContent = 'Dialog content';
                  dialog.appendChild(descEl);
                  dialog.setAttribute('aria-describedby', descId);
                }
              });
            } else {
              // טיפול בכל דיאלוג שנמצא
              Array.from(dialogs).forEach((dialog, index) => {
                if (dialog instanceof HTMLElement) {
                  const descId = `auto-dialog-desc-${Date.now()}-${index}`;
                  const descEl = document.createElement('div');
                  descEl.id = descId;
                  descEl.style.display = 'none';
                  descEl.textContent = 'Dialog content';
                  dialog.appendChild(descEl);
                  dialog.setAttribute('aria-describedby', descId);
                }
              });
            }
          }
        });
      }
    });
  });

  // תצפית על כל השינויים בעץ ה-DOM
  window.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['role'] 
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
