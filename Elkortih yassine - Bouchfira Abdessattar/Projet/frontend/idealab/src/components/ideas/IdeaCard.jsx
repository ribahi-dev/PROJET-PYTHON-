import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowUpRight, Bookmark, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getBookmarks, toggleBookmark } from '../../api/bookmarks.api'
import useAuthStore from '../../store/authStore'
import { STATUS_COLORS } from '../../utils/constants'
import { scoreColor, truncate } from '../../utils/helpers'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'

export default function IdeaCard({ idea }) {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()

  const { data: bookmarks = [] } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const res = await getBookmarks()
      const rows = Array.isArray(res.data?.results) ? res.data.results : (Array.isArray(res.data) ? res.data : [])
      return rows.map((r) => String(r.idea_details?.id ?? r.idea?.id ?? r.idea_id ?? r.id))
    },
    enabled: !!user,
    staleTime: 30 * 1000,
  })

  const isBookmarked = bookmarks.includes(String(idea.id))

  const bookmarkMutation = useMutation({
    mutationFn: () => toggleBookmark(idea.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['bookmarks'] })
      const prev = queryClient.getQueryData(['bookmarks'])
      queryClient.setQueryData(['bookmarks'], (old = []) =>
        isBookmarked ? old.filter((id) => id !== String(idea.id)) : [...old, String(idea.id)]
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(['bookmarks'], ctx?.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['bookmarks'] }),
  })

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className='group relative flex flex-col overflow-hidden rounded-2xl border border-secondary/15 bg-primary shadow-[0_4px_24px_rgba(104,26,21,0.07)] transition-shadow duration-300 hover:shadow-[0_16px_48px_rgba(104,26,21,0.14)]'
    >
      <div className='h-0.5 w-full bg-gradient-to-r from-secondary/40 via-secondary/20 to-transparent' />

      <div className='flex flex-1 flex-col p-5'>
        {/* badges row */}
        <div className='mb-3 flex flex-wrap items-center gap-2'>
          <Badge variant='info' className='text-xs'>{idea.category_name || idea.category || 'Category'}</Badge>
          <Badge className='text-xs'>{idea.sector || 'General'}</Badge>
          {idea.status && (
            <span className={`rounded-lg px-2.5 py-0.5 text-xs font-bold capitalize ${STATUS_COLORS[idea.status] || STATUS_COLORS.draft}`}>
              {idea.status}
            </span>
          )}
          <span className={`ml-auto rounded-lg border px-2.5 py-0.5 text-xs font-bold ${scoreColor(idea.sgv_score || idea.global_score || 0)}`}>
            SGV {idea.sgv_score || idea.global_score || 0}
          </span>
        </div>

        {/* title */}
        <Link to={`/ideas/${idea.id}`} className='flex-1'>
          <div className='flex items-start justify-between gap-2'>
            <h3 className='line-clamp-2 text-base font-bold leading-snug text-secondary transition-colors group-hover:text-secondary/80'>
              {idea.title}
            </h3>
            <ArrowUpRight size={16} className='mt-0.5 shrink-0 text-secondary/30 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-secondary' />
          </div>
          <p className='mt-2 text-sm leading-relaxed text-secondary/55'>
            {truncate(idea.short_description || idea.description, 90)}
          </p>
        </Link>

        {/* footer */}
        <div className='mt-4 flex items-center justify-between border-t border-secondary/10 pt-3'>
          <div className='flex items-center gap-2'>
            <Avatar size='sm' src={idea.owner?.avatar} username={idea.owner?.username || 'User'} />
            <span className='text-xs font-medium text-secondary/60'>{idea.owner?.username || 'anonymous'}</span>
          </div>
          <div className='flex items-center gap-2'>
            {idea.feedbacks_count > 0 && (
              <div className='flex items-center gap-1 text-xs text-secondary/40'>
                <MessageSquare size={12} />
                <span>{idea.feedbacks_count}</span>
              </div>
            )}
            {user && (
              <button
                onClick={(e) => { e.preventDefault(); bookmarkMutation.mutate() }}
                className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-all duration-200 ${
                  isBookmarked
                    ? 'border-secondary bg-secondary text-primary'
                    : 'border-secondary/20 text-secondary/30 hover:border-secondary/50 hover:text-secondary'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Save to bookmarks'}
              >
                <Bookmark size={13} className={isBookmarked ? 'fill-current' : ''} />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  )
}
