import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme] = useState('light')

  useEffect(() => {
    const root = window.document.body
    root.classList.remove('theme-dark')
    root.classList.add('theme-light')
    localStorage.setItem('umkm_theme', 'light')
  }, [])

  const toggleTheme = () => {
    // dark mode is removed, do nothing
  }

  return (
    <ThemeContext.Provider value={{ theme: 'light', toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
