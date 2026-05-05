import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { useThemeStore } from './store/themeStore'

// Initialize theme before React renders (avoids flash of wrong theme)
// Default to dark — the app is designed dark-first
const savedTheme = localStorage.getItem('theme')
const isDark = savedTheme !== 'light'
if (isDark) {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}
if (!savedTheme) localStorage.setItem('theme', 'dark')
// Sync Zustand store so the Header toggle icon is correct
useThemeStore.getState().setDarkMode(isDark)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
