import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, LayoutGrid, List, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getBookmarks, toggleBookmark } from '../api/bookmarks.api'
import EmptyState from '../components/ui/EmptyState'
import { useToast } from '../components/ui/Toast'
import { timeAgo } from '../utils/helpers'

const ease = [0.22, 1, 0.36, 1]

const STATUS_STYLES = {
  draft:     'bg-secondary/10 text-secondary/50 border-secondary/15',
  submitted: 'bg-secondary/20 text-secondary/70 border-secondary/25',
  review:    'bg-secondary/30 text-secondary border-secondary/35',
  validated: 'bg-secondary text-primary border-secondary',
  rejected:  'bg-secondary/10 text-secondary/40 border-secondary/15',
}

export default function Bookmarks() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [view, setView] = useState('grid')

  const { data: bookmarks = [], isLoading } = useQuery({
    queryKey: ['bookmarks', 'full'],
    queryFn: async () => {
      const res = await getBookmarks()
      const rows = Array.isArray(res.data?.results) ? res.data.results : (Array.isArray(res.data) ? res.data : [])
      return rows.map((r) => ({ idea: r.idea_details || r.idea || r, saved_at: r.created_at || r.saved_at }))
    },
  })

  const removeMutation = useMutation({
    mutationFn: (ideaId) => toggleBookmark(ideaId),
    onMutate: async (ideaId) => {
      await queryClient.cancelQueries({ queryKey: ['bookmarks'] })
      const prev = queryClient.getQueryData(['bookmarks'])
      queryClient.setQueryData(['bookmarks'], (old = []) => old.filter((b) => String(b.idea?.id || b.id) !== String(ideaId)))
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      queryClient.setQueryData(['bookmarks'], ctx?.prev)
      toast.error('Could not remove bookmark')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
      queryClient.invalidateQueries({ queryKey: ['bookmarks', 'full'] })
    },
  })

  return (
    <div className='min-h-screen bg-primary'>
      {/* Header */}
      <div className='relative overflow-hidden border-b border-secondary/10 bg-secondary px-8 py-10'>
        <div className='pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-primary/10' />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
          <p className='mb-1 text-xs font-bold uppercase tracking-widest text-primary/40'>Saved Ideas</p>
          <div className='flex items-end justify-between gap-4'>
            <div>
              <h1 className='font-display text-3xl font-black tracking-tight text-primary'>Bookmarks</h1>
              <p className='mt-1 text-sm text-primary/55'>Ideas you saved for later reference.</p>
            </div>
            <div className='flex items-center gap-2 rounded-xl border border-primary/20 p-0.5'>
              <button onClick={() => setView('grid')} className={`rounded-lg p-2 transition-colors ${view === 'grid' ? 'bg-primary/20 text-primary' : 'text-primary/40 hover:text-primary'}`}>
                <LayoutGrid size={15} />
              </button>
              <button onClick={() => setView('list')} className={`rounded-lg p-2 transition-colors ${view === 'list' ? 'bg-primary/20 text-primary' : 'text-primary/40 hover:text-primary'}`}>
                <List size={15} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <div className='mx-auto max-w-7xl px-6 py-8'>
        {/* Count badge */}
        <div className='mb-6 flex items-center gap-2'>
          <span className='rounded-full border border-secondary/20 bg-secondary/8 px-3 py-1 text-xs font-bold text-secondary/60'>
            {bookmarks.length} saved
          </span>
        </div>

        {isLoading ? (
          <div className={`grid gap-4 ${view === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='h-48 animate-pulse rounded-2xl bg-secondary/10' />
            ))}
          </div>
        ) : bookmarks.length ? (
          <AnimatePresence>
            <div className={`grid gap-4 ${view === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
              {bookmarks.map(({ idea, saved_at }, i) => (
                <motion.div
                  key={idea?.id || i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: i * 0.04, ease }}
                  className='group relative rounded-2xl border border-secondary/15 bg-primary p-5 shadow-[0_4px_24px_rgba(104,26,21,0.05)] transition-shadow hover:shadow-[0_8px_32px_rgba(104,26,21,0.10)]'
                >
                  {/* Remove button */}
                  <button
                    onClick={() => removeMutation.mutate(idea?.id)}
                    className='absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg border border-secondary/15 text-secondary/30 opacity-0 transition-all group-hover:opacity-100 hover:border-secondary/40 hover:text-secondary'
                  >
                    <Trash2 size={13} />
                  </button>

                  <div className='mb-3 flex items-start gap-2'>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${STATUS_STYLES[idea?.status] || STATUS_STYLES.draft}`}>
                      {idea?.status || 'draft'}
                    </span>
                    {idea?.sector && (
                      <span className='rounded-full border border-secondary/15 bg-secondary/5 px-2.5 py-0.5 text-[11px] text-secondary/50'>
                        {idea.sector}
                      </span>
                    )}
                  </div>

                  <Link to={`/ideas/${idea?.id}`} className='block'>
                    <h3 className='font-display text-base font-bold text-secondary transition-colors group-hover:text-secondary/80 line-clamp-2'>
                      {idea?.title}
                    </h3>
                    <p className='mt-1.5 text-xs leading-relaxed text-secondary/50 line-clamp-2'>
                      {idea?.description}
                    </p>
                  </Link>

                  <div className='mt-4 flex items-center justify-between'>
                    <div className='flex items-center gap-1.5 text-xs text-secondary/40'>
                      <Bookmark size={11} />
                      Saved {timeAgo(saved_at)}
                    </div>
                    {idea?.global_score > 0 && (
                      <span className='font-display text-sm font-black text-secondary'>
                        {idea.global_score}<span className='text-secondary/30 text-xs'>/10</span>
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        ) : (
          <EmptyState
            icon={Bookmark}
            title='No bookmarks yet'
            description='Explore ideas and save the ones that inspire you.'
            actionLabel='Explore Ideas'
            onAction={() => (window.location.href = '/explore')}
          />
        )}
      </div>
    </div>
  )
}
