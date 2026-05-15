import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { initDemoModeFromUrl } from '@/lib/demoMode'

initDemoModeFromUrl()

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
