import { motion, AnimatePresence } from 'framer-motion'
import { Compass, LayoutGrid, List, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import IdeaCard from '../components/ideas/IdeaCard'
import IdeaFilters from '../components/ideas/IdeaFilters'
import EmptyState from '../components/ui/EmptyState'
import { SkeletonCard } from '../components/ui/Skeleton'
import useDebounce from '../hooks/useDebounce'
import { useIdeas } from '../hooks/useIdeas'
import { Reveal, Stagger, easePremium } from '../components/motion/Reveal'
import useAuthStore from '../store/authStore'

const SORT_OPTIONS = [
  { value: '-created_at',   label: 'Newest' },
  { value: 'created_at',    label: 'Oldest' },
  { value: '-global_score', label: 'Top Rated' },
  { value: 'global_score',  label: 'Lowest Score' },
]

export default function Explore() {
  void motion
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch]             = useState(searchParams.get('search') || '')
  const [showFilters, setShowFilters]   = useState(false)
  const [view, setView]                 = useState('grid')
  const user                            = useAuthStore((s) => s.user)
  const token                           = useAuthStore((s) => s.token)
  const isReviewUser                    = user?.role === 'reviewer' || user?.role === 'admin'
  const debounced                       = useDebounce(search, 300)

  const filters = {
    category:  searchParams.get('category')  || '',
    status:    searchParams.get('status')    || '',
    min_score: searchParams.get('min_score') || '',
    max_score: searchParams.get('max_score') || '',
    date_from: searchParams.get('date_from') || '',
    date_to:   searchParams.get('date_to')   || '',
  }
  const sort = searchParams.get('ordering') || '-created_at'
  const page = Number(searchParams.get('page') || 1)

  const params = {
    search: debounced || undefined,
    ...filters,
    audience: isReviewUser ? 'reviewer' : 'public',
    ordering: sort,
    page,
  }

  const { data, isLoading } = useIdeas(params, {
    enabled: !isReviewUser || !!token,
  })
  const ideas    = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : [])
  const count    = data?.count ?? ideas.length
  const hasNext  = !!data?.next
  const hasPrev  = !!data?.previous
  const hasFilters = Object.values(filters).some(Boolean)

  const setParam = (next) => {
    const merged = new URLSearchParams(searchParams)
    Object.entries(next).forEach(([k, v]) => { if (v) merged.set(k, v); else merged.delete(k) })
    merged.set('page', '1')
    setSearchParams(merged)
  }

  return (
    <div className='min-h-screen bg-primary'>

      {/* ── HERO BANNER ── */}
      <section className='relative overflow-hidden bg-secondary px-6 py-14'>
        <div className='pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-primary/10' />
        <div className='pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-primary/5 blur-3xl' />
        <div className='mx-auto max-w-7xl'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easePremium }}
          >
            <div className='mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary/70'>
              <Compass size={12} /> Idea Discovery
            </div>
            <div className='flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
              <div>
                <h1 className='font-display text-4xl font-black tracking-tight text-primary md:text-5xl'>
                  Explore Ideas
                </h1>
                <p className='mt-2 max-w-lg text-sm leading-relaxed text-primary/60'>
                  {isReviewUser
                    ? 'Review submitted ideas, move them through validation, and help founders improve.'
                    : 'Discover startup ideas from entrepreneurs worldwide. Filter by status, score, and category to find what inspires you.'}
                </p>
              </div>
              {/* search bar in hero */}
              <div className='relative w-full max-w-sm'>
                <Search size={15} className='absolute left-4 top-1/2 -translate-y-1/2 text-primary/40' />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder='Search ideas…'
                  className='w-full rounded-2xl border border-primary/20 bg-primary/10 py-3 pl-11 pr-10 text-sm text-primary placeholder:text-primary/35 outline-none focus:border-primary/40 focus:bg-primary/15'
                />
                {search && (
                  <button onClick={() => setSearch('')} className='absolute right-3 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary'>
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TOOLBAR ── */}
      <div className='sticky top-16 z-30 border-b border-secondary/10 bg-primary/95 backdrop-blur-md'>
        <div className='mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3'>
          {/* left: count + filter toggle */}
          <div className='flex items-center gap-3'>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-semibold transition-all duration-200 ${showFilters ? 'border-secondary bg-secondary text-primary' : 'border-secondary/20 text-secondary/70 hover:border-secondary/40 hover:text-secondary'}`}
            >
              <SlidersHorizontal size={14} />
              Filters
              {hasFilters && <span className='flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-secondary'>{Object.values(filters).filter(Boolean).length}</span>}
            </button>
            <span className='text-sm text-secondary/45'>
              <span className='font-bold text-secondary'>{count}</span> ideas
            </span>
          </div>

          {/* right: sort + view toggle */}
          <div className='flex items-center gap-3'>
            <select
              value={sort}
              onChange={(e) => setParam({ ordering: e.target.value })}
              className='rounded-xl border border-secondary/20 bg-primary px-3 py-1.5 text-sm font-semibold text-secondary outline-none focus:border-secondary/40'
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className='flex items-center rounded-xl border border-secondary/20 p-0.5'>
              <button onClick={() => setView('grid')} className={`rounded-lg p-1.5 transition-colors ${view === 'grid' ? 'bg-secondary text-primary' : 'text-secondary/50 hover:text-secondary'}`}>
                <LayoutGrid size={15} />
              </button>
              <button onClick={() => setView('list')} className={`rounded-lg p-1.5 transition-colors ${view === 'list' ? 'bg-secondary text-primary' : 'text-secondary/50 hover:text-secondary'}`}>
                <List size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className='mx-auto max-w-7xl px-6 py-8'>
        <div className={`flex gap-6 ${showFilters ? 'lg:grid lg:grid-cols-4' : ''}`}>

          {/* FILTERS SIDEBAR */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.35, ease: easePremium }}
                className='lg:col-span-1 shrink-0 w-64 lg:w-auto overflow-hidden'
              >
                <IdeaFilters filters={filters} onChange={setParam} canReview={isReviewUser} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* IDEAS GRID */}
          <div className={`flex-1 min-w-0 ${showFilters ? 'lg:col-span-3' : 'w-full'}`}>

            {/* active filter chips */}
            {hasFilters && (
              <div className='mb-5 flex flex-wrap gap-2'>
                {Object.entries(filters).filter(([, v]) => v).map(([k, v]) => (
                  <span key={k} className='flex items-center gap-1.5 rounded-full border border-secondary/20 bg-secondary/8 px-3 py-1 text-xs font-semibold text-secondary/70'>
                    {k.replace('_', ' ')}: {v}
                    <button onClick={() => setParam({ [k]: '' })} className='text-secondary/40 hover:text-secondary'>
                      <X size={11} />
                    </button>
                  </span>
                ))}
                <button onClick={() => setParam({ category: '', status: '', min_score: '', max_score: '', date_from: '', date_to: '' })} className='text-xs font-semibold text-secondary/50 hover:text-secondary underline-offset-2 hover:underline'>
                  Clear all
                </button>
              </div>
            )}

            {isLoading ? (
              <div className={`grid gap-4 ${view === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : ideas.length ? (
              <AnimatePresence mode='wait'>
                <motion.div
                  key={`${sort}-${page}-${debounced}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: easePremium }}
                  className={`grid gap-4 ${view === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}
                >
                  {ideas.map((idea, i) => (
                    <motion.div
                      key={idea.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.04, ease: easePremium }}
                    >
                      <IdeaCard idea={idea} />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            ) : (
              <EmptyState
                icon={Search}
                title='No ideas found'
                description='Try adjusting your filters or search query.'
              />
            )}

            {/* ── PAGINATION ── */}
            {(hasPrev || hasNext) && (
              <div className='mt-10 flex items-center justify-center gap-3'>
                <button
                  disabled={!hasPrev}
                  onClick={() => setParam({ page: String(page - 1) })}
                  className='rounded-xl border border-secondary/20 px-5 py-2 text-sm font-semibold text-secondary/70 transition-all hover:border-secondary/50 hover:text-secondary disabled:cursor-not-allowed disabled:opacity-35'
                >
                  ← Previous
                </button>
                <span className='rounded-xl border border-secondary/15 bg-secondary/6 px-4 py-2 text-sm font-bold text-secondary'>
                  Page {page}
                </span>
                <button
                  disabled={!hasNext}
                  onClick={() => setParam({ page: String(page + 1) })}
                  className='rounded-xl border border-secondary/20 px-5 py-2 text-sm font-semibold text-secondary/70 transition-all hover:border-secondary/50 hover:text-secondary disabled:cursor-not-allowed disabled:opacity-35'
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
