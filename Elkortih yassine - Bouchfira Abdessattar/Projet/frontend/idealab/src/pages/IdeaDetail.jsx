import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Bookmark, CheckCircle, Clock, MessageSquare, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { getBookmarks, toggleBookmark } from '../api/bookmarks.api'
import { getFeedbacks } from '../api/feedbacks.api'
import { changeIdeaStatus } from '../api/ideas.api'
import { exportCSV, exportJSON, exportPDF, exportXLSX } from '../api/export.api'
import CommentTree from '../components/comments/CommentTree'
import FeedbackCard from '../components/feedbacks/FeedbackCard'
import FeedbackForm from '../components/feedbacks/FeedbackForm'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toast'
import useAuthStore from '../store/authStore'
import { useIdea } from '../hooks/useIdeas'
import { timeAgo } from '../utils/helpers'

const ease = [0.22, 1, 0.36, 1]

const STATUS_STYLES = {
  draft:     'bg-secondary/10 text-secondary/50 border-secondary/15',
  submitted: 'bg-secondary/20 text-secondary/70 border-secondary/25',
  review:    'bg-secondary/30 text-secondary border-secondary/35',
  validated: 'bg-secondary text-primary border-secondary',
  rejected:  'bg-secondary/10 text-secondary/40 border-secondary/15',
}

const VERDICT_OPTIONS = [
  { status: 'review',    label: 'Move to Review',  icon: Clock,        style: 'border-secondary/25 text-secondary/70 hover:border-secondary/50 hover:text-secondary' },
  { status: 'validated', label: 'Validate Idea',   icon: CheckCircle,  style: 'border-secondary bg-secondary/10 text-secondary hover:bg-secondary/20' },
  { status: 'rejected',  label: 'Reject Idea',     icon: XCircle,      style: 'border-secondary/25 text-secondary/50 hover:border-secondary/40 hover:text-secondary/80' },
]

export default function IdeaDetail() {
  void motion
  const { id } = useParams()
  const [tab, setTab] = useState('overview')
  const [verdictOpen, setVerdictOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const toast = useToast()

  const { data: idea, isLoading } = useIdea(id)

  const { data: feedbackData = [] } = useQuery({
    queryKey: ['feedbacks', String(id)],
    queryFn: () => getFeedbacks(id).then((r) => Array.isArray(r.data?.results) ? r.data.results : (Array.isArray(r.data) ? r.data : [])),
    enabled: !!id,
  })

  const { data: bookmarkedIds = [] } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const res = await getBookmarks()
      const rows = Array.isArray(res.data?.results) ? res.data.results : (Array.isArray(res.data) ? res.data : [])
      return rows.map((r) => String(r.idea?.id ?? r.idea_id ?? r.id))
    },
    enabled: !!user,
    staleTime: 30 * 1000,
  })

  const isBookmarked = bookmarkedIds.includes(String(id))

  const bookmarkMutation = useMutation({
    mutationFn: () => toggleBookmark(id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['bookmarks'] })
      const prev = queryClient.getQueryData(['bookmarks'])
      queryClient.setQueryData(['bookmarks'], (old = []) =>
        isBookmarked ? old.filter((bid) => bid !== String(id)) : [...old, String(id)]
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(['bookmarks'], ctx?.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['bookmarks'] }),
  })

  const statusMutation = useMutation({
    mutationFn: (s) => changeIdeaStatus(id, s, s === 'rejected' ? rejectionReason : ''),
    onSuccess: () => {
      toast.success('Idea status updated')
      queryClient.invalidateQueries({ queryKey: ['idea', id] })
      queryClient.invalidateQueries({ queryKey: ['ideas'] })
      queryClient.invalidateQueries({ queryKey: ['analytics', 'reviewer'] })
      queryClient.invalidateQueries({ queryKey: ['admin-ideas'] })
      setVerdictOpen(false)
      setPendingStatus(null)
      setRejectionReason('')
    },
    onError: () => toast.error('Could not update status'),
  })

  const exportMutation = useMutation({
    mutationFn: async (type) => {
      const res = type === 'csv'
        ? await exportCSV(id)
        : type === 'xlsx'
          ? await exportXLSX(id)
          : type === 'json'
            ? await exportJSON(id)
            : await exportPDF(id)
      const ext = type
      const mime = type === 'pdf'
        ? 'application/pdf'
        : type === 'xlsx'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : type === 'json'
            ? 'application/json'
            : 'text/csv'
      const url = URL.createObjectURL(new Blob([res.data], { type: mime }))
      const a = document.createElement('a')
      a.href = url
      a.download = `idea_${id}.${ext}`
      a.click()
      URL.revokeObjectURL(url)
    },
    onSuccess: () => toast.success('Download started'),
    onError: () => toast.error('Export failed'),
  })

  if (isLoading) return <DetailSkeleton />
  if (!idea) return (
    <div className='flex min-h-screen items-center justify-center bg-primary'>
      <EmptyState title='Idea not found' description='This idea does not exist.' />
    </div>
  )

  const ownFeedback = feedbackData.find((f) => String(f.reviewer?.id) === String(user?.id))
  const avgScore = feedbackData.length
    ? (feedbackData.reduce((s, f) => s + (f.weighted_score || 0), 0) / feedbackData.length).toFixed(1)
    : 0

  const canVerdict = ['reviewer', 'admin'].includes(user?.role) && ['submitted', 'review'].includes(idea.status)

  return (
    <div className='min-h-screen bg-primary'>

      {/* ── HEADER ── */}
      <div className='relative overflow-hidden border-b border-secondary/10 bg-secondary px-8 py-10'>
        <div className='pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-primary/10' />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }} className='mx-auto max-w-7xl'>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div className='min-w-0 flex-1'>
              <div className='mb-2 flex flex-wrap items-center gap-2'>
                <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${STATUS_STYLES[idea.status] || STATUS_STYLES.submitted}`}>
                  {idea.status}
                </span>
                {idea.sector && <span className='text-xs text-primary/50'>{idea.sector}</span>}
              </div>
              <h1 className='font-display text-3xl font-black tracking-tight text-primary'>{idea.title}</h1>
              {idea.status === 'rejected' && String(idea.owner?.id) === String(user?.id) && (
                <div className='mt-3 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3'>
                  <p className='text-xs font-bold uppercase tracking-widest text-primary/50 mb-1'>Rejection Reason</p>
                  <p className='text-sm text-primary/80'>{idea.rejection_reason || 'No reason provided.'}</p>
                </div>
              )}
              <p data-gsap='fade-up' data-gsap-delay='0.2' className='mt-2 text-sm text-primary/60'>{idea.description}</p>
              <p className='mt-2 text-xs text-primary/40'>by {idea.owner?.username} · {timeAgo(idea.created_at)}</p>
            </div>

            <div className='flex items-center gap-2'>
              {/* Reviewer verdict button */}
              {canVerdict && (
                <button
                  onClick={() => setVerdictOpen(true)}
                  className='flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/15 px-4 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary/25'
                >
                  <CheckCircle size={15} /> Give Verdict
                </button>
              )}

              {/* Bookmark */}
              {user && (
                <button
                  onClick={() => bookmarkMutation.mutate()}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                    isBookmarked
                      ? 'border-primary/40 bg-primary/20 text-primary'
                      : 'border-primary/20 text-primary/60 hover:border-primary/40 hover:text-primary'
                  }`}
                >
                  <Bookmark size={15} className={isBookmarked ? 'fill-current' : ''} />
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <div className='mx-auto max-w-7xl gap-8 px-6 py-8 lg:grid lg:grid-cols-3'>

        {/* ── MAIN ── */}
        <div className='space-y-6 lg:col-span-2'>
          <div className='flex gap-1 rounded-xl border border-secondary/15 bg-secondary/5 p-1'>
            {[
              { key: 'overview',  label: 'Overview' },
              { key: 'feedbacks', label: `Feedbacks (${feedbackData.length})` },
              { key: 'comments',  label: 'Comments' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all duration-200 ${
                  tab === key ? 'bg-secondary text-primary shadow-[0_2px_8px_rgba(104,26,21,0.15)]' : 'text-secondary/50 hover:text-secondary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease }} className='space-y-4'>
              {[
                { label: 'Problem',         value: idea.problem },
                { label: 'Solution',        value: idea.solution },
                { label: 'Target Audience', value: idea.target },
              ].map(({ label, value }) => (
                <div key={label} className='rounded-2xl border border-secondary/15 bg-primary p-5 shadow-[0_4px_16px_rgba(104,26,21,0.05)]'>
                  <p className='mb-2 text-[10px] font-bold uppercase tracking-widest text-secondary/35'>{label}</p>
                  <p className='text-sm leading-relaxed text-secondary/70'>{value || 'Not provided.'}</p>
                </div>
              ))}
            </motion.div>
          )}

          {tab === 'feedbacks' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease }} className='space-y-4'>
              {['reviewer', 'admin'].includes(user?.role) && (
                <FeedbackForm ideaId={id} ideaOwnerId={idea.owner?.id} existingFeedback={ownFeedback || null} />
              )}
              {feedbackData.length
                ? feedbackData.map((f) => <FeedbackCard key={f.id} feedback={f} />)
                : <EmptyState icon={MessageSquare} title='No feedbacks yet' description='Be the first reviewer to evaluate this idea.' />
              }
            </motion.div>
          )}

          {tab === 'comments' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease }}>
              <CommentTree ideaId={id} />
            </motion.div>
          )}
        </div>

        {/* ── SIDEBAR ── */}
        <aside className='mt-6 space-y-4 lg:mt-0 lg:sticky lg:top-8 lg:self-start'>
          {/* SGV Score */}
          <div className='rounded-2xl border border-secondary/15 bg-primary p-5 shadow-[0_4px_24px_rgba(104,26,21,0.06)]'>
            <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-secondary/35'>SGV Score</p>
            <div className='flex items-end gap-2'>
              <span className='font-display text-4xl font-black text-secondary'>{avgScore}</span>
              <span className='mb-1 text-secondary/30'>/10</span>
            </div>
            <p className='mt-1 text-xs text-secondary/40'>Based on {feedbackData.length} review{feedbackData.length !== 1 ? 's' : ''}</p>
            {feedbackData.length > 0 && (
              <div className='mt-4 space-y-2'>
                {['market_score', 'innovation_score', 'feasibility_score', 'roi_score'].map((key) => {
                  const avg = feedbackData.reduce((s, f) => s + (f[key] || 0), 0) / feedbackData.length
                  const label = key.replace('_score', '').replace('_', ' ')
                  return (
                    <div key={key} className='flex items-center gap-2'>
                      <p className='w-20 text-xs capitalize text-secondary/50'>{label}</p>
                      <div className='h-1.5 flex-1 rounded-full bg-secondary/10'>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((avg / 25) * 100, 100)}%` }}
                          transition={{ duration: 0.8, ease }}
                          className='h-1.5 rounded-full bg-secondary/60'
                        />
                      </div>
                      <span className='text-xs font-bold text-secondary'>{avg.toFixed(1)}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Owner */}
          <div className='rounded-2xl border border-secondary/15 bg-primary p-5 shadow-[0_4px_24px_rgba(104,26,21,0.06)]'>
            <p className='mb-3 text-[10px] font-bold uppercase tracking-widest text-secondary/35'>Submitted by</p>
            <div className='flex items-center gap-3'>
              <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 font-bold text-secondary'>
                {(idea.owner?.username || 'U')[0].toUpperCase()}
              </div>
              <div>
                <p className='text-sm font-bold text-secondary'>{idea.owner?.username}</p>
                <p className='text-xs capitalize text-secondary/45'>{idea.owner?.role || 'entrepreneur'}</p>
              </div>
            </div>
          </div>

          {/* Export buttons — owner only */}
          {user && String(user.id) === String(idea.owner?.id) && (
            <div className='rounded-2xl border border-secondary/15 bg-primary p-5 shadow-[0_4px_24px_rgba(104,26,21,0.06)]'>
              <p className='mb-3 text-[10px] font-bold uppercase tracking-widest text-secondary/35'>Export Idea</p>
              <div className='space-y-2'>
                {[['xlsx', 'Excel'], ['csv', 'Raw CSV'], ['json', 'JSON'], ['pdf', 'PDF']].map(([type, label]) => (
                  <button
                    key={type}
                    onClick={() => exportMutation.mutate(type)}
                    disabled={exportMutation.isPending}
                    className='flex w-full items-center justify-between rounded-xl border border-secondary/20 px-4 py-2 text-sm font-semibold text-secondary/60 transition-all hover:border-secondary/40 hover:text-secondary disabled:opacity-40'
                  >
                    Export as {label}
                    <span className='text-xs text-secondary/30'>↓</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reviewer verdict panel in sidebar too */}
          {canVerdict && (
            <div className='rounded-2xl border border-secondary/15 bg-primary p-5 shadow-[0_4px_24px_rgba(104,26,21,0.06)]'>
              <p className='mb-3 text-[10px] font-bold uppercase tracking-widest text-secondary/35'>Reviewer Verdict</p>
              <div className='space-y-2'>
                {VERDICT_OPTIONS.map(({ status, label, icon: Icon, style }) => (
                  <VerdictButton
                    key={status}
                    icon={Icon}
                    label={label}
                    style={style}
                    onClick={() => { setPendingStatus(status); setVerdictOpen(true) }}
                  />
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* ── VERDICT CONFIRM MODAL ── */}
      <Modal
        isOpen={verdictOpen}
        onClose={() => { setVerdictOpen(false); setPendingStatus(null) }}
        title='Confirm Verdict'
      >
        <p className='text-sm text-secondary/70'>
          You are about to mark <span className='font-semibold text-secondary'>"{idea.title}"</span> as{' '}
          <span className='font-bold capitalize text-secondary'>{pendingStatus}</span>.
          {pendingStatus === 'validated' && ' The entrepreneur will receive +50 reputation points.'}
        </p>
        {pendingStatus === 'rejected' && (
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder='Explain why this idea is being rejected (optional)…'
            rows={3}
            className='mt-4 w-full rounded-xl border border-secondary/20 bg-secondary/5 px-4 py-3 text-sm text-secondary placeholder:text-secondary/30 focus:outline-none focus:border-secondary/40 resize-none'
          />
        )}
        <div className='mt-4 flex justify-end gap-3'>
          <Button variant='ghost' onClick={() => { setVerdictOpen(false); setPendingStatus(null); setRejectionReason('') }}>Cancel</Button>
          <Button
            loading={statusMutation.isPending}
            onClick={() => statusMutation.mutate(pendingStatus)}
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function VerdictButton({ icon: Icon, label, style, onClick }) {
  void Icon
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${style}`}
    >
      <Icon size={15} /> {label}
    </button>
  )
}

function DetailSkeleton() {
  return (
    <div className='min-h-screen bg-primary'>
      <div className='h-40 animate-pulse bg-secondary/20' />
      <div className='mx-auto max-w-7xl px-6 py-8 space-y-4'>
        <div className='h-10 w-48 animate-pulse rounded-xl bg-secondary/10' />
        <div className='h-48 animate-pulse rounded-2xl bg-secondary/10' />
      </div>
    </div>
  )
}
