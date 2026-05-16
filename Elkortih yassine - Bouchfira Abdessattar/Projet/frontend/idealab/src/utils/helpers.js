export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric'
  })

export const timeAgo = (iso) => {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  if (isNaN(diff) || diff < 0) return 'just now'
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(iso)
}

export const truncate = (str, n = 100) =>
  str?.length > n ? str.slice(0, n) + '...' : str

export const scoreColor = (score) => {
  if (score >= 70) return 'text-secondary bg-primary/40 border-secondary/40'
  if (score >= 40) return 'text-secondary bg-primary/60 border-secondary/50'
  return 'text-secondary bg-primary/80 border-secondary/60'
}

export const levelBadge = (level) => ({
  bronze: 'bg-primary/55 text-secondary',
  silver: 'bg-primary/65 text-secondary',
  gold: 'bg-primary/75 text-secondary',
  expert: 'bg-secondary text-primary',
}[level] || 'bg-primary/55 text-secondary')
