import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BarChart3, Lightbulb, MessageSquare, Shield,
  Trash2, Users, Search, PlusCircle, Pencil,
} from 'lucide-react'
import { createElement, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { getAdminStats } from '../api/analytics.api'
import { getCategoriesList, createCategory, updateCategory, deleteCategory } from '../api/categories.api'
import { deleteFeedback, getFeedbacks } from '../api/feedbacks.api'
import { deleteIdea, getIdeas, changeIdeaStatus } from '../api/ideas.api'
import { deleteUser, getUsers, toggleUserStatus, updateUserRole } from '../api/users.api'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toast'
import { formatDate, timeAgo } from '../utils/helpers'

const TABS = [
  { key: 'overview',   label: 'Overview',   icon: BarChart3 },
  { key: 'users',      label: 'Users',      icon: Users },
  { key: 'ideas',      label: 'Ideas',      icon: Lightbulb },
  { key: 'feedbacks',  label: 'Feedbacks',  icon: MessageSquare },
  { key: 'categories', label: 'Categories', icon: Shield },
]

const STATUS_STYLES = {
  draft:     'bg-secondary/8 text-secondary/50 border-secondary/15',
  submitted: 'bg-secondary/15 text-secondary/70 border-secondary/25',
  review:    'bg-secondary/25 text-secondary border-secondary/35',
  validated: 'bg-secondary text-primary border-secondary',
  rejected:  'bg-secondary/8 text-secondary/40 border-secondary/15',
}

export default function AdminPanel() {
  const [tab, setTab] = useState('overview')

  return (
    <div className='min-h-screen bg-primary'>
      {/* Header */}
      <div className='relative overflow-hidden border-b border-secondary/10 bg-secondary px-8 py-10'>
        <div className='pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-primary/10' />
        <div>
          <p className='mb-1 text-xs font-bold uppercase tracking-widest text-primary/40'>Administration</p>
          <h1 className='font-display text-3xl font-black tracking-tight text-primary'>Admin Panel</h1>
          <p className='mt-1 text-sm text-primary/55'>Manage users, ideas, feedbacks and platform settings.</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className='border-b border-secondary/10 bg-primary px-8'>
        <div className='flex gap-1 overflow-x-auto py-2'>
          {TABS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                tab === key ? 'bg-secondary text-primary' : 'text-secondary/50 hover:bg-secondary/8 hover:text-secondary'
              }`}
            >
              {createElement(icon, { size: 14 })} {label}
            </button>
          ))}
        </div>
      </div>

      <div className='mx-auto max-w-7xl px-6 py-8'>
        {tab === 'overview'   && <OverviewTab />}
        {tab === 'users'      && <UsersTab />}
        {tab === 'ideas'      && <IdeasTab />}
        {tab === 'feedbacks'  && <FeedbacksTab />}
        {tab === 'categories' && <CategoriesTab />}
      </div>
    </div>
  )
}

/* ── OVERVIEW ── */
function OverviewTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => getAdminStats().then((r) => r.data),
  })

  if (isLoading) return <TabSkeleton />

  const stats = data?.stats || data || {}
  const ideasByStatus = normalizeList(data?.ideas_by_status || data?.ideas_by_status_data)
  const totalIdeas = Number(stats.total_ideas || 0)
  const pendingReview = ideasByStatus
    .filter((item) => ['submitted', 'review'].includes(item.name || item.status))
    .reduce((sum, item) => sum + Number(item.count || 0), 0)
  const statCards = [
    { icon: Users, label: 'Total Users', value: stats.total_users || 0 },
    { icon: Lightbulb, label: 'Total Ideas', value: totalIdeas },
    { icon: MessageSquare, label: 'Total Feedbacks', value: stats.total_feedbacks || 0 },
    { icon: Shield, label: 'Global Avg SGV', value: formatScore(stats.global_avg_sgv || 0) },
  ]

  return (
    <div className='space-y-8'>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {statCards.map(({ icon, label, value }) => (
          <div
            key={label}
            className='rounded-2xl border border-secondary/12 bg-primary p-5 shadow-[0_4px_24px_rgba(104,26,21,0.06)]'
          >
            <div className='mb-3 flex items-center justify-between'>
              <p className='text-xs font-semibold uppercase tracking-widest text-secondary/35'>{label}</p>
              <div className='flex h-8 w-8 items-center justify-center rounded-xl border border-secondary/12 bg-secondary/5'>
                {createElement(icon, { size: 14, className: 'text-secondary/50' })}
              </div>
            </div>
            <p className='font-display text-3xl font-black text-secondary'>{value}</p>
          </div>
        ))}
      </div>

      {/* Ideas by status */}
      {ideasByStatus.length > 0 && (
        <div className='rounded-2xl border border-secondary/12 bg-primary p-6 shadow-[0_4px_24px_rgba(104,26,21,0.06)]'>
          <div className='mb-5 flex items-center justify-between gap-4'>
            <h2 className='font-display text-base font-bold text-secondary'>Ideas by Status</h2>
            <span className='rounded-full border border-secondary/15 bg-secondary/5 px-3 py-1 text-xs font-semibold text-secondary/45'>
              {pendingReview} pending
            </span>
          </div>
          <div className='space-y-3'>
            {ideasByStatus.map((item) => {
              const name = item.name || item.status
              const count = Number(item.count || 0)
              return (
              <div key={name} className='flex items-center gap-3'>
                <span className={`w-24 shrink-0 rounded-full border px-2.5 py-0.5 text-center text-[11px] font-semibold capitalize ${STATUS_STYLES[name] || STATUS_STYLES.draft}`}>{name}</span>
                <div className='flex-1 h-2 rounded-full bg-secondary/10'>
                  <div className='h-2 rounded-full bg-secondary transition-[width] duration-700' style={{ width: `${Math.min((count / (totalIdeas || 1)) * 100, 100)}%` }} />
                </div>
                <span className='w-8 text-right text-xs font-bold text-secondary'>{count}</span>
              </div>
              )
            })}
          </div>
        </div>
      )}

      <div className='grid gap-4 lg:grid-cols-2'>
        <OverviewList title='Signups - Last 30 Days' items={normalizeList(data?.signups_30_days).slice(-7)} valueKey='count' labelKey='date' />
        <OverviewList title='Feedbacks - Last 30 Days' items={normalizeList(data?.feedbacks_30_days).slice(-7)} valueKey='count' labelKey='date' />
      </div>

      {normalizeList(data?.users_by_role).length > 0 && (
        <div className='rounded-2xl border border-secondary/12 bg-primary p-6 shadow-[0_4px_24px_rgba(104,26,21,0.06)]'>
          <h2 className='mb-5 font-display text-base font-bold text-secondary'>Users by Role</h2>
          <div className='grid gap-3 sm:grid-cols-3'>
            {normalizeList(data.users_by_role).map((item) => (
              <div key={item.role} className='rounded-xl border border-secondary/10 bg-secondary/5 p-4'>
                <p className='text-xs font-semibold capitalize text-secondary/45'>{item.role}</p>
                <p className='mt-2 font-display text-2xl font-black text-secondary'>{item.count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {normalizeList(data?.recent_users).length > 0 && (
        <div className='rounded-2xl border border-secondary/12 bg-primary shadow-[0_4px_24px_rgba(104,26,21,0.06)]'>
        <div className='border-b border-secondary/8 px-6 py-4'>
          <h2 className='font-display text-base font-bold text-secondary'>Recent Users</h2>
        </div>
        <div className='divide-y divide-secondary/6'>
          {normalizeList(data.recent_users).map((u) => (
            <div key={u.id} className='flex items-center justify-between px-6 py-3'>
              <div>
                <p className='text-sm font-semibold text-secondary'>{u.username}</p>
                <p className='text-xs text-secondary/40'>{u.email}</p>
              </div>
              <div className='flex items-center gap-2'>
                <span className='rounded-full border border-secondary/15 bg-secondary/5 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-secondary/60'>{u.role}</span>
                <span className='text-xs text-secondary/35'>{timeAgo(u.date_joined)}</span>
              </div>
            </div>
          ))}
        </div>
        </div>
      )}
    </div>
  )
}

/* ── USERS ── */
function UsersTab() {
  const qc = useQueryClient()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: () => getUsers({ search }).then((r) => r.data),
  })
  const users = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : [])

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => updateUserRole(id, role),
    onSuccess: () => { toast.success('Role updated'); qc.invalidateQueries({ queryKey: ['admin-users'] }) },
    onError: () => toast.error('Could not update role'),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, is_active }) => toggleUserStatus(id, is_active),
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries({ queryKey: ['admin-users'] }) },
    onError: () => toast.error('Could not update status'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => { toast.success('User deleted'); setConfirmDelete(null); qc.invalidateQueries({ queryKey: ['admin-users'] }) },
    onError: () => toast.error('Could not delete user'),
  })

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-3 rounded-2xl border border-secondary/12 bg-primary px-4 py-3'>
        <Search size={15} className='text-secondary/35' />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Search by username or email...'
          className='flex-1 bg-transparent text-sm text-secondary placeholder:text-secondary/35 outline-none'
        />
      </div>

      <div className='rounded-2xl border border-secondary/12 bg-primary shadow-[0_4px_24px_rgba(104,26,21,0.06)]'>
        {isLoading ? <TabSkeleton /> : users.length ? (
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[700px] text-sm'>
              <thead>
                <tr className='border-b border-secondary/8'>
                  {['User', 'Email', 'Role', 'Reputation', 'Status', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className='px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-secondary/30'>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className='border-b border-secondary/6 transition-colors hover:bg-secondary/3 last:border-0'
                  >
                    <td className='px-6 py-3 font-semibold text-secondary'>{u.username}</td>
                    <td className='px-6 py-3 text-secondary/50'>{u.email}</td>
                    <td className='px-6 py-3'>
                      <select
                        value={u.role}
                        onChange={(e) => roleMutation.mutate({ id: u.id, role: e.target.value })}
                        className='rounded-lg border border-secondary/20 bg-primary px-2 py-1 text-xs font-semibold text-secondary outline-none'
                      >
                        <option value='entrepreneur'>Entrepreneur</option>
                        <option value='reviewer'>Reviewer</option>
                        <option value='admin'>Admin</option>
                      </select>
                    </td>
                    <td className='px-6 py-3 font-bold text-secondary'>
                      {u.role === 'admin' ? <span className='text-secondary/30'>-</span> : (u.reputation_points || 0)}
                    </td>
                    <td className='px-6 py-3'>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${u.is_active ? 'border-secondary/25 bg-secondary/10 text-secondary' : 'border-secondary/15 bg-secondary/5 text-secondary/40'}`}>
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className='px-6 py-3 text-xs text-secondary/40'>{formatDate(u.date_joined)}</td>
                    <td className='px-6 py-3'>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() => statusMutation.mutate({ id: u.id, is_active: !u.is_active })}
                          className='rounded-lg border border-secondary/20 px-2.5 py-1 text-xs font-semibold text-secondary/60 transition-colors hover:border-secondary/40 hover:text-secondary'
                        >
                          {u.is_active ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(u)}
                          className='flex h-7 w-7 items-center justify-center rounded-lg border border-secondary/20 text-secondary/40 transition-colors hover:border-secondary/40 hover:text-secondary'
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className='p-8'><EmptyState icon={Users} title='No users found' description='Try a different search.' /></div>
        )}
      </div>

      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title={`Delete ${confirmDelete?.username}?`}
        description='This will permanently delete the user and all their data.'
        onConfirm={() => deleteMutation.mutate(confirmDelete.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}

/* ── IDEAS ── */
function IdeasTab() {
  const qc = useQueryClient()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-ideas', search, statusFilter],
    queryFn: () => getIdeas({ search, status: statusFilter || undefined, all: statusFilter ? undefined : 1 }).then((r) => r.data),
  })
  const ideas = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : [])

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => changeIdeaStatus(id, status),
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries({ queryKey: ['admin-ideas'] }) },
    onError: () => toast.error('Could not update status'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteIdea,
    onSuccess: () => { toast.success('Idea deleted'); setConfirmDelete(null); qc.invalidateQueries({ queryKey: ['admin-ideas'] }) },
    onError: () => toast.error('Could not delete idea'),
  })

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap gap-3'>
        <div className='flex flex-1 items-center gap-3 rounded-2xl border border-secondary/12 bg-primary px-4 py-3'>
          <Search size={15} className='text-secondary/35' />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Search ideas...' className='flex-1 bg-transparent text-sm text-secondary placeholder:text-secondary/35 outline-none' />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className='rounded-2xl border border-secondary/12 bg-primary px-4 py-3 text-sm font-semibold text-secondary outline-none'>
          <option value=''>All statuses</option>
          {['draft', 'submitted', 'review', 'validated', 'rejected'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className='rounded-2xl border border-secondary/12 bg-primary shadow-[0_4px_24px_rgba(104,26,21,0.06)]'>
        {isLoading ? <TabSkeleton /> : ideas.length ? (
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[800px] text-sm'>
              <thead>
                <tr className='border-b border-secondary/8'>
                  {['Title', 'Owner', 'Status', 'Score', 'Created', 'Actions'].map((h) => (
                    <th key={h} className='px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-secondary/30'>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ideas.map((idea) => (
                  <tr key={idea.id} className='border-b border-secondary/6 transition-colors hover:bg-secondary/3 last:border-0'>
                    <td className='px-6 py-3'>
                      <Link to={`/ideas/${idea.id}`} className='font-semibold text-secondary hover:underline underline-offset-2 line-clamp-1'>{idea.title}</Link>
                      <p className='text-xs text-secondary/35'>{idea.sector}</p>
                    </td>
                    <td className='px-6 py-3 text-secondary/60'>{idea.owner?.username}</td>
                    <td className='px-6 py-3'>
                      <select
                        value={idea.status}
                        onChange={(e) => statusMutation.mutate({ id: idea.id, status: e.target.value })}
                        className='rounded-lg border border-secondary/20 bg-primary px-2 py-1 text-xs font-semibold text-secondary outline-none capitalize'
                      >
                        {['submitted', 'review', 'validated', 'rejected'].map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className='px-6 py-3 font-display font-black text-secondary'>{idea.global_score || 0}</td>
                    <td className='px-6 py-3 text-xs text-secondary/40'>{formatDate(idea.created_at)}</td>
                    <td className='px-6 py-3'>
                      <button onClick={() => setConfirmDelete(idea)} className='flex h-7 w-7 items-center justify-center rounded-lg border border-secondary/20 text-secondary/40 transition-colors hover:border-secondary/40 hover:text-secondary'>
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className='p-8'><EmptyState icon={Lightbulb} title='No ideas found' /></div>
        )}
      </div>

      <ConfirmModal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title={`Delete "${confirmDelete?.title}"?`} description='This will permanently delete the idea.' onConfirm={() => deleteMutation.mutate(confirmDelete.id)} loading={deleteMutation.isPending} />
    </div>
  )
}

/* ── FEEDBACKS ── */
function FeedbacksTab() {
  const qc = useQueryClient()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  // get all feedbacks via ideas list then aggregate — or use my-reviews for now
  const { data, isLoading } = useQuery({
    queryKey: ['admin-feedbacks'],
    queryFn: () => getFeedbacks().then((r) => r.data),
  })
  const feedbacks = normalizeList(data).filter((feedback) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return [feedback.idea_title, feedback.idea_owner_username, feedback.reviewer_username, feedback.comment]
      .some((value) => String(value || '').toLowerCase().includes(q))
  })

  const deleteMutation = useMutation({
    mutationFn: deleteFeedback,
    onSuccess: () => {
      toast.success('Feedback deleted')
      setConfirmDelete(null)
      qc.invalidateQueries({ queryKey: ['admin-feedbacks'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Could not delete feedback')),
  })

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-3 rounded-2xl border border-secondary/12 bg-primary px-4 py-3'>
        <Search size={15} className='text-secondary/35' />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Search feedbacks, ideas, reviewers...'
          className='flex-1 bg-transparent text-sm text-secondary placeholder:text-secondary/35 outline-none'
        />
      </div>
      {isLoading ? <TabSkeleton /> : feedbacks.length ? (
      <div className='grid gap-3 lg:grid-cols-2'>
        {feedbacks.map((feedback) => (
          <div key={feedback.id} className='rounded-xl border border-secondary/12 bg-primary p-4'>
            <div className='flex items-start justify-between gap-3'>
              <Link to={`/ideas/${feedback.idea}`} className='font-semibold text-secondary hover:underline underline-offset-2 line-clamp-1'>
                {feedback.idea_title || `Idea #${feedback.idea}`}
              </Link>
              <button onClick={() => setConfirmDelete(feedback)} className='flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-secondary/20 text-secondary/40 transition-colors hover:border-secondary/40 hover:text-secondary' aria-label='Delete feedback'>
                <Trash2 size={13} />
              </button>
            </div>
            <div className='mt-2 flex flex-wrap items-center gap-2 text-xs text-secondary/40'>
              <span>Reviewer: {feedback.reviewer_username || 'Unknown'}</span>
              <span>Owner: {feedback.idea_owner_username || 'Unknown'}</span>
              <span className='font-bold text-secondary'>{formatScore(feedback.weighted_score)}/10</span>
            </div>
            <p className='mt-3 line-clamp-3 text-sm leading-6 text-secondary/55'>{feedback.comment || 'No comment'}</p>
            <p className='mt-3 text-xs text-secondary/35'>{formatDate(feedback.created_at)}</p>
          </div>
        ))}
      </div>
      ) : (
        <div className='rounded-2xl border border-secondary/12 bg-primary p-8'>
          <EmptyState icon={MessageSquare} title='No feedbacks found' description='Feedbacks submitted by reviewers will appear here.' />
        </div>
      )}
      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title='Delete this feedback?'
        description='This will permanently delete the feedback and recalculate the idea score.'
        onConfirm={() => deleteMutation.mutate(confirmDelete.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}

/* ── CATEGORIES ── */
function CategoriesTab() {
  const qc = useQueryClient()
  const toast = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => getCategoriesList().then((r) => r.data),
  })
  const categories = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : [])

  const saveMutation = useMutation({
    mutationFn: (payload) => editing ? updateCategory(editing.id, payload) : createCategory(payload),
    onSuccess: () => {
      toast.success(editing ? 'Category updated' : 'Category created')
      setModalOpen(false); setEditing(null); reset()
      qc.invalidateQueries({ queryKey: ['admin-categories'] })
    },
    onError: () => toast.error('Could not save category'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => { toast.success('Category deleted'); setConfirmDelete(null); qc.invalidateQueries({ queryKey: ['admin-categories'] }) },
    onError: () => toast.error('Could not delete category'),
  })

  const openCreate = () => { setEditing(null); reset({ name: '', slug: '' }); setModalOpen(true) }
  const openEdit = (c) => { setEditing(c); reset({ name: c.name, slug: c.slug }); setModalOpen(true) }
  const addExisting = (c) => saveMutation.mutate({ name: c.name, slug: c.slug || makeSlug(c.name) })

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='font-display text-lg font-black text-secondary'>Existing Categories</h2>
          <p className='text-sm text-secondary/45'>Managed categories and sectors already used by ideas appear here.</p>
        </div>
        <Button onClick={openCreate}><PlusCircle size={14} /> New Category</Button>
      </div>

      {isLoading ? <TabSkeleton /> : categories.length ? (
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {categories.map((c) => (
            <div key={c.id}
              className='rounded-2xl border border-secondary/12 bg-primary p-5 shadow-[0_4px_16px_rgba(104,26,21,0.05)]'>
              <div className='mb-3 flex items-start justify-between'>
                <div>
                  <p className='font-display font-bold text-secondary'>{c.name}</p>
                  <div className='mt-1 flex flex-wrap items-center gap-2'>
                    <p className='text-xs text-secondary/40'>{c.slug}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${c.source === 'managed' ? 'border-secondary/20 bg-secondary/10 text-secondary/55' : 'border-secondary/12 bg-secondary/5 text-secondary/35'}`}>
                      {c.source === 'managed' ? 'Managed' : 'From ideas'}
                    </span>
                    <span className='text-[10px] font-semibold text-secondary/35'>{c.ideas_count || 0} ideas</span>
                  </div>
                </div>
                <div className='flex gap-1.5'>
                  {c.id ? (
                    <>
                      <button onClick={() => openEdit(c)} className='flex h-7 w-7 items-center justify-center rounded-lg border border-secondary/20 text-secondary/40 hover:text-secondary' aria-label='Edit category'>
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => setConfirmDelete(c)} className='flex h-7 w-7 items-center justify-center rounded-lg border border-secondary/20 text-secondary/40 hover:text-secondary' aria-label='Delete category'>
                        <Trash2 size={12} />
                      </button>
                    </>
                  ) : (
                    <button onClick={() => addExisting(c)} className='rounded-lg border border-secondary/20 px-2.5 py-1 text-xs font-semibold text-secondary/55 hover:text-secondary'>
                      Add
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='rounded-2xl border border-secondary/12 bg-primary p-8'>
          <EmptyState icon={Shield} title='No categories yet' description='Create your first category.' actionLabel='New Category' onAction={openCreate} />
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'New Category'}>
        <form onSubmit={handleSubmit((v) => saveMutation.mutate({ name: v.name, slug: v.slug || makeSlug(v.name) }))} className='space-y-4'>
          <div>
            <label className='mb-1.5 block text-xs font-semibold text-secondary/55'>Name</label>
            <input {...register('name', { required: 'Required' })} className='input-premium' placeholder='e.g. SaaS' />
            {errors.name && <p className='mt-1 text-xs text-secondary/50'>{errors.name.message}</p>}
          </div>
          <div>
            <label className='mb-1.5 block text-xs font-semibold text-secondary/55'>Slug (auto-generated if empty)</label>
            <input {...register('slug')} className='input-premium' placeholder='e.g. saas' />
          </div>
          <div className='flex justify-end gap-3'>
            <Button variant='ghost' type='button' onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type='submit' loading={saveMutation.isPending}>Save</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title={`Delete "${confirmDelete?.name}"?`} description='All ideas in this category will lose their category.' onConfirm={() => deleteMutation.mutate(confirmDelete.id)} loading={deleteMutation.isPending} />
    </div>
  )
}

/* ── SHARED ── */
function ConfirmModal({ open, onClose, title, description, onConfirm, loading }) {
  return (
    <Modal isOpen={open} onClose={onClose} title={title}>
      <p className='text-sm text-secondary/65'>{description}</p>
      <div className='mt-6 flex justify-end gap-3'>
        <Button variant='ghost' onClick={onClose}>Cancel</Button>
        <Button variant='danger' loading={loading} onClick={onConfirm}>Delete</Button>
      </div>
    </Modal>
  )
}

function OverviewList({ title, items, labelKey, valueKey }) {
  const max = Math.max(...items.map((item) => Number(item[valueKey] || 0)), 1)

  return (
    <div className='rounded-2xl border border-secondary/12 bg-primary p-6 shadow-[0_4px_24px_rgba(104,26,21,0.06)]'>
      <h2 className='mb-5 font-display text-base font-bold text-secondary'>{title}</h2>
      {items.length ? (
        <div className='space-y-3'>
          {items.map((item) => {
            const value = Number(item[valueKey] || 0)
            return (
              <div key={item[labelKey]} className='flex items-center gap-3'>
                <span className='w-24 shrink-0 text-xs font-semibold text-secondary/40'>{item[labelKey]}</span>
                <div className='h-2 flex-1 rounded-full bg-secondary/10'>
                  <div className='h-2 rounded-full bg-secondary' style={{ width: `${Math.min((value / max) * 100, 100)}%` }} />
                </div>
                <span className='w-8 text-right text-xs font-bold text-secondary'>{value}</span>
              </div>
            )
          })}
        </div>
      ) : (
        <p className='text-sm text-secondary/40'>No activity yet.</p>
      )}
    </div>
  )
}

function TabSkeleton() {
  return (
    <div className='space-y-3 p-6'>
      {Array.from({ length: 5 }).map((_, i) => <div key={i} className='h-12 animate-pulse rounded-xl bg-secondary/8' />)}
    </div>
  )
}

function normalizeList(data) {
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data)) return data
  return []
}

function formatScore(value) {
  const score = Number(value || 0)
  return Number.isInteger(score) ? String(score) : score.toFixed(1)
}

function makeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getErrorMessage(error, fallback) {
  const data = error?.response?.data
  if (!data) return fallback
  if (typeof data.detail === 'string') return data.detail
  if (typeof data.error === 'string') return data.error
  const first = Object.values(data)[0]
  if (Array.isArray(first)) return first[0]
  if (typeof first === 'string') return first
  return fallback
}
