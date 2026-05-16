import {
  Bar,
  BarChart as ReBarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export default function BarChart({ data = [], color = '#681A15' }) {
  return (
    <div className='h-[300px] w-full'>
      <ResponsiveContainer width='100%' height='100%'>
        <ReBarChart data={data} layout='vertical' margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis type='number' />
          <YAxis type='category' dataKey='name' width={110} />
          <Tooltip />
          <Bar dataKey='count' fill={color} radius={[0, 6, 6, 0]}>
            <LabelList dataKey='count' position='right' />
          </Bar>
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  )
}
