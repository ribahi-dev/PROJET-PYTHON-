import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Info, ThumbsUp } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { editFeedback, markHelpful, submitFeedback } from '../../api/feedbacks.api'
import useAuthStore from '../../store/authStore'
import Button from '../ui/Button'
import { useToast } from '../ui/Toast'

const ease = [0.22, 1, 0.36, 1]

const DIMENSIONS = [
  { key: 'market_score',      label: 'Market',      tip: 'Market demand and problem urgency' },
  { key: 'innovation_score',  label: 'Innovation',  tip: 'Uniqueness and differentiation' },
  { key: 'feasibility_score', label: 'Feasibility', tip: 'Execution realism and complexity' },
  { key: 'roi_score',         label: 'ROI',         tip: 'Revenue potential and sustainability' },
]

export default function FeedbackForm({ ideaId, existingFeedback = null, ideaOwnerId, onSuccess }) {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const toast = useToast()

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      market_score:      existingFeedback?.market_score      || 5,
      innovation_score:  existingFeedback?.innovation_score  || 5,
      feasibility_score: existingFeedback?.feasibility_score || 5,
      roi_score:         existingFeedback?.roi_score         || 5,
      comment:           existingFeedback?.comment           || '',
    },
  })

  const scores = DIMENSIONS.map((d) => Number(watch(d.key) || 0))
  const total = (scores.reduce((a, b) => a + b, 0) / 4).toFixed(1)
  const commentLength = (watch('comment') || '').length

  const mutation = useMutation({
    mutationFn: (payload) => existingFeedback
      ? editFeedback(existingFeedback.id, payload)
      : submitFeedback({ idea: ideaId, ...payload }),
    onSuccess: () => {
      toast.success(existingFeedback ? 'Feedback updated!' : 'Feedback submitted!')
      queryClient.invalidateQueries({ queryKey: ['feedbacks', String(ideaId)] })
      queryClient.invalidateQueries({ queryKey: ['user'] }) // refresh reputation
      queryClient.invalidateQueries({ queryKey: ['analytics', 'reviewer'] })
      onSuccess?.()
    },
    onError: (err) => toast.error(err?.response?.data?.detail || err?.response?.data?.non_field_errors?.[0] || 'Could not submit feedback'),
  })

  const helpfulMutation = useMutation({
    mutationFn: () => markHelpful(existingFeedback.id),
    onSuccess: () => {
      toast.success('Marked as most helpful!')
      queryClient.invalidateQueries({ queryKey: ['feedbacks', String(ideaId)] })
    },
    onError: () => toast.error('Could not mark as helpful'),
  })

  // all hooks before early returns
  const editWindowClosed = existingFeedback?.can_edit === false

  if (!user)                    return <InfoBox text='Please login to submit feedback' />
  if (user.role !== 'reviewer') return <InfoBox text='Only reviewers can submit feedback' />
  if (String(user.id) === String(ideaOwnerId)) return <InfoBox text='You cannot review your own idea' />
  if (editWindowClosed)         return <InfoBox text='Edit window closed (24h limit)' />

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease }}
      onSubmit={handleSubmit((v) => mutation.mutate(v))}
      className='relative space-y-5 rounded-2xl border border-secondary/15 bg-primary p-6 shadow-[0_4px_24px_rgba(104,26,21,0.06)]'
    >
      <div className='flex items-center justify-between'>
        <h3 className='font-display font-bold text-secondary'>
          {existingFeedback ? 'Update Your Review' : 'Submit Your Review'}
        </h3>
        <div className='rounded-xl border border-secondary/20 bg-secondary/5 px-3 py-1.5 text-center'>
          <p className='text-[10px] font-bold uppercase tracking-widest text-secondary/40'>Score</p>
          <p className='font-display text-xl font-black text-secondary'>{total}<span className='text-xs text-secondary/30'>/25</span></p>
        </div>
      </div>

      {/* Dimension sliders */}
      <div className='space-y-4'>
        {DIMENSIONS.map((d) => {
          const val = Number(watch(d.key) || 0)
          const pct = (val / 25) * 100
          return (
            <div key={d.key}>
              <div className='mb-1.5 flex items-center justify-between'>
                <label className='flex items-center gap-1.5 text-sm font-semibold text-secondary/70'>
                  {d.label}
                  <span title={d.tip}><Info size={12} className='text-secondary/30' /></span>
                </label>
                <span className='font-display text-sm font-black text-secondary'>{val}<span className='text-xs text-secondary/30'>/25</span></span>
              </div>
              <div className='relative h-2 rounded-full bg-secondary/10'>
                <div className='absolute h-2 rounded-full bg-secondary transition-all duration-150' style={{ width: `${pct}%` }} />
                <input
                  type='range' min='0' max='25'
                  {...register(d.key)}
                  className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Comment */}
      <div>
        <div className='mb-1.5 flex items-center justify-between'>
          <label className='text-sm font-semibold text-secondary/70'>Detailed Comment</label>
          <span className={`text-xs ${commentLength < 50 ? 'text-secondary/40' : 'text-secondary/60'}`}>{commentLength}/1000</span>
        </div>
        <textarea
          {...register('comment', {
            required: 'Comment is required',
            minLength: { value: 50, message: 'Minimum 50 characters' },
            maxLength: { value: 1000, message: 'Max 1000 characters' },
          })}
          rows={5}
          className='input-premium resize-none'
          placeholder='Explain your ratings in detail — what works, what needs improvement…'
        />
        {errors.comment && <p className='mt-1 text-xs text-secondary/50'>{errors.comment.message}</p>}
      </div>

      <div className='flex items-center justify-between gap-3'>
        {/* Mark helpful — only idea owner can do this on existing feedback */}
        {existingFeedback && String(user.id) === String(ideaOwnerId) && (
          <button
            type='button'
            onClick={() => helpfulMutation.mutate()}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-all ${
              existingFeedback.is_helpful
                ? 'border-secondary bg-secondary text-primary'
                : 'border-secondary/20 text-secondary/50 hover:border-secondary/40 hover:text-secondary'
            }`}
          >
            <ThumbsUp size={14} /> Most Helpful
          </button>
        )}
        <Button type='submit' loading={mutation.isPending} className='ml-auto'>
          {existingFeedback ? 'Update Review' : 'Submit Review'}
        </Button>
      </div>
    </motion.form>
  )
}

function InfoBox({ text }) {
  return (
    <div className='rounded-2xl border border-secondary/15 bg-secondary/5 px-5 py-4 text-sm text-secondary/60'>
      {text}
    </div>
  )
}
