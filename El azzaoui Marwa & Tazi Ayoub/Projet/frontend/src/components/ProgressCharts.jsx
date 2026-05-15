import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProgressCharts({ data }) {
  if (!data || data.length === 0) {
    return null;
  }

  const chartData = data
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((item) => ({
      date: new Date(item.date).toLocaleDateString('fr-FR', {
        month: 'short',
        day: 'numeric',
      }),
      weight: parseFloat(item.weight),
      fullDate: item.date,
    }));

  const minWeight = Math.min(...chartData.map((d) => d.weight));
  const maxWeight = Math.max(...chartData.map((d) => d.weight));
  const padding = (maxWeight - minWeight) * 0.15 || 5;

  return (
    <div className="progress-charts-container">
      <style>
        {`
          .progress-charts-container {
            margin: 24px 0;
            padding: 24px;
            border-radius: 22px;
            background: white;
            border: 1px solid rgba(15, 118, 110, 0.12);
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
          }

          .charts-title {
            margin: 0 0 20px;
            font-size: 20px;
            font-weight: 900;
            color: #0f172a;
          }

          .chart-wrapper {
            width: 100%;
            height: 300px;
            margin-bottom: 16px;
          }

          .recharts-default-tooltip {
            background: rgba(15, 118, 110, 0.95) !important;
            border: none !important;
            border-radius: 8px;
            padding: 8px 12px !important;
            box-shadow: 0 8px 16px rgba(15, 23, 42, 0.2);
          }

          .recharts-tooltip-label {
            color: white !important;
            font-weight: 700;
            margin-bottom: 4px;
          }

          .recharts-tooltip-item {
            color: #22c55e !important;
            font-weight: 700;
          }

          @media (max-width: 760px) {
            .progress-charts-container {
              padding: 16px;
            }

            .chart-wrapper {
              height: 250px;
            }
          }
        `}
      </style>

      <h3 className="charts-title">📈 Évolution du poids</h3>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0f766e" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 118, 110, 0.08)" />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              style={{ fontSize: '12px', fontWeight: '600' }}
            />
            <YAxis
              stroke="#94a3b8"
              domain={[minWeight - padding, maxWeight + padding]}
              style={{ fontSize: '12px', fontWeight: '600' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 118, 110, 0.95)',
                border: 'none',
                borderRadius: '8px',
                color: '#22c55e',
              }}
              cursor={{ stroke: 'rgba(15, 118, 110, 0.2)', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#0f766e"
              strokeWidth={3}
              dot={{ fill: '#0f766e', r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
