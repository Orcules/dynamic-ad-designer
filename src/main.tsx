
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from 'sonner'
import { DialogAccessibilityProvider } from '@/components/DialogProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DialogAccessibilityProvider>
      <App />
      <Toaster />
      <SonnerToaster position="top-right" richColors />
    </DialogAccessibilityProvider>
  </React.StrictMode>,
)
