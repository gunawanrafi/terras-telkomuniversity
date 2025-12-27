import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@ui/index.css'
import App from './App.jsx'

// Check for redirect path from User App
const redirectPath = sessionStorage.getItem('admin_redirect_path');
if (redirectPath) {
    sessionStorage.removeItem('admin_redirect_path');
    window.history.replaceState(null, '', redirectPath);
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
