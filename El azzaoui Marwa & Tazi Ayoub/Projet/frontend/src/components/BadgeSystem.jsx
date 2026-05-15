export default function BadgeSystem({ data }) {
  if (!data || data.length === 0) {
    return null;
  }

  const badges = [];

  // Badge 1: Débutant (1 entrée)
  if (data.length >= 1) {
    badges.push({
      id: 'beginner',
      emoji: '🟢',
      title: 'Débutant',
      description: 'Première mesure enregistrée',
      color: 'rgba(34, 197, 94, 0.1)',
      borderColor: '#22c55e',
      unlocked: true,
    });
  }

  // Badge 2: Motivé (5 entrées)
  if (data.length >= 5) {
    badges.push({
      id: 'motivated',
      emoji: '🔵',
      title: 'Motivé',
      description: '5 mesures enregistrées',
      color: 'rgba(59, 130, 246, 0.1)',
      borderColor: '#3b82f6',
      unlocked: true,
    });
  }

  // Badge 3: Discipliné (10 entrées)
  if (data.length >= 10) {
    badges.push({
      id: 'disciplined',
      emoji: '🟣',
      title: 'Discipliné',
      description: '10 mesures enregistrées',
      color: 'rgba(168, 85, 247, 0.1)',
      borderColor: '#a855f7',
      unlocked: true,
    });
  }

  // Badge 4: Transformation (perte de poids détectée)
  const weights = data.map((item) => parseFloat(item.weight));
  const currentWeight = weights[weights.length - 1];
  const initialWeight = weights[0];
  if (initialWeight - currentWeight > 0.5) {
    badges.push({
      id: 'transformation',
      emoji: '🟡',
      title: 'Transformation',
      description: `${(initialWeight - currentWeight).toFixed(1)} kg perdu`,
      color: 'rgba(234, 179, 8, 0.1)',
      borderColor: '#eab308',
      unlocked: true,
    });
  }

  // Badge 5: Champion (20 entrées) - Locked by default
  if (data.length < 20) {
    badges.push({
      id: 'champion',
      emoji: '⭐',
      title: 'Champion',
      description: '20 mesures enregistrées',
      color: 'rgba(200, 200, 200, 0.05)',
      borderColor: '#d1d5db',
      unlocked: false,
      progress: data.length,
      total: 20,
    });
  } else {
    badges.push({
      id: 'champion',
      emoji: '⭐',
      title: 'Champion',
      description: '20 mesures enregistrées',
      color: 'rgba(234, 179, 8, 0.1)',
      borderColor: '#fbbf24',
      unlocked: true,
    });
  }

  return (
    <div className="badge-system-container">
      <style>
        {`
          .badge-system-container {
            margin: 24px 0;
          }

          .badges-title {
            margin: 0 0 16px;
            font-size: 18px;
            font-weight: 900;
            color: #0f172a;
          }

          .badges-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 12px;
          }

          .badge-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px 16px;
            border-radius: 16px;
            border: 2px solid;
            background: var(--badge-bg);
            border-color: var(--badge-border);
            text-align: center;
            transition: all 240ms ease;
            animation: badgeFadeIn 0.6s ease-out forwards;
            opacity: 0;
            cursor: default;
          }

          @keyframes badgeFadeIn {
            from {
              opacity: 0;
              transform: translateY(8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .badge-card:nth-child(1) {
            animation-delay: 0s;
          }
          .badge-card:nth-child(2) {
            animation-delay: 0.1s;
          }
          .badge-card:nth-child(3) {
            animation-delay: 0.2s;
          }
          .badge-card:nth-child(4) {
            animation-delay: 0.3s;
          }
          .badge-card:nth-child(5) {
            animation-delay: 0.4s;
          }

          .badge-card.unlocked:hover {
            transform: translateY(-4px) scale(1.05);
            box-shadow: 0 12px 32px rgba(15, 118, 110, 0.2);
          }

          .badge-card.locked {
            opacity: 0.6;
            filter: grayscale(100%);
          }

          .badge-emoji {
            font-size: 32px;
            margin-bottom: 8px;
            display: block;
          }

          .badge-title {
            margin: 0;
            font-size: 14px;
            font-weight: 900;
            color: #0f172a;
            white-space: nowrap;
          }

          .badge-desc {
            margin: 6px 0 0;
            font-size: 11px;
            color: #64748b;
            font-weight: 600;
            line-height: 1.3;
          }

          .badge-progress {
            margin: 6px 0 0;
            font-size: 12px;
            color: #94a3b8;
            font-weight: 700;
          }

          @media (max-width: 760px) {
            .badges-grid {
              grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            }

            .badge-emoji {
              font-size: 28px;
            }

            .badge-title {
              font-size: 13px;
            }
          }
        `}
      </style>

      <h3 className="badges-title">🏅 Badges débloqués</h3>
      <div className="badges-grid">
        {badges.map((badge, index) => (
          <div
            key={badge.id}
            className={`badge-card ${badge.unlocked ? 'unlocked' : 'locked'}`}
            style={{
              '--badge-bg': badge.color,
              '--badge-border': badge.borderColor,
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <span className="badge-emoji">{badge.emoji}</span>
            <p className="badge-title">{badge.title}</p>
            <p className="badge-desc">{badge.description}</p>
            {!badge.unlocked && badge.progress !== undefined && (
              <p className="badge-progress">
                {badge.progress}/{badge.total}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
