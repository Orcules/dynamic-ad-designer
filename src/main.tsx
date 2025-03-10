
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from 'sonner'
import { DialogAccessibilityProvider } from '@/components/DialogProvider'

// Add a CSS rule for UI refresh
const style = document.createElement('style');
style.textContent = `
  .ui-refresh * {
    animation: none !important;
    transition: none !important;
  }
  
  body.ui-refresh {
    min-height: 100.1vh;
  }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DialogAccessibilityProvider>
      <App />
      <Toaster />
      <SonnerToaster position="top-right" richColors />
    </DialogAccessibilityProvider>
  </React.StrictMode>,
)
