/**
 * Generates deterministic colorful avatar styles with high-contrast text matching the background color family.
 */
export const AVATAR_PALETTES = [
  { bg: 'rgba(59, 130, 246, 0.18)', color: '#1d4ed8', border: 'rgba(59, 130, 246, 0.35)' },   // Blue
  { bg: 'rgba(16, 185, 129, 0.18)', color: '#047857', border: 'rgba(16, 185, 129, 0.35)' },   // Emerald
  { bg: 'rgba(139, 92, 246, 0.18)', color: '#6d28d9', border: 'rgba(139, 92, 246, 0.35)' },   // Purple
  { bg: 'rgba(245, 158, 11, 0.20)', color: '#b45309', border: 'rgba(245, 158, 11, 0.38)' },   // Amber
  { bg: 'rgba(244, 63, 94, 0.18)',  color: '#be123c', border: 'rgba(244, 63, 94, 0.35)' },   // Rose
  { bg: 'rgba(20, 184, 166, 0.18)', color: '#0f766e', border: 'rgba(20, 184, 166, 0.35)' },   // Teal
  { bg: 'rgba(99, 102, 241, 0.18)', color: '#4338ca', border: 'rgba(99, 102, 241, 0.35)' },   // Indigo
  { bg: 'rgba(249, 115, 22, 0.18)', color: '#c2410c', border: 'rgba(249, 115, 22, 0.35)' },   // Orange
  { bg: 'rgba(217, 70, 239, 0.18)', color: '#a21caf', border: 'rgba(217, 70, 239, 0.35)' },   // Fuchsia
  { bg: 'rgba(6, 182, 212, 0.18)',  color: '#0e7490', border: 'rgba(6, 182, 212, 0.35)' },   // Cyan
]

export function getAvatarStyle(nameOrId = '', size = 32) {
  if (!nameOrId) {
    const defaultPalette = AVATAR_PALETTES[0]
    return {
      background: defaultPalette.bg,
      color: defaultPalette.color,
      border: `1.5px solid ${defaultPalette.border}`,
      width: size,
      height: size,
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: size <= 32 ? 11 : 13,
      flexShrink: 0,
    }
  }

  let hash = 0
  for (let i = 0; i < nameOrId.length; i++) {
    hash = nameOrId.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length
  const palette = AVATAR_PALETTES[index]

  return {
    background: palette.bg,
    color: palette.color,
    border: `1.5px solid ${palette.border}`,
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: size <= 32 ? 11 : 13,
    flexShrink: 0,
  }
}

export function getInitials(name = '') {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + (parts[1] ? parts[1][0] : parts[0][1] || '')).toUpperCase()
}
