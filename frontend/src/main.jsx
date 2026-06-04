import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1E2233',
            color: '#E0E2E8',
            border: '1px solid #2E3244',
            borderRadius: '10px',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#00C896', secondary: '#0D0F14' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#0D0F14' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
