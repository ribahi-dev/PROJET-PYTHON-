import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Lightbulb, MessageSquare, PlusCircle, Star, Trash2, Pencil, TrendingUp, Eye, ChevronRight, X, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getDashboard } from '../api/analytics.api'
import { deleteIdea, getIdea, getIdeas } from '../api/ideas.api'
import { getFeedbacks } from '../api/feedbacks.api'
import { getNotifs } from '../api/notifications.api'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toast'
import useAuthStore from '../store/authStore'
import { timeAgo, formatDate } from '../utils/helpers'

const ease = [0.22, 1, 0.36, 1]

const STATUS_STYLES = {
  draft:      'bg-secondary/10 text-secondary/60 border-secondary/20',
  submitted:  'bg-secondary/20 text-secondary border-secondary/30',
  review:     'bg-secondary/30 text-secondary border-secondary/40',
  validated:  'bg-secondary text-primary border-secondary',
  rejected:   'bg-secondary/15 text-secondary/50 border-secondary/20',
}

function scoreColor(s) {
  if (s >= 7) return 'text-secondary font-bold'
  if (s >= 4) return 'text-secondary/70'
  return 'text-secondary/40'
}

export default function EntrepreneurDashboard() {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const toast = useToast()
  const [ideaToDelete, setIdeaToDelete] = useState(null)
  const [ideaToView, setIdeaToView]     = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => getDashboard().then((r) => r.data),
  })

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', 'recent'],
    queryFn: async () => {
      const res = await getNotifs({ page_size: 5 })
      return Array.isArray(res.data?.results) ? res.data.results : (Array.isArray(res.data) ? res.data : [])
    },
  })

  const { data: ideasData, isLoading: ideasLoading } = useQuery({
    queryKey: ['my-ideas'],
    queryFn: async () => {
      const res = await getIdeas({ owner: user?.username })
      return Array.isArray(res.data?.results) ? res.data.results : (Array.isArray(res.data) ? res.data : [])
    },
    enabled: !!user,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteIdea,
    onSuccess: () => {
      toast.success('Idea deleted')
      queryClient.invalidateQueries({ queryKey: ['analytics', 'dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['my-ideas'] })
      setIdeaToDelete(null)
    },
    onError: () => toast.error('Could not delete idea'),
  })

  const stats     = data?.stats || {}
  const ideas     = ideasData || []
  const feedbacks = data?.recent_feedbacks || []
  const sgvHistory = data?.sgv_evolution || []
  const dims      = data?.dimensions_radar?.reduce((acc, d) => ({ ...acc, [d.dimension]: d.score }), {}) || {}

  if (isLoading || ideasLoading) return <DashSkeleton />

  return (
    <div className='min-h-screen bg-primary'>
      {/* ── HEADER BANNER ── */}
      <div className='relative overflow-hidden border-b border-secondary/10 bg-secondary px-8 py-10'>
        <div className='pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-primary/10' />
        <div className='pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl' />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
          <p className='mb-1 text-xs font-bold uppercase tracking-widest text-primary/40'>Entrepreneur Workspace</p>
          <h1 className='font-display text-3xl font-black tracking-tight text-primary'>
            Welcome back, <span className='opacity-70'>{user?.first_name || user?.username}</span>
          </h1>
          <p className='mt-1 text-sm text-primary/55'>Track your ideas, monitor feedback and grow your score.</p>
        </motion.div>
      </div>

      <div className='mx-auto max-w-7xl space-y-8 px-6 py-8'>

        {/* ── STAT CARDS ── */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {[
            { icon: Lightbulb,    label: 'Total Ideas',       value: stats.total_ideas    || ideas.length || 0 },
            { icon: MessageSquare,label: 'Feedbacks Received', value: stats.total_feedbacks || 0 },
            { icon: BarChart3,    label: 'Average SGV',        value: stats.avg_sgv        || stats.average_sgv || 0 },
            { icon: Star,         label: 'Best SGV Score',     value: stats.best_sgv       || 0 },
          ].map(({ icon: Icon, label, value }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.07, ease }}
              className='rounded-2xl border border-secondary/15 bg-primary p-5 shadow-[0_4px_24px_rgba(104,26,21,0.06)]'
            >
              <div className='mb-3 flex items-center justify-between'>
                <p className='text-xs font-semibold uppercase tracking-widest text-secondary/40'>{label}</p>
                <div className='flex h-8 w-8 items-center justify-center rounded-xl border border-secondary/15 bg-secondary/5'>
                  <Icon size={14} className='text-secondary/60' />
                </div>
              </div>
              <p className='font-display text-3xl font-black text-secondary'>{value}</p>
            </motion.div>
          ))}
        </div>

        {/* ── SGV HISTORY + DIMENSIONS ── */}
        <div className='grid gap-6 lg:grid-cols-2'>
          <div className='rounded-2xl border border-secondary/15 bg-primary p-6 shadow-[0_4px_24px_rgba(104,26,21,0.06)]'>
            <div className='mb-5 flex items-center gap-2'>
              <TrendingUp size={16} className='text-secondary/60' />
              <h2 className='font-display text-base font-bold text-secondary'>SGV Score per Idea</h2>
            </div>
            {sgvHistory.length ? (
              <div className='space-y-3'>
                {sgvHistory.map((item) => (
                  <div key={item.idea_id || item.idea} className='flex items-center gap-3'>
                    <p className='w-32 truncate text-xs text-secondary/60'>{item.idea_title || item.idea}</p>
                    <div className='flex-1 rounded-full bg-secondary/10 h-2'>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((item.score / 10) * 100, 100)}%` }}
                        transition={{ duration: 0.8, ease }}
                        className='h-2 rounded-full bg-secondary'
                      />
                    </div>
                    <span className={`text-xs font-bold ${scoreColor(item.score)}`}>{item.score}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title='No scores yet' description='Submit an idea to see your SGV score.' />
            )}
          </div>

          <div className='rounded-2xl border border-secondary/15 bg-primary p-6 shadow-[0_4px_24px_rgba(104,26,21,0.06)]'>
            <div className='mb-5 flex items-center gap-2'>
              <BarChart3 size={16} className='text-secondary/60' />
              <h2 className='font-display text-base font-bold text-secondary'>Dimension Averages</h2>
            </div>
            {Object.keys(dims).length ? (
              <div className='space-y-3'>
                {Object.entries(dims).map(([dim, val]) => (
                  <div key={dim} className='flex items-center gap-3'>
                    <p className='w-24 text-xs capitalize text-secondary/60'>{dim}</p>
                    <div className='flex-1 rounded-full bg-secondary/10 h-2'>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((val / 10) * 100, 100)}%` }}
                        transition={{ duration: 0.8, ease }}
                        className='h-2 rounded-full bg-secondary/70'
                      />
                    </div>
                    <span className='text-xs font-bold text-secondary'>{val}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title='No dimension data' description='Receive feedback to see dimension scores.' />
            )}
          </div>
        </div>

        {/* ── MY IDEAS TABLE ── */}
        <div className='rounded-2xl border border-secondary/15 bg-primary shadow-[0_4px_24px_rgba(104,26,21,0.06)]'>
          <div className='flex items-center justify-between border-b border-secondary/10 px-6 py-4'>
            <div className='flex items-center gap-2'>
              <Lightbulb size={16} className='text-secondary/60' />
              <h2 className='font-display text-base font-bold text-secondary'>My Ideas</h2>
              <span className='rounded-full border border-secondary/20 bg-secondary/8 px-2 py-0.5 text-xs font-bold text-secondary/60'>{ideas.length}</span>
            </div>
            <Button size='sm' onClick={() => navigate('/submit')}>
              <PlusCircle size={14} /> New Idea
            </Button>
          </div>

          {ideas.length ? (
            <div className='overflow-x-auto'>
              <table className='w-full min-w-[700px] text-sm'>
                <thead>
                  <tr className='border-b border-secondary/8'>
                    {['Title', 'Status', 'SGV Score', 'Feedbacks', 'Actions'].map((h) => (
                      <th key={h} className='px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-secondary/35'>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ideas.map((idea, i) => (
                    <motion.tr
                      key={idea.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.04, ease }}
                      className='group border-b border-secondary/8 transition-colors hover:bg-secondary/4 last:border-0'
                    >
                      <td className='px-6 py-4'>
                        <Link to={`/ideas/${idea.id}`} className='font-semibold text-secondary hover:underline underline-offset-2'>
                          {idea.title}
                        </Link>
                        <p className='mt-0.5 text-xs text-secondary/40'>{idea.sector}</p>
                      </td>
                      <td className='px-6 py-4'>
                        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${STATUS_STYLES[idea.status] || STATUS_STYLES.draft}`}>
                          {idea.status}
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <span className={`font-display text-lg font-black ${scoreColor(idea.sgv_score || 0)}`}>
                          {idea.sgv_score || 0}
                        </span>
                        <span className='text-secondary/30'>/10</span>
                      </td>
                      <td className='px-6 py-4'>
                        <span className='font-semibold text-secondary'>{idea.feedbacks_count || 0}</span>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-2'>
                          {/* Details — opens modal */}
                          <button
                            onClick={() => setIdeaToView(idea)}
                            className='flex h-7 w-7 items-center justify-center rounded-lg border border-secondary/20 text-secondary/50 transition-colors hover:border-secondary/40 hover:text-secondary'
                            title='View details'
                          >
                            <Eye size={13} />
                          </button>

                          {/* Update — only draft or rejected */}
                          <button
                            onClick={() => navigate(`/submit?edit=${idea.id}`)}
                            disabled={!['draft', 'rejected'].includes(idea.status)}
                            title={['draft', 'rejected'].includes(idea.status) ? 'Edit idea' : 'Cannot edit after submission'}
                            className='flex h-7 w-7 items-center justify-center rounded-lg border border-secondary/20 text-secondary/50 transition-colors hover:border-secondary/40 hover:text-secondary disabled:cursor-not-allowed disabled:opacity-25'
                          >
                            <Pencil size={13} />
                          </button>

                          {/* Delete — only draft */}
                          <button
                            onClick={() => idea.status === 'draft' && setIdeaToDelete(idea)}
                            disabled={idea.status !== 'draft'}
                            title={idea.status === 'draft' ? 'Delete idea' : 'Only drafts can be deleted'}
                            className='flex h-7 w-7 items-center justify-center rounded-lg border border-secondary/20 text-secondary/50 transition-colors hover:border-secondary/40 hover:text-secondary disabled:cursor-not-allowed disabled:opacity-25'
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className='p-8'>
              <EmptyState icon={Lightbulb} title='No ideas yet' description='Submit your first idea to get started.' actionLabel='Submit Idea' onAction={() => navigate('/submit')} />
            </div>
          )}
        </div>

        {/* ── RECENT FEEDBACKS + NOTIFICATIONS ── */}
        <div className='grid gap-6 lg:grid-cols-2'>
          <div className='rounded-2xl border border-secondary/15 bg-primary shadow-[0_4px_24px_rgba(104,26,21,0.06)]'>
            <div className='flex items-center justify-between border-b border-secondary/10 px-6 py-4'>
              <div className='flex items-center gap-2'>
                <MessageSquare size={15} className='text-secondary/60' />
                <h2 className='font-display text-base font-bold text-secondary'>Recent Feedbacks</h2>
              </div>
            </div>
            {feedbacks.length ? (
              <div className='divide-y divide-secondary/8'>
                {feedbacks.slice(0, 6).map((f) => (
                  <div key={f.id} className='flex items-center justify-between px-6 py-3.5'>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-semibold text-secondary'>{f.idea_title}</p>
                      <p className='text-xs text-secondary/45'>{f.reviewer || f.reviewer?.username} · {timeAgo(f.created_at)}</p>
                    </div>
                    <div className='ml-4 flex items-center gap-2'>
                      <span className={`font-display text-base font-black ${scoreColor(f.weighted_score || f.total_score || 0)}`}>{f.weighted_score || f.total_score || 0}</span>
                      <Link to={`/ideas/${f.idea_id || f.idea?.id}`} className='flex h-6 w-6 items-center justify-center rounded-lg border border-secondary/20 text-secondary/40 hover:text-secondary'>
                        <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='p-6'><EmptyState title='No feedbacks yet' description='Feedbacks will appear here once reviewers evaluate your ideas.' /></div>
            )}
          </div>

          <div className='rounded-2xl border border-secondary/15 bg-primary shadow-[0_4px_24px_rgba(104,26,21,0.06)]'>
            <div className='flex items-center justify-between border-b border-secondary/10 px-6 py-4'>
              <h2 className='font-display text-base font-bold text-secondary'>Recent Notifications</h2>
              <Link to='/notifications' className='text-xs font-semibold text-secondary/50 hover:text-secondary'>View all →</Link>
            </div>
            {notifications.length ? (
              <div className='divide-y divide-secondary/8'>
                {notifications.map((n) => (
                  <div key={n.id} className={`flex items-start gap-3 px-6 py-3.5 ${!n.is_read ? 'bg-secondary/4' : ''}`}>
                    <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${!n.is_read ? 'bg-secondary' : 'bg-secondary/20'}`} />
                    <div>
                      <p className='text-sm text-secondary'>{n.message}</p>
                      <p className='mt-0.5 text-xs text-secondary/40'>{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='p-6'><EmptyState title='No notifications' description="You'll be notified when something happens." /></div>
            )}
          </div>
        </div>
      </div>

      {/* ── DELETE MODAL ── */}
      <Modal isOpen={!!ideaToDelete} onClose={() => setIdeaToDelete(null)} title='Delete idea'>
        <p className='text-sm text-secondary/70'>Are you sure you want to delete <span className='font-semibold text-secondary'>"{ideaToDelete?.title}"</span>? This cannot be undone.</p>
        <div className='mt-6 flex justify-end gap-3'>
          <Button variant='ghost' onClick={() => setIdeaToDelete(null)}>Cancel</Button>
          <Button variant='danger' loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(ideaToDelete.id)}>Delete</Button>
        </div>
      </Modal>

      {/* ── IDEA DETAIL MODAL ── */}
      <IdeaDetailModal idea={ideaToView} onClose={() => setIdeaToView(null)} onEdit={(id) => { setIdeaToView(null); navigate(`/submit?edit=${id}`) }} />
    </div>
  )
}

function DashSkeleton() {
  return (
    <div className='min-h-screen bg-primary'>
      <div className='h-32 animate-pulse bg-secondary/20' />
      <div className='mx-auto max-w-7xl space-y-6 px-6 py-8'>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className='h-28 animate-pulse rounded-2xl bg-secondary/10' />)}
        </div>
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className='h-48 animate-pulse rounded-2xl bg-secondary/10' />)}
      </div>
    </div>
  )
}

const STATUS_STYLES_MODAL = {
  draft:     'bg-secondary/10 text-secondary/50 border-secondary/15',
  submitted: 'bg-secondary/20 text-secondary/70 border-secondary/25',
  review:    'bg-secondary/30 text-secondary border-secondary/35',
  validated: 'bg-secondary text-primary border-secondary',
  rejected:  'bg-secondary/10 text-secondary/40 border-secondary/15',
}

function IdeaDetailModal({ idea, onClose, onEdit }) {
  const { data: feedbacks = [] } = useQuery({
    queryKey: ['feedbacks', String(idea?.id)],
    queryFn: () => getFeedbacks(idea.id).then((r) => Array.isArray(r.data?.results) ? r.data.results : (Array.isArray(r.data) ? r.data : [])),
    enabled: !!idea?.id,
  })

  if (!idea) return null

  const avgScore = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + (f.weighted_score || 0), 0) / feedbacks.length).toFixed(1)
    : 0

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        idea ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div className='absolute inset-0 bg-secondary/40 backdrop-blur-sm' onClick={onClose} />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className='relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-secondary/20 bg-primary shadow-[0_32px_64px_rgba(104,26,21,0.20)]'
      >
        {/* Header */}
        <div className='sticky top-0 z-10 flex items-start justify-between border-b border-secondary/10 bg-primary px-6 py-5'>
          <div className='flex-1 min-w-0 pr-4'>
            <div className='mb-1.5 flex flex-wrap items-center gap-2'>
              <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${STATUS_STYLES_MODAL[idea.status] || STATUS_STYLES_MODAL.draft}`}>
                {idea.status}
              </span>
              {idea.sector && <span className='text-xs text-secondary/40'>{idea.sector}</span>}
            </div>
            <h2 className='font-display text-xl font-black tracking-tight text-secondary'>{idea.title}</h2>
            <p className='mt-0.5 text-xs text-secondary/40'>{formatDate(idea.created_at)}</p>
          </div>
          <div className='flex items-center gap-2 shrink-0'>
            <Link
              to={`/ideas/${idea.id}`}
              onClick={onClose}
              className='flex items-center gap-1.5 rounded-xl border border-secondary/20 px-3 py-1.5 text-xs font-semibold text-secondary/60 transition-colors hover:border-secondary/40 hover:text-secondary'
            >
              <ExternalLink size={12} /> Full page
            </Link>
            <button onClick={onClose} className='flex h-8 w-8 items-center justify-center rounded-xl border border-secondary/15 text-secondary/40 hover:text-secondary'>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='space-y-5 p-6'>
          {/* SGV score */}
          <div className='flex items-center gap-4 rounded-2xl border border-secondary/12 bg-secondary/4 px-5 py-4'>
            <div className='text-center'>
              <p className='font-display text-3xl font-black text-secondary'>{avgScore}</p>
              <p className='text-[10px] font-bold uppercase tracking-widest text-secondary/35'>SGV Score</p>
            </div>
            <div className='h-10 w-px bg-secondary/10' />
            <div className='text-center'>
              <p className='font-display text-3xl font-black text-secondary'>{feedbacks.length}</p>
              <p className='text-[10px] font-bold uppercase tracking-widest text-secondary/35'>Reviews</p>
            </div>
            <div className='ml-auto flex gap-2'>
              {['draft', 'rejected'].includes(idea.status) && (
                <Button size='sm' variant='secondary' onClick={() => onEdit(idea.id)}>
                  <Pencil size={13} /> Edit
                </Button>
              )}
            </div>
          </div>

          {/* Fields */}
          {[
            { label: 'Description', value: idea.description },
            { label: 'Problem',     value: idea.problem },
            { label: 'Solution',    value: idea.solution },
            { label: 'Target',      value: idea.target },
            ...(idea.status === 'rejected' ? [{ label: 'Rejection Reason', value: idea.rejection_reason || 'No reason provided.' }] : []),
          ].map(({ label, value }) => value ? (
            <div key={label}>
              <p className='mb-1.5 text-[10px] font-bold uppercase tracking-widest text-secondary/35'>{label}</p>
              <p className='text-sm leading-relaxed text-secondary/70'>{value}</p>
            </div>
          ) : null)}

          {/* Feedbacks */}
          {feedbacks.length > 0 && (
            <div>
              <p className='mb-3 text-[10px] font-bold uppercase tracking-widest text-secondary/35'>Recent Feedbacks</p>
              <div className='space-y-2'>
                {feedbacks.slice(0, 3).map((f) => (
                  <div key={f.id} className='rounded-xl border border-secondary/10 bg-secondary/4 px-4 py-3'>
                    <div className='flex items-center justify-between'>
                      <p className='text-xs font-bold text-secondary'>{f.reviewer_username || f.reviewer?.username}</p>
                      <span className='font-display text-sm font-black text-secondary'>{f.weighted_score?.toFixed(1)}/25</span>
                    </div>
                    <p className='mt-1 text-xs text-secondary/55 line-clamp-2'>{f.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
