import { motion } from 'framer-motion'
import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import { SECTORS } from '../../utils/constants'

const PUBLIC_STATUSES = ['', 'validated']
const REVIEW_STATUSES = ['', 'draft', 'submitted', 'review', 'validated', 'rejected']
const STATUS_LABELS = { '': 'All', draft: 'Draft', submitted: 'Submitted', review: 'In Review', validated: 'Validated', rejected: 'Rejected' }

export default function IdeaFilters({ filters, onChange, canReview = false }) {
  void motion
  const hasActive = Object.values(filters).some(Boolean)
  const statuses = canReview ? REVIEW_STATUSES : PUBLIC_STATUSES

  return (
    <motion.aside
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className='relative space-y-6 rounded-2xl border border-secondary/15 bg-primary p-5 shadow-[0_4px_24px_rgba(104,26,21,0.07)]'
    >
      {/* header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <SlidersHorizontal size={15} className='text-secondary/60' />
          <span className='text-sm font-bold text-secondary'>Filters</span>
        </div>
        {hasActive && (
          <button
            onClick={() => onChange({ category: '', status: '', min_score: '', max_score: '', date_from: '', date_to: '' })}
            className='flex items-center gap-1 text-xs font-semibold text-secondary/50 transition-colors hover:text-secondary'
          >
            <RotateCcw size={11} /> Reset
          </button>
        )}
      </div>

      {/* status */}
      <div>
        <p className='mb-2.5 text-xs font-bold uppercase tracking-widest text-secondary/40'>Status</p>
        <div className='flex flex-col gap-1.5'>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => onChange({ ...filters, status: s })}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                filters.status === s
                  ? 'bg-secondary text-primary shadow-[0_4px_12px_rgba(104,26,21,0.20)]'
                  : 'text-secondary/60 hover:bg-secondary/8 hover:text-secondary'
              }`}
            >
              {STATUS_LABELS[s]}
              {filters.status === s && <span className='h-1.5 w-1.5 rounded-full bg-primary/60' />}
            </button>
          ))}
        </div>
      </div>

      {/* category (sector) */}
      <div>
        <p className='mb-2.5 text-xs font-bold uppercase tracking-widest text-secondary/40'>Category</p>
        <select
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
          className='w-full rounded-xl border border-secondary/20 bg-primary px-3 py-2 text-sm text-secondary outline-none focus:border-secondary/50'
        >
          <option value=''>All categories</option>
          {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* SGV score range */}
      <div>
        <p className='mb-2.5 text-xs font-bold uppercase tracking-widest text-secondary/40'>SGV Score</p>
        <div className='grid grid-cols-2 gap-2'>
          <div>
            <label className='mb-1 block text-xs text-secondary/50'>Min</label>
            <input
              type='number'
              min='0' max='10'
              value={filters.min_score}
              onChange={(e) => onChange({ ...filters, min_score: e.target.value })}
              placeholder='0'
              className='w-full rounded-xl border border-secondary/20 bg-primary px-3 py-2 text-sm text-secondary placeholder:text-secondary/30 outline-none focus:border-secondary/50'
            />
          </div>
          <div>
            <label className='mb-1 block text-xs text-secondary/50'>Max</label>
            <input
              type='number'
              min='0' max='10'
              value={filters.max_score}
              onChange={(e) => onChange({ ...filters, max_score: e.target.value })}
              placeholder='10'
              className='w-full rounded-xl border border-secondary/20 bg-primary px-3 py-2 text-sm text-secondary placeholder:text-secondary/30 outline-none focus:border-secondary/50'
            />
          </div>
        </div>
      </div>

      {/* date range */}
      <div>
        <p className='mb-2.5 text-xs font-bold uppercase tracking-widest text-secondary/40'>Date Range</p>
        <div className='space-y-2'>
          <div>
            <label className='mb-1 block text-xs text-secondary/50'>From</label>
            <input
              type='date'
              value={filters.date_from}
              onChange={(e) => onChange({ ...filters, date_from: e.target.value })}
              className='w-full rounded-xl border border-secondary/20 bg-primary px-3 py-2 text-sm text-secondary outline-none focus:border-secondary/50'
            />
          </div>
          <div>
            <label className='mb-1 block text-xs text-secondary/50'>To</label>
            <input
              type='date'
              value={filters.date_to}
              onChange={(e) => onChange({ ...filters, date_to: e.target.value })}
              className='w-full rounded-xl border border-secondary/20 bg-primary px-3 py-2 text-sm text-secondary outline-none focus:border-secondary/50'
            />
          </div>
        </div>
      </div>

      {/* active filter count */}
      {hasActive && (
        <div className='rounded-xl border border-secondary/15 bg-secondary/6 px-3 py-2 text-center text-xs font-semibold text-secondary/60'>
          {Object.values(filters).filter(Boolean).length} filter{Object.values(filters).filter(Boolean).length > 1 ? 's' : ''} active
        </div>
      )}
    </motion.aside>
  )
}
