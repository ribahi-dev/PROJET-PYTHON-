export default function ProgressStats({ data }) {
  if (!data || data.length === 0) {
    return null;
  }

  const weights = data.map((item) => parseFloat(item.weight));
  const currentWeight = weights[weights.length - 1];
  const initialWeight = weights[0];
  const avgWeight = (
    weights.reduce((a, b) => a + b, 0) / weights.length
  ).toFixed(1);
  const evolution = (currentWeight - initialWeight).toFixed(1);
  const evolutionPercent = ((evolution / initialWeight) * 100).toFixed(1);
  const isLosing = evolution < 0;

  return (
    <div className="progress-stats-container">
      <style>
        {`
          .progress-stats-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 18px;
            margin: 24px 0;
          }

          .stat-card {
            padding: 20px;
            border-radius: 18px;
            background: white;
            border: 1px solid rgba(15, 118, 110, 0.12);
            box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06);
            transition: transform 160ms ease, box-shadow 160ms ease;
          }

          .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
          }

          .stat-icon {
            font-size: 24px;
            margin-bottom: 8px;
          }

          .stat-label {
            margin: 0;
            font-size: 12px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .stat-value {
            margin: 8px 0 0;
            font-size: 28px;
            font-weight: 900;
            color: #0f172a;
          }

          .stat-detail {
            margin: 6px 0 0;
            font-size: 13px;
            color: #94a3b8;
            font-weight: 600;
          }

          .stat-positive {
            color: #22c55e;
          }

          .stat-negative {
            color: #ef4444;
          }

          @media (max-width: 760px) {
            .progress-stats-container {
              grid-template-columns: 1fr;
            }

            .stat-value {
              font-size: 24px;
            }
          }
        `}
      </style>

      <div className="stat-card">
        <div className="stat-icon">⚖️</div>
        <p className="stat-label">Poids actuel</p>
        <p className="stat-value">{currentWeight} kg</p>
      </div>

      <div className="stat-card">
        <div className="stat-icon">📊</div>
        <p className="stat-label">Poids moyen</p>
        <p className="stat-value">{avgWeight} kg</p>
      </div>

      <div className="stat-card">
        <div className="stat-icon">📝</div>
        <p className="stat-label">Entrées</p>
        <p className="stat-value">{data.length}</p>
        <p className="stat-detail">{data.length} mesures</p>
      </div>

      <div className="stat-card">
        <div className="stat-icon">{isLosing ? "📉" : "📈"}</div>
        <p className="stat-label">Évolution</p>
        <p className="stat-value">
          <span className={isLosing ? "stat-negative" : "stat-positive"}>
            {evolution > 0 ? "+" : ""}
            {evolution}
          </span>
        </p>
        <p className="stat-detail">
          <span className={isLosing ? "stat-negative" : "stat-positive"}>
            {evolutionPercent}%
          </span>
        </p>
      </div>
    </div>
  );
}
