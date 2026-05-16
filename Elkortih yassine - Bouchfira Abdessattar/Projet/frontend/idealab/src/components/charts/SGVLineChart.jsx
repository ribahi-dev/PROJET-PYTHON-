import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

const COLORS = ['#681A15', '#BBCAE1', '#681A15', '#BBCAE1']

export default function SGVLineChart({ data = [] }) {
  const grouped = data.reduce((acc, item) => {
    const key = item.idea_title || 'Idea'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  const labelsSet = new Set(data.map((d) => formatLabel(d.date)))
  const labels = Array.from(labelsSet)

  const datasets = Object.entries(grouped).map(([title, rows], idx) => ({
    label: title,
    data: labels.map((label) => rows.find((r) => formatLabel(r.date) === label)?.score ?? null),
    borderColor: COLORS[idx % COLORS.length],
    backgroundColor: COLORS[idx % COLORS.length],
    spanGaps: true,
    tension: 0.35,
  }))

  const chartData = { labels, datasets }

  return (
    <Line
      data={chartData}
      options={{
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y ?? 0}`,
            },
          },
        },
        scales: {
          y: { min: 0, max: 100 },
        },
      }}
    />
  )
}

function formatLabel(date) {
  const d = new Date(date)
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}
