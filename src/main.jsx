import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import './i18n' // Initialisation de i18next
import { registerSW } from 'virtual:pwa-register'
import { ThemeProvider } from './components/ThemeProvider'
import { SocketProvider } from './context/SocketContext'
import { NotificationToaster } from './components/NotificationToaster'
import { ErrorBoundary } from './components/ErrorBoundary'

try {
  registerSW({
    onNeedRefresh() {},
    onOfflineReady() {},
    onRegisteredSW(swUrl, registration) {
      if (registration) {
        setInterval(() => registration.update(), 60 * 60 * 1000)
      }
    },
  })
} catch (e) {
  console.warn('PWA service worker registration skipped:', e)
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SocketProvider>
          <App />
          <NotificationToaster />
        </SocketProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
)

