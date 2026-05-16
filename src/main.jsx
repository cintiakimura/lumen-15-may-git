import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
/* Geist ships Next.js entrypoints; load the same .woff2 files from the package for Vite. */
import '@/geist-fonts.css'
import '@/index.css'
import { initDemoModeFromUrl } from '@/lib/demoMode'

initDemoModeFromUrl()

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
