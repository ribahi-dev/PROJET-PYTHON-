import { PolarAngleAxis, PolarGrid, Radar, RadarChart as ReRadarChart, ResponsiveContainer } from 'recharts'

export default function RadarChart({ dimensions }) {
  const data = [
    { axis: 'Marche', value: dimensions?.market || 0 },
    { axis: 'Innovation', value: dimensions?.innovation || 0 },
    { axis: 'Faisabilite', value: dimensions?.feasibility || 0 },
    { axis: 'Rentabilite', value: dimensions?.roi || 0 },
  ]

  return (
    <div className='h-[300px] w-full'>
      <ResponsiveContainer width='100%' height='100%'>
        <ReRadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey='axis' />
          <Radar dataKey='value' stroke='#681A15' fill='#681A15' fillOpacity={0.4} />
        </ReRadarChart>
      </ResponsiveContainer>
      <div className='mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600'>
        {data.map((d) => <p key={d.axis}>{d.axis}: {d.value}</p>)}
      </div>
    </div>
  )
}
