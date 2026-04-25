import { useTheme } from '../contexts/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
      aria-label="Toggle Theme"
    >
      <span className="theme-toggle__icon">
        {theme === 'dark' ? '☀️' : '🌙'}
      </span>
    </button>
  )
}
