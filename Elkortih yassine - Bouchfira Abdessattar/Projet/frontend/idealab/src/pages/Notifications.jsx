import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCheck, MessageCircle, RefreshCw, Star, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getNotifs, markAllRead, markRead } from '../api/notifications.api'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import useAuthStore from '../store/authStore'
import useNotifStore from '../store/notifStore'
import { timeAgo } from '../utils/helpers'

const ease = [0.22, 1, 0.36, 1]

const TYPE_ICON = {
  feedback: Star,
  comment:  MessageCircle,
  status:   RefreshCw,
  new_feedback: Star,
  new_comment: MessageCircle,
  status_changed: RefreshCw,
  admin_new_idea: Bell,
  admin_status: RefreshCw,
  default:  TrendingUp,
}

const TYPE_LABEL = {
  feedback: 'Feedback',
  comment:  'Comment',
  status:   'Status Update',
  new_feedback: 'Feedback',
  new_comment: 'Comment',
  status_changed: 'Status Update',
  admin_new_idea: 'New Submission',
  admin_status: 'Moderation',
}

export default function Notifications() {
  void motion
  const [tab, setTab] = useState('all')
  const [page, setPage] = useState(1)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const setUnreadCount = useNotifStore((s) => s.setUnreadCount)
  const isAdmin = user?.role === 'admin'

  const params = useMemo(() => ({
    ...(tab === 'unread' ? { unread: true } : {}),
  }), [tab])

  const { data, isLoading } = useQuery({
    queryKey: ['notifications-page', params],
    queryFn: () => getNotifs(params).then((r) => r.data),
  })

  const items = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : [])
  const count = data?.count || items.length
  const totalPages = Math.max(1, Math.ceil(count / 20))
  const unread = items.filter((n) => !n.is_read).length

  const markAllMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      setUnreadCount(0)
      queryClient.invalidateQueries({ queryKey: ['notifications-page'] })
    },
  })

  const markOneMutation = useMutation({
    mutationFn: markRead,
    onSuccess: () => {
      setUnreadCount((prev) => Math.max(0, prev - 1))
      queryClient.invalidateQueries({ queryKey: ['notifications-page'] })
    },
  })

  const handleClick = (n) => {
    if (!n.is_read) markOneMutation.mutate(n.id)
    if (n.related_id) navigate(`/ideas/${n.related_id}`)
  }

  return (
    <div className='min-h-screen bg-primary'>
      {/* Header */}
      <div className='relative overflow-hidden border-b border-secondary/10 bg-secondary px-8 py-10'>
        <div className='pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-primary/10' />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
          <p className='mb-1 text-xs font-bold uppercase tracking-widest text-primary/40'>Activity</p>
          <div className='flex items-end justify-between gap-4'>
            <div>
              <h1 className='font-display text-3xl font-black tracking-tight text-primary'>Notifications</h1>
              <p className='mt-1 text-sm text-primary/55'>
                {isAdmin ? 'Track moderation updates and platform activity.' : 'Stay updated on your ideas and community activity.'}
              </p>
            </div>
            {unread > 0 && (
              <Button
                size='sm'
                variant='ghost'
                onClick={() => markAllMutation.mutate()}
                loading={markAllMutation.isPending}
                className='border border-primary/20 text-primary hover:bg-primary/10'
              >
                <CheckCheck size={14} /> Mark all read
              </Button>
            )}
          </div>
        </motion.div>
      </div>

      <div className='mx-auto max-w-3xl px-6 py-8'>
        {/* Tabs */}
        <div className='mb-6 flex gap-1 rounded-xl border border-secondary/15 bg-secondary/5 p-1'>
          {[
            { key: 'all',    label: 'All' },
            { key: 'unread', label: `Unread${unread > 0 ? ` (${unread})` : ''}` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setPage(1) }}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all duration-200 ${
                tab === key ? 'bg-secondary text-primary shadow-[0_2px_8px_rgba(104,26,21,0.15)]' : 'text-secondary/50 hover:text-secondary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div className='space-y-3'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='h-20 animate-pulse rounded-2xl bg-secondary/10' />
            ))}
          </div>
        ) : items.length ? (
          <AnimatePresence>
            <div className='space-y-2'>
              {items.map((n, i) => {
                const type = n.notif_type || n.type
                const Icon = TYPE_ICON[type] || TYPE_ICON.default
                return (
                  <motion.button
                    key={n.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.03, ease }}
                    onClick={() => handleClick(n)}
                    className={`flex w-full items-start gap-4 rounded-2xl border px-5 py-4 text-left transition-all hover:shadow-[0_4px_16px_rgba(104,26,21,0.08)] ${
                      n.is_read
                        ? 'border-secondary/10 bg-primary'
                        : 'border-secondary/20 bg-secondary/5'
                    }`}
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                      n.is_read ? 'border-secondary/15 bg-secondary/5 text-secondary/40' : 'border-secondary/25 bg-secondary/10 text-secondary'
                    }`}>
                      <Icon size={15} />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2'>
                        <span className='text-[10px] font-bold uppercase tracking-widest text-secondary/35'>
                          {TYPE_LABEL[type] || type}
                        </span>
                        {!n.is_read && <span className='h-1.5 w-1.5 rounded-full bg-secondary' />}
                      </div>
                      <p className='mt-0.5 text-sm text-secondary'>{n.message}</p>
                      <p className='mt-1 text-xs text-secondary/40'>{timeAgo(n.created_at)}</p>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </AnimatePresence>
        ) : (
          <EmptyState
            icon={Bell}
            title='No notifications'
            description={isAdmin ? 'Admin moderation alerts will appear here.' : "You'll be notified when someone interacts with your ideas."}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='mt-8 flex items-center justify-center gap-3'>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className='rounded-xl border border-secondary/20 px-4 py-2 text-sm font-semibold text-secondary/60 transition-all hover:border-secondary/40 hover:text-secondary disabled:cursor-not-allowed disabled:opacity-30'
            >
              ← Prev
            </button>
            <span className='rounded-xl border border-secondary/15 bg-secondary/5 px-4 py-2 text-sm font-bold text-secondary'>
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className='rounded-xl border border-secondary/20 px-4 py-2 text-sm font-semibold text-secondary/60 transition-all hover:border-secondary/40 hover:text-secondary disabled:cursor-not-allowed disabled:opacity-30'
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
