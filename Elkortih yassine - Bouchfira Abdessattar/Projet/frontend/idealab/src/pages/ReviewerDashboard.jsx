import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Award, BarChart2, ChevronRight, ClipboardList, MessageSquare, Star, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getReviewerStats } from '../api/analytics.api'
import EmptyState from '../components/ui/EmptyState'
import useAuthStore from '../store/authStore'
import { formatDate, timeAgo } from '../utils/helpers'

const ease = [0.22, 1, 0.36, 1]
const EMPTY_LIST = []

const LEVEL_CONFIG = {
  bronze: { label: 'Bronze', next: 'Silver', min: 0,   max: 50,  style: 'border-secondary/25 bg-secondary/8 text-secondary/60' },
  silver: { label: 'Silver', next: 'Gold',   min: 50,  max: 150, style: 'border-secondary/40 bg-secondary/15 text-secondary/75' },
  gold:   { label: 'Gold',   next: 'Expert', min: 150, max: 300, style: 'border-secondary/60 bg-secondary/25 text-secondary' },
  expert: { label: 'Expert', next: null,     min: 300, max: 300, style: 'border-secondary bg-secondary text-primary' },
}

function inferLevel(pts) {
  if (pts >= 300) return 'expert'
  if (pts >= 150) return 'gold'
  if (pts >= 50)  return 'silver'
  return 'bronze'
}

export default function ReviewerDashboard() {
  void motion
  const user = useAuthStore((s) => s.user)
  const [page, setPage] = useState(1)
  const PER_PAGE = 8

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'reviewer'],
    queryFn: () => getReviewerStats().then((r) => r.data),
    enabled: !!user?.id,
    staleTime: 0,
    refetchOnMount: 'always',
  })

  // all hooks before early return
  const stats         = data?.stats || {}
  const evaluated     = data?.evaluated_ideas || EMPTY_LIST
  const pending       = data?.pending_ideas || EMPTY_LIST
  const scores        = data?.scores || EMPTY_LIST
  const rep           = Number(stats.reputation_points || 0)
  const level         = (stats.level && LEVEL_CONFIG[stats.level.toLowerCase()]) ? stats.level.toLowerCase() : inferLevel(rep)
  const levelCfg      = LEVEL_CONFIG[level] ?? LEVEL_CONFIG['bronze']
  const repProgress   = Math.min(((rep - levelCfg.min) / (levelCfg.max - levelCfg.min || 1)) * 100, 100)

  const totalPages    = Math.max(1, Math.ceil(evaluated.length / PER_PAGE))
  const paged         = evaluated.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const distribution = useMemo(() => [
    { label: '0-6.25',     count: scores.filter((s) => s < 6.25).length },
    { label: '6.25-12.5',  count: scores.filter((s) => s >= 6.25 && s < 12.5).length },
    { label: '12.5-18.75', count: scores.filter((s) => s >= 12.5 && s < 18.75).length },
    { label: '18.75-25',   count: scores.filter((s) => s >= 18.75).length },
  ], [scores])

  const maxDist = Math.max(...distribution.map((d) => d.count), 1)

  if (isLoading) return <ReviewerSkeleton />

  return (
    <div className='min-h-screen bg-primary'>

      {/* ── HEADER ── */}
      <div className='relative overflow-hidden border-b border-secondary/10 bg-secondary px-8 py-10'>
        <div className='pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-primary/10' />
        <div className='pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl' />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
          <p className='mb-1 text-xs font-bold uppercase tracking-widest text-primary/40'>Reviewer Workspace</p>
          <h1 className='font-display text-3xl font-black tracking-tight text-primary'>
            Welcome back, <span className='opacity-70'>{user?.first_name || user?.username}</span>
          </h1>
          <p className='mt-1 text-sm text-primary/55'>Your reviews help entrepreneurs build better ideas.</p>
        </motion.div>
      </div>

      <div className='mx-auto max-w-7xl space-y-8 px-6 py-8'>

        {/* ── STAT CARDS ── */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {[ 
            { icon: MessageSquare, label: 'Reviews Given',   value: stats.total_feedbacks || 0 },
            { icon: ClipboardList, label: 'Ideas Reviewed',  value: stats.ideas_reviewed  || 0 },
            { icon: BarChart2,     label: 'Avg Score Given', value: stats.average_score   || 0 },
            { icon: Star,          label: 'Pending Queue',   value: stats.pending_count   || 0 },
          ].map(({ icon: Icon, label, value }, i) => {
            void Icon
            return (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.07, ease }}
              className='rounded-2xl border border-secondary/12 bg-primary p-5 shadow-[0_4px_24px_rgba(104,26,21,0.06)]'
            >
              <div className='mb-3 flex items-center justify-between'>
                <p className='text-xs font-semibold uppercase tracking-widest text-secondary/35'>{label}</p>
                <div className='flex h-8 w-8 items-center justify-center rounded-xl border border-secondary/12 bg-secondary/5'>
                  <Icon size={14} className='text-secondary/50' />
                </div>
              </div>
              <p className='font-display text-3xl font-black text-secondary'>{value}</p>
            </motion.div>
            )
          })}
        </div>

        {/* ── REPUTATION + DISTRIBUTION ── */}
        <div className='grid gap-6 lg:grid-cols-2'>

          {/* Reputation card */}
          <div className='rounded-2xl border border-secondary/12 bg-primary p-6 shadow-[0_4px_24px_rgba(104,26,21,0.06)]'>
            <div className='mb-5 flex items-center gap-2'>
              <Award size={16} className='text-secondary/50' />
              <h2 className='font-display text-base font-bold text-secondary'>Reputation Level</h2>
            </div>
            <div className='mb-4 flex items-center justify-between'>
              <div>
                <p className='font-display text-4xl font-black text-secondary'>{rep}</p>
                <p className='text-xs text-secondary/40'>reputation points</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${levelCfg.style}`}>
                {levelCfg.label}
              </span>
            </div>
            <div className='mb-2 h-2.5 overflow-hidden rounded-full bg-secondary/10'>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${repProgress}%` }}
                transition={{ duration: 1.2, ease }}
                className='h-2.5 rounded-full bg-secondary'
              />
            </div>
            <div className='flex items-center justify-between text-xs text-secondary/35'>
              <span>{levelCfg.label}</span>
              {levelCfg.next
                ? <span>{Math.max(levelCfg.max - rep, 0)} pts to {levelCfg.next}</span>
                : <span>Max level reached 🎉</span>
              }
            </div>
          </div>

          {/* Score distribution */}
          <div className='rounded-2xl border border-secondary/12 bg-primary p-6 shadow-[0_4px_24px_rgba(104,26,21,0.06)]'>
            <div className='mb-5 flex items-center gap-2'>
              <TrendingUp size={16} className='text-secondary/50' />
              <h2 className='font-display text-base font-bold text-secondary'>Score Distribution</h2>
            </div>
            {scores.length ? (
              <div className='flex items-end gap-3 h-28'>
                {distribution.map(({ label, count }) => (
                  <div key={label} className='flex flex-1 flex-col items-center gap-1.5'>
                    <span className='text-xs font-bold text-secondary'>{count}</span>
                    <div className='w-full rounded-t-lg bg-secondary/15 overflow-hidden' style={{ height: 80 }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(count / maxDist) * 100}%` }}
                        transition={{ duration: 0.8, ease }}
                        className='w-full rounded-t-lg bg-secondary mt-auto'
                        style={{ marginTop: 'auto' }}
                      />
                    </div>
                    <span className='text-[10px] text-secondary/40'>{label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title='No scores yet' description='Submit reviews to see your distribution.' />
            )}
          </div>
        </div>

        {/* ── PENDING IDEAS ── */}
        {pending.length > 0 && (
          <div className='rounded-2xl border border-secondary/12 bg-primary shadow-[0_4px_24px_rgba(104,26,21,0.06)]'>
            <div className='flex items-center justify-between border-b border-secondary/8 px-6 py-4'>
              <div className='flex items-center gap-2'>
                <ClipboardList size={15} className='text-secondary/50' />
                <h2 className='font-display text-base font-bold text-secondary'>Pending Review</h2>
                <span className='rounded-full border border-secondary/20 bg-secondary/8 px-2 py-0.5 text-xs font-bold text-secondary/60'>{pending.length}</span>
              </div>
            </div>
            <div className='divide-y divide-secondary/6'>
              {pending.slice(0, 5).map((idea, i) => (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05, ease }}
                  className='flex items-center justify-between px-6 py-4'
                >
                  <div className='min-w-0 flex-1'>
                    <p className='truncate font-semibold text-secondary'>{idea.title}</p>
                    <p className='text-xs text-secondary/40'>{idea.sector} · {timeAgo(idea.created_at)}</p>
                  </div>
                  <Link
                    to={`/ideas/${idea.id}`}
                    className='ml-4 flex items-center gap-1.5 rounded-xl border border-secondary/20 px-3 py-1.5 text-xs font-semibold text-secondary/60 transition-all hover:border-secondary/40 hover:text-secondary'
                  >
                    Review <ChevronRight size={12} />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── EVALUATED IDEAS TABLE ── */}
        <div className='rounded-2xl border border-secondary/12 bg-primary shadow-[0_4px_24px_rgba(104,26,21,0.06)]'>
          <div className='flex items-center justify-between border-b border-secondary/8 px-6 py-4'>
            <div className='flex items-center gap-2'>
              <MessageSquare size={15} className='text-secondary/50' />
              <h2 className='font-display text-base font-bold text-secondary'>My Reviews</h2>
              <span className='rounded-full border border-secondary/20 bg-secondary/8 px-2 py-0.5 text-xs font-bold text-secondary/60'>{evaluated.length}</span>
            </div>
          </div>

          {paged.length ? (
            <>
              <div className='overflow-x-auto'>
                <table className='w-full min-w-[640px] text-sm'>
                  <thead>
                    <tr className='border-b border-secondary/6'>
                      {['Idea', 'Score', 'Market', 'Innovation', 'Feasibility', 'ROI', 'Date'].map((h) => (
                        <th key={h} className='px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-secondary/30'>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((row, i) => (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.04, ease }}
                        className='border-b border-secondary/6 transition-colors hover:bg-secondary/3 last:border-0'
                      >
                        <td className='px-6 py-4'>
                          <Link to={`/ideas/${row.idea_id}`} className='font-semibold text-secondary hover:underline underline-offset-2 line-clamp-1'>
                            {row.idea_title}
                          </Link>
                        </td>
                        <td className='px-6 py-4'>
                          <span className='font-display text-lg font-black text-secondary'>
                            {row.my_score}<span className='text-xs text-secondary/30'>/25</span>
                          </span>
                        </td>
                        {[row.market_score, row.innovation_score, row.feasibility_score, row.roi_score].map((val, j) => (
                          <td key={j} className='px-6 py-4'>
                            <span className='rounded-lg border border-secondary/15 bg-secondary/5 px-2 py-0.5 text-xs font-bold text-secondary/70'>{val}</span>
                          </td>
                        ))}
                        <td className='px-6 py-4 text-xs text-secondary/40'>{formatDate(row.created_at)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className='flex items-center justify-center gap-3 border-t border-secondary/8 px-6 py-4'>
                  <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                    className='rounded-xl border border-secondary/20 px-4 py-1.5 text-sm font-semibold text-secondary/50 transition-all hover:border-secondary/40 hover:text-secondary disabled:cursor-not-allowed disabled:opacity-30'>
                    ← Prev
                  </button>
                  <span className='rounded-xl border border-secondary/12 bg-secondary/5 px-4 py-1.5 text-sm font-bold text-secondary'>
                    {page} / {totalPages}
                  </span>
                  <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
                    className='rounded-xl border border-secondary/20 px-4 py-1.5 text-sm font-semibold text-secondary/50 transition-all hover:border-secondary/40 hover:text-secondary disabled:cursor-not-allowed disabled:opacity-30'>
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className='p-8'>
              <EmptyState icon={MessageSquare} title='No reviews yet' description='Go to Explore and start reviewing submitted ideas.' />
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

function ReviewerSkeleton() {
  return (
    <div className='min-h-screen bg-primary'>
      <div className='h-32 animate-pulse bg-secondary/15' />
      <div className='mx-auto max-w-7xl space-y-6 px-6 py-8'>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className='h-28 animate-pulse rounded-2xl bg-secondary/10' />)}
        </div>
        <div className='grid gap-6 lg:grid-cols-2'>
          {Array.from({ length: 2 }).map((_, i) => <div key={i} className='h-48 animate-pulse rounded-2xl bg-secondary/10' />)}
        </div>
        <div className='h-64 animate-pulse rounded-2xl bg-secondary/10' />
      </div>
    </div>
  )
}
