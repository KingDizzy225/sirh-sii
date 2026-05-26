import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import './i18n' // Initialisation de i18next
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {},
  onOfflineReady() {},
})

import { ThemeProvider } from './components/ThemeProvider'
import { SocketProvider } from './context/SocketContext'
import { NotificationToaster } from './components/NotificationToaster'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SocketProvider>
        <App />
        <NotificationToaster />
      </SocketProvider>
    </ThemeProvider>
  </React.StrictMode>
)
