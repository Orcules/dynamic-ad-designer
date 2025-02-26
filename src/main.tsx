
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { suppressDialogWarnings, setupAccessibilityFixes, monkeyPatchDialogContent } from './utils/accessibility.ts'

// הפעלת דיכוי האזהרות מוקדם ככל האפשר, לפני כל רינדור
suppressDialogWarnings();
monkeyPatchDialogContent();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
