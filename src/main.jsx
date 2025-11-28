// Entry point: mounts the React app and wires global providers
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppProviders } from './auth/AuthProvider.jsx'
import { BrowserRouter } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'

// StrictMode enables additional checks in development
// BrowserRouter provides client-side routing
// AppProviders wraps the app with auth and react-query context
// ErrorBoundary catches runtime errors and shows a fallback UI
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppProviders>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </AppProviders>
    </BrowserRouter>
  </StrictMode>,
)
