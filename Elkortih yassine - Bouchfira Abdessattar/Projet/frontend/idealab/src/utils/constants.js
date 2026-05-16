export const SECTORS = [
  'FinTech','HealthTech','EdTech','GreenTech','E-commerce','SaaS','AgriTech','PropTech','Other'
]

export const SCORE_LEVELS = {
  bronze: { label: 'Bronze', color: 'text-secondary', min: 0 },
  silver: { label: 'Silver', color: 'text-secondary', min: 50 },
  gold: { label: 'Gold', color: 'text-secondary', min: 150 },
  expert: { label: 'Expert', color: 'text-secondary', min: 300 },
}

export const STATUS_COLORS = {
  draft: 'bg-primary/55 text-secondary',
  submitted: 'bg-primary/65 text-secondary',
  review: 'bg-primary/75 text-secondary',
  validated: 'bg-primary/85 text-secondary',
  rejected: 'bg-secondary text-primary',
}

export const NOTIF_ICONS = {
  new_feedback: 'MessageSquare',
  new_comment: 'MessageCircle',
  idea_promoted: 'TrendingUp',
  feedback_voted: 'ThumbsUp',
  status_changed: 'RefreshCw',
}
