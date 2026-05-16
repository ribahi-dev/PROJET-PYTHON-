import { motion } from 'framer-motion'
import { ThumbsUp } from 'lucide-react'
import { timeAgo } from '../../utils/helpers'
import Avatar from '../ui/Avatar'

const ease = [0.22, 1, 0.36, 1]

const DIMS = [
  { key: 'market_score',      label: 'Market' },
  { key: 'innovation_score',  label: 'Innovation' },
  { key: 'feasibility_score', label: 'Feasibility' },
  { key: 'roi_score',         label: 'ROI' },
]

export default function FeedbackCard({ feedback }) {
  const username = feedback.reviewer_username || feedback.reviewer?.username || 'Reviewer'
  const level    = feedback.reviewer_level    || feedback.reviewer?.level    || 'Bronze'
  const avatar   = feedback.reviewer?.avatar  || null
  const score    = feedback.weighted_score    || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease }}
      className={`relative rounded-2xl border bg-primary p-5 shadow-[0_4px_16px_rgba(104,26,21,0.05)] ${
        feedback.is_helpful ? 'border-secondary/40' : 'border-secondary/15'
      }`}
    >
      {/* Header */}
      <div className='mb-4 flex items-start justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <Avatar src={avatar} username={username} size='sm' />
          <div>
            <p className='text-sm font-bold text-secondary'>{username}</p>
            <p className='text-[11px] capitalize text-secondary/40'>{level}</p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {feedback.is_helpful && (
            <span className='flex items-center gap-1 rounded-full border border-secondary/25 bg-secondary/10 px-2.5 py-0.5 text-[11px] font-semibold text-secondary'>
              <ThumbsUp size={10} /> Most Helpful
            </span>
          )}
          <div className='text-right'>
            <p className='font-display text-2xl font-black text-secondary'>{score.toFixed(1)}</p>
            <p className='text-[10px] text-secondary/35'>/ 25</p>
          </div>
        </div>
      </div>

      {/* Dimension bars */}
      <div className='mb-4 grid grid-cols-4 gap-2'>
        {DIMS.map(({ key, label }) => {
          const val = feedback[key] || 0
          return (
            <div key={key} className='text-center'>
              <div className='mx-auto mb-1 h-12 w-3 overflow-hidden rounded-full bg-secondary/10'>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(val / 25) * 100}%` }}
                  transition={{ duration: 0.8, ease }}
                  className='w-full rounded-full bg-secondary mt-auto'
                  style={{ marginTop: 'auto' }}
                />
              </div>
              <p className='text-[10px] text-secondary/40'>{label}</p>
              <p className='text-xs font-bold text-secondary'>{val}</p>
            </div>
          )
        })}
      </div>

      {/* Comment */}
      <p className='text-sm leading-relaxed text-secondary/65'>{feedback.comment}</p>

      {/* Footer */}
      <p className='mt-3 text-xs text-secondary/30'>{timeAgo(feedback.created_at)}</p>
    </motion.div>
  )
}
