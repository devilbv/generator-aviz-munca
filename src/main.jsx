import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/react'
import { AuthProvider } from '@/context/AuthContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster richColors position="top-right" />
        <Analytics />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
