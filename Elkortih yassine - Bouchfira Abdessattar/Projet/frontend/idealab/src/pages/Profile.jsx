import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Award,
  Calendar,
  Camera,
  Check,
  Lightbulb,
  MessageSquare,
  Pencil,
  Shield,
  Star,
  Upload,
  X,
} from 'lucide-react'
import { createElement, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getFeedbacks } from '../api/feedbacks.api'
import { getIdeas } from '../api/ideas.api'
import { getUserProfile, updateMyProfile } from '../api/users.api'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toast'
import useAuthStore from '../store/authStore'
import { formatDate, timeAgo } from '../utils/helpers'

const LEVEL_CONFIG = {
  Bronze: { style: 'border-secondary/25 bg-secondary/8 text-secondary/60', next: 'Silver', max: 50 },
  Silver: { style: 'border-secondary/40 bg-secondary/15 text-secondary/75', next: 'Gold', max: 150 },
  Gold: { style: 'border-secondary/60 bg-secondary/25 text-secondary', next: 'Expert', max: 300 },
  Expert: { style: 'border-secondary bg-secondary text-primary', next: null, max: 300 },
}

const STATUS_STYLES = {
  draft: 'bg-secondary/8 text-secondary/50 border-secondary/15',
  submitted: 'bg-secondary/15 text-secondary/70 border-secondary/25',
  review: 'bg-secondary/25 text-secondary border-secondary/35',
  validated: 'bg-secondary text-primary border-secondary',
  rejected: 'bg-secondary/8 text-secondary/40 border-secondary/15',
}

const roleLabels = {
  entrepreneur: 'Entrepreneur',
  reviewer: 'Reviewer',
  admin: 'Admin',
}

export default function Profile() {
  const { username } = useParams()
  const me = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const queryClient = useQueryClient()
  const toast = useToast()
  const [tab, setTab] = useState('about')
  const [editOpen, setEditOpen] = useState(false)

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', username],
    queryFn: () => getUserProfile(username).then((r) => r.data),
    staleTime: 0,
  })

  const isOwn = me?.username === username

  const { data: ideas = [], isLoading: ideasLoading } = useQuery({
    queryKey: ['profile-ideas', username],
    queryFn: async () => {
      const res = await getIdeas({ owner: username })
      return normalizeList(res.data)
    },
    enabled: !!user && user.role === 'entrepreneur',
  })

  const { data: feedbacks = [], isLoading: feedbacksLoading } = useQuery({
    queryKey: ['profile-feedbacks', username],
    queryFn: () => getFeedbacks(undefined).then((r) => {
      const all = normalizeList(r.data)
      return all.filter((f) => (f.reviewer_username || f.reviewer?.username) === username)
    }),
    enabled: !!user && user.role === 'reviewer' && isOwn,
  })

  const profile = useMemo(() => {
    if (!user) return null
    const hasReputation = user.role !== 'admin'
    const level = user.level || 'Bronze'
    const levelCfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.Bronze
    const reputation = Number(user.reputation_points || 0)
    const nextRemaining = Math.max(levelCfg.max - reputation, 0)
    return {
      level,
      levelCfg,
      reputation,
      nextRemaining,
      progress: Math.min((reputation / levelCfg.max) * 100, 100),
      hasReputation,
      fullName: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
      joined: user.date_joined ? formatDate(user.date_joined) : 'Unknown',
      roleLabel: roleLabels[user.role] || user.role || 'Member',
    }
  }, [user])

  if (isLoading) return <ProfileSkeleton />
  if (!user || !profile) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-primary px-6'>
        <EmptyState title='User not found' description='This profile does not exist.' />
      </div>
    )
  }

  const tabs = getTabs(user, ideas.length, feedbacks.length, isOwn)
  const activeTab = tabs.some((item) => item.key === tab) ? tab : 'about'
  const stats = [
    { icon: Lightbulb, label: 'Ideas', value: ideas.length, show: user.role === 'entrepreneur' },
    { icon: MessageSquare, label: 'Reviews', value: feedbacks.length, show: user.role === 'reviewer' },
    { icon: Star, label: 'Reputation', value: formatNumber(profile.reputation), show: profile.hasReputation },
    { icon: Calendar, label: 'Joined', value: profile.joined, show: true, compact: true },
  ].filter((item) => item.show)

  return (
    <div className='min-h-screen bg-primary text-secondary'>
      <section className='relative overflow-hidden bg-secondary'>
        <div className='absolute inset-0 opacity-[0.07]' style={{
          backgroundImage: 'linear-gradient(rgba(187,202,225,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(187,202,225,0.9) 1px, transparent 1px)',
          backgroundSize: '34px 34px',
        }} />
        <div className='mx-auto flex min-h-[250px] max-w-6xl items-end px-4 pb-10 pt-16 sm:px-6 lg:px-8'>
          <div className='relative z-10 flex w-full flex-col gap-6 md:flex-row md:items-end md:justify-between'>
            <div className='flex flex-col gap-5 sm:flex-row sm:items-end'>
              <div className='group relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-4 border-primary bg-secondary shadow-[0_20px_52px_rgba(0,0,0,0.18)] sm:h-28 sm:w-28'>
                <AvatarDisplay src={user.avatar} username={user.username} />
                {isOwn && (
                  <button
                    type='button'
                    aria-label='Edit profile photo'
                    onClick={() => setEditOpen(true)}
                    className='absolute inset-0 flex items-center justify-center bg-secondary/60 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100'
                  >
                    <Camera size={22} className='text-primary' />
                  </button>
                )}
              </div>

              <div className='min-w-0'>
                <div className='mb-3 flex flex-wrap items-center gap-2'>
                  {profile.hasReputation && (
                    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${profile.levelCfg.style}`}>
                      <Award size={13} /> {profile.level}
                    </span>
                  )}
                  <span className='inline-flex items-center gap-1 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-bold text-primary/70'>
                    <Shield size={13} /> {profile.roleLabel}
                  </span>
                </div>
                <h1 className='max-w-2xl break-words font-display text-4xl font-black leading-none text-primary sm:text-5xl'>
                  {profile.fullName}
                </h1>
                <div className='mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold text-primary/55'>
                  <span>@{user.username}</span>
                  {user.speciality && (
                    <>
                      <span className='h-1 w-1 rounded-full bg-primary/30' />
                      <span>{user.speciality}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {isOwn && (
              <Button size='sm' variant='secondary' onClick={() => setEditOpen(true)} className='self-start border-primary/25 text-primary hover:bg-primary/10 md:self-auto'>
                <Pencil size={14} /> Edit Profile
              </Button>
            )}
          </div>
        </div>
      </section>

      <main className='mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {stats.map(({ icon, label, value, compact }) => (
            <div
              key={label}
              className='rounded-xl border border-secondary/12 bg-secondary/5 p-5'
            >
              <div className='mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-secondary/12 bg-primary'>
                {createElement(icon, { size: 17, className: 'text-secondary/55' })}
              </div>
              <p className={`font-display font-black text-secondary ${compact ? 'text-lg' : 'text-3xl'}`}>{value}</p>
              <p className='mt-1 text-xs font-semibold text-secondary/40'>{label}</p>
            </div>
          ))}
        </div>

        <div className='mt-8 flex overflow-hidden rounded-xl border border-secondary/12 bg-secondary/5 p-1'>
          {tabs.map(({ key, label }) => (
            <button
              type='button'
              key={key}
              onClick={() => setTab(key)}
              className={`min-h-10 flex-1 rounded-lg px-3 text-sm font-bold transition-colors ${
                activeTab === key ? 'bg-secondary text-primary shadow-[0_8px_22px_rgba(104,26,21,0.14)]' : 'text-secondary/50 hover:text-secondary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className='py-8'>
          {activeTab === 'about' && (
            <AboutTab user={user} profile={profile} isOwn={isOwn} onEdit={() => setEditOpen(true)} />
          )}

          {activeTab === 'ideas' && (
            <IdeasTab ideas={ideas} loading={ideasLoading} />
          )}

          {activeTab === 'feedbacks' && (
            <FeedbacksTab feedbacks={feedbacks} loading={feedbacksLoading} />
          )}
        </div>
      </main>

      {isOwn && editOpen && (
        <ProfileEditModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          user={user}
          onSuccess={(updated) => {
            updateUser({ ...me, ...updated })
            queryClient.setQueryData(['user', username], (old) => ({ ...old, ...updated }))
            queryClient.invalidateQueries({ queryKey: ['user', username] })
            setEditOpen(false)
            toast.success('Profile updated')
          }}
        />
      )}
    </div>
  )
}

function AboutTab({ user, profile, isOwn, onEdit }) {
  return (
    <div className={`grid gap-6 ${profile.hasReputation ? 'lg:grid-cols-[1fr_360px]' : ''}`}>
      <section className='rounded-xl border border-secondary/12 bg-secondary/5 p-6'>
        <div className='mb-5 flex items-start justify-between gap-4'>
          <div>
            <p className='text-xs font-black uppercase text-secondary/35'>About</p>
            <h2 className='mt-1 font-display text-2xl font-black text-secondary'>Profile Summary</h2>
          </div>
          {isOwn && (
            <button
              type='button'
              onClick={onEdit}
              className='inline-flex h-9 w-9 items-center justify-center rounded-lg border border-secondary/15 text-secondary/55 hover:text-secondary'
              aria-label='Edit profile'
            >
              <Pencil size={15} />
            </button>
          )}
        </div>
        <p className='max-w-3xl text-sm leading-7 text-secondary/65'>
          {user.bio || (
            <span className='text-secondary/35'>
              {isOwn ? 'No bio yet. Add a short intro so reviewers and founders know what you work on.' : 'No bio has been added yet.'}
            </span>
          )}
        </p>

        <div className='mt-8 grid gap-3 sm:grid-cols-3'>
          <DetailItem icon={Shield} label='Role' value={profile.roleLabel} />
          <DetailItem icon={Star} label='Speciality' value={user.speciality || 'Not set'} />
          <DetailItem icon={Calendar} label='Joined' value={profile.joined} />
        </div>
      </section>

      {profile.hasReputation && (
        <aside className='rounded-xl border border-secondary/12 bg-secondary/5 p-6'>
          <p className='text-xs font-black uppercase text-secondary/35'>Reputation</p>
          <div className='mt-5 text-center'>
            <p className='font-display text-5xl font-black leading-none text-secondary'>{formatNumber(profile.reputation)}</p>
            <p className='mt-1 text-xs font-semibold text-secondary/40'>points earned</p>
          </div>
          <div className='mt-6 flex items-center justify-between text-xs'>
            <span className={`rounded-full border px-3 py-1 font-bold ${profile.levelCfg.style}`}>{profile.level}</span>
            {profile.levelCfg.next && <span className='font-semibold text-secondary/40'>{profile.levelCfg.next}</span>}
          </div>
          <div className='mt-3 h-2 overflow-hidden rounded-full bg-secondary/10'>
            <div className='h-full rounded-full bg-secondary transition-[width] duration-700' style={{ width: `${profile.progress}%` }} />
          </div>
          <p className='mt-3 text-center text-xs font-semibold text-secondary/35'>
            {profile.levelCfg.next ? `${formatNumber(profile.nextRemaining)} points to ${profile.levelCfg.next}` : 'Max level reached'}
          </p>
        </aside>
      )}
    </div>
  )
}

function IdeasTab({ ideas, loading }) {
  if (loading) return <ContentSkeleton />
  if (!ideas.length) {
    return <EmptyState icon={Lightbulb} title='No ideas yet' description='This entrepreneur has not submitted any ideas.' />
  }

  return (
    <div className='grid gap-4 md:grid-cols-2'>
      {ideas.map((idea) => (
        <article
          key={idea.id}
          className='group rounded-xl border border-secondary/12 bg-secondary/5 p-5 transition-shadow hover:shadow-[0_14px_36px_rgba(104,26,21,0.10)]'
        >
          <div className='mb-4 flex flex-wrap items-center gap-2'>
            <span className={`rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${STATUS_STYLES[idea.status] || STATUS_STYLES.draft}`}>
              {idea.status || 'draft'}
            </span>
            {idea.sector && <span className='text-xs font-semibold text-secondary/40'>{idea.sector}</span>}
            {hasScore(idea) && (
              <span className='ml-auto font-display text-base font-black text-secondary'>
                {formatScore(idea.global_score ?? idea.sgv_score)}<span className='text-xs text-secondary/35'>/10</span>
              </span>
            )}
          </div>
          <Link to={`/ideas/${idea.id}`} className='block'>
            <h3 className='font-display text-xl font-black leading-tight text-secondary group-hover:text-secondary/75'>{idea.title || 'Untitled idea'}</h3>
            <p className='mt-2 line-clamp-2 text-sm leading-6 text-secondary/50'>{idea.description || 'No description provided.'}</p>
          </Link>
          <p className='mt-4 text-xs font-semibold text-secondary/35'>{idea.created_at ? timeAgo(idea.created_at) : 'Recently added'}</p>
        </article>
      ))}
    </div>
  )
}

function FeedbacksTab({ feedbacks, loading }) {
  if (loading) return <ContentSkeleton />
  if (!feedbacks.length) {
    return <EmptyState icon={MessageSquare} title='No reviews yet' description='Submitted reviews will appear here.' />
  }

  return (
    <div className='space-y-4'>
      {feedbacks.map((feedback) => (
        <article
          key={feedback.id}
          className='rounded-xl border border-secondary/12 bg-secondary/5 p-5'
        >
          <div className='flex items-start justify-between gap-4'>
            <Link to={`/ideas/${feedback.idea?.id || ''}`} className='font-display text-lg font-black text-secondary hover:underline'>
              {feedback.idea?.title || 'Idea'}
            </Link>
            <span className='shrink-0 font-display text-2xl font-black text-secondary'>
              {formatScore(feedback.weighted_score)}<span className='text-xs text-secondary/35'>/10</span>
            </span>
          </div>

          <div className='mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4'>
            <ScorePill label='Market' value={feedback.market_score} />
            <ScorePill label='Innovation' value={feedback.innovation_score} />
            <ScorePill label='Feasibility' value={feedback.feasibility_score} />
            <ScorePill label='ROI' value={feedback.roi_score} />
          </div>

          {feedback.comment && <p className='mt-4 line-clamp-3 text-sm leading-6 text-secondary/55'>{feedback.comment}</p>}
          <p className='mt-3 text-xs font-semibold text-secondary/35'>{feedback.created_at ? timeAgo(feedback.created_at) : 'Recently reviewed'}</p>
        </article>
      ))}
    </div>
  )
}

function ProfileEditModal({ isOpen, onClose, user, onSuccess }) {
  const toast = useToast()
  const fileRef = useRef(null)
  const [preview, setPreview] = useState(user?.avatar || '')
  const [file, setFile] = useState(null)
  const [form, setForm] = useState(getInitialForm(user))

  useEffect(() => () => {
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
  }, [preview])

  const mutation = useMutation({
    mutationFn: (fd) => updateMyProfile(fd),
    onSuccess: (res) => onSuccess(res.data),
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const handleFile = (event) => {
    const nextFile = event.target.files?.[0]
    if (!nextFile) return

    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(nextFile.type)) {
      toast.error('Only JPEG, PNG or WebP images are allowed')
      return
    }
    if (nextFile.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB')
      return
    }

    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
    setFile(nextFile)
    setPreview(URL.createObjectURL(nextFile))
  }

  const handleSave = () => {
    const fd = new FormData()
    Object.entries(form).forEach(([key, value]) => fd.append(key, value.trim()))
    if (file) fd.append('avatar', file)
    mutation.mutate(fd)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Edit Profile'>
      <div className='space-y-5'>
        <div className='flex items-center gap-4'>
          <div className='relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-secondary/20 bg-secondary'>
            {preview ? (
              <img src={preview} alt='Profile preview' className='h-full w-full object-cover' />
            ) : (
              <div className='flex h-full w-full items-center justify-center font-display text-2xl font-black text-primary'>
                {(user?.username || 'U').slice(0, 2).toUpperCase()}
              </div>
            )}
            {preview && (
              <button
                type='button'
                onClick={() => {
                  if (preview.startsWith('blob:')) URL.revokeObjectURL(preview)
                  setPreview('')
                  setFile(null)
                }}
                className='absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-primary shadow'
                aria-label='Remove selected photo'
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className='min-w-0'>
            <button
              type='button'
              onClick={() => fileRef.current?.click()}
              className='inline-flex items-center gap-2 rounded-xl border border-secondary/20 px-3 py-2 text-sm font-bold text-secondary/70 hover:border-secondary/40 hover:text-secondary'
            >
              <Upload size={14} /> Upload photo
            </button>
            <p className='mt-2 text-xs text-secondary/35'>JPEG, PNG or WebP. Max 2MB.</p>
            <input ref={fileRef} type='file' accept='image/jpeg,image/png,image/webp' className='hidden' onChange={handleFile} />
          </div>
        </div>

        <div className='grid gap-3 sm:grid-cols-2'>
          <Field label='First name'>
            <input value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} className='input-premium' placeholder='First name' />
          </Field>
          <Field label='Last name'>
            <input value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} className='input-premium' placeholder='Last name' />
          </Field>
        </div>

        <Field label='Speciality'>
          <input value={form.speciality} onChange={(e) => setForm((f) => ({ ...f, speciality: e.target.value }))} className='input-premium' placeholder='SaaS, Fintech, AI...' />
        </Field>

        <Field label='Bio' hint={`${form.bio.length}/300`}>
          <textarea
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value.slice(0, 300) }))}
            rows={4}
            className='input-premium resize-none'
            placeholder='Tell the community about yourself...'
          />
        </Field>
      </div>

      <div className='mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end'>
        <Button variant='ghost' onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
        <Button loading={mutation.isPending} onClick={handleSave}>
          {mutation.isPending ? 'Saving...' : <><Check size={14} /> Save Changes</>}
        </Button>
      </div>
    </Modal>
  )
}

function AvatarDisplay({ src, username }) {
  const initials = (username || 'U').slice(0, 2).toUpperCase()
  if (src) return <img src={src} alt={username} className='h-full w-full object-cover' />
  return <div className='flex h-full w-full items-center justify-center bg-secondary font-display text-3xl font-black text-primary'>{initials}</div>
}

function DetailItem({ icon, label, value }) {
  return (
    <div className='rounded-xl border border-secondary/10 bg-primary p-4'>
      {createElement(icon, { size: 16, className: 'mb-3 text-secondary/45' })}
      <p className='text-xs font-black uppercase text-secondary/30'>{label}</p>
      <p className='mt-1 break-words text-sm font-bold text-secondary/70'>{value}</p>
    </div>
  )
}

function ScorePill({ label, value }) {
  return (
    <div className='rounded-lg border border-secondary/10 bg-primary p-3 text-center'>
      <p className='text-xs font-semibold text-secondary/35'>{label}</p>
      <p className='mt-1 font-display text-lg font-black text-secondary'>{formatScore(value)}</p>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <label className='block'>
      <span className='mb-1.5 flex items-center justify-between gap-3 text-xs font-bold text-secondary/55'>
        <span>{label}</span>
        {hint && <span className='font-semibold text-secondary/30'>{hint}</span>}
      </span>
      {children}
    </label>
  )
}

function ProfileSkeleton() {
  return (
    <div className='min-h-screen bg-primary'>
      <div className='h-[250px] animate-pulse bg-secondary/15' />
      <div className='mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, index) => <div key={index} className='h-32 animate-pulse rounded-xl bg-secondary/10' />)}
        </div>
        <div className='mt-8 h-12 animate-pulse rounded-xl bg-secondary/10' />
        <div className='mt-8 h-72 animate-pulse rounded-xl bg-secondary/10' />
      </div>
    </div>
  )
}

function ContentSkeleton() {
  return (
    <div className='grid gap-4 md:grid-cols-2'>
      {Array.from({ length: 4 }).map((_, index) => <div key={index} className='h-44 animate-pulse rounded-xl bg-secondary/10' />)}
    </div>
  )
}

function getTabs(user, ideasCount, feedbacksCount, isOwn) {
  return [
    { key: 'about', label: 'About' },
    ...(user.role === 'entrepreneur' ? [{ key: 'ideas', label: `Ideas${ideasCount ? ` (${ideasCount})` : ''}` }] : []),
    ...(user.role === 'reviewer' && isOwn ? [{ key: 'feedbacks', label: `Reviews${feedbacksCount ? ` (${feedbacksCount})` : ''}` }] : []),
  ]
}

function getInitialForm(user) {
  return {
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    bio: user?.bio || '',
    speciality: user?.speciality || '',
  }
}

function normalizeList(data) {
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data)) return data
  return []
}

function hasScore(idea) {
  return idea.global_score !== null && idea.global_score !== undefined
    ? Number(idea.global_score) > 0
    : Number(idea.sgv_score || 0) > 0
}

function formatScore(value) {
  const score = Number(value || 0)
  return Number.isInteger(score) ? String(score) : score.toFixed(1)
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(Number(value || 0))
}

function getErrorMessage(error) {
  const data = error?.response?.data
  if (!data) return 'Could not update profile'
  if (typeof data.detail === 'string') return data.detail
  if (typeof data.error === 'string') return data.error
  const firstValue = Object.values(data)[0]
  if (Array.isArray(firstValue)) return firstValue[0]
  if (typeof firstValue === 'string') return firstValue
  return 'Could not update profile'
}
