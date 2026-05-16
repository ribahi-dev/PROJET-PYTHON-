import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence, useScroll } from 'framer-motion'
import { Lightbulb, Menu, Search, X, ChevronDown, LayoutDashboard, Bookmark, User, LogOut, Bell } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { globalSearch } from '../../api/search.api'
import { useLogout } from '../../hooks/useAuth'
import useDebounce from '../../hooks/useDebounce'
import useAuthStore from '../../store/authStore'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import NotifBell from '../notifications/NotifBell'

const ease = [0.22, 1, 0.36, 1]

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/explore', label: 'Explore' },
]

export default function Navbar() {
  void motion
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  const navigate = useNavigate()
  const logoutMutation = useLogout()
  const queryClient = useQueryClient()

  const [openUser, setOpenUser]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openSearch, setOpenSearch] = useState(false)
  const [q, setQ]                   = useState('')
  const debounced                   = useDebounce(q, 300)
  const searchRef                   = useRef(null)
  const userRef                     = useRef(null)

  /* scroll-aware header */
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => scrollY.on('change', (v) => setScrolled(v > 24)), [scrollY])

  /* close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (!searchRef.current?.contains(e.target)) setOpenSearch(false)
      if (!userRef.current?.contains(e.target))   setOpenUser(false)
    }
    const esc = (e) => { if (e.key === 'Escape') { setOpenSearch(false); setOpenUser(false) } }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', esc) }
  }, [])

  /* close mobile on route change */
  useEffect(() => setMobileOpen(false), [location.pathname])

  const { data } = useQuery({
    queryKey: ['nav-search', debounced],
    queryFn: () => globalSearch(debounced).then((r) => r.data),
    enabled: debounced.length >= 2,
  })
  const ideas = Array.isArray(data?.ideas) ? data.ideas : []
  const users = Array.isArray(data?.users) ? data.users : []

  const navTo = (path) => { setOpenSearch(false); setMobileOpen(false); setQ(''); navigate(path) }
  const dashPath = user?.role === 'reviewer' ? '/reviewer' : user?.role === 'admin' ? '/admin' : '/dashboard'

  return (
    <>
      <motion.header
        animate={{
          backgroundColor: scrolled ? 'rgba(187,202,225,0.97)' : 'rgba(187,202,225,1)',
          boxShadow: scrolled ? '0 8px 40px rgba(104,26,21,0.12)' : '0 1px 0 rgba(104,26,21,0.08)',
        }}
        transition={{ duration: 0.3 }}
        className='relative sticky top-0 z-50 border-b border-secondary/15 backdrop-blur-md'
      >
        <nav className='mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6'>

          {/* ── LOGO ── */}
          <Link to='/' className='flex shrink-0 items-center gap-2.5 group'>
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ duration: 0.3, ease }}
              className='flex h-8 w-8 items-center justify-center rounded-lg bg-secondary'
            >
              <Lightbulb size={16} className='text-primary' />
            </motion.div>
            <span className='font-display text-xl font-black tracking-tight text-secondary'>
              Idea<span className='text-secondary/50'>Lab</span>
            </span>
          </Link>

          {/* ── NAV LINKS (desktop) ── */}
          <div className='hidden items-center gap-1 md:flex'>
            {NAV_LINKS.map(({ to, label }) => {
              const active = location.pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  onMouseEnter={() => to === '/explore' && queryClient.prefetchQuery({
                    queryKey: ['ideas', { page: 1 }],
                    queryFn: () => import('../../api/ideas.api').then((m) => m.getIdeas({ page: 1 }).then((r) => r.data)),
                  })}
                  className='relative px-4 py-2 text-sm font-semibold text-secondary/70 transition-colors duration-200 hover:text-secondary'
                >
                  {label}
                  {active && (
                    <motion.span
                      layoutId='nav-underline'
                      className='absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-secondary'
                      transition={{ duration: 0.35, ease }}
                    />
                  )}
                </Link>
              )
            })}
            {user && user.role !== 'admin' && (
              <Link
                to='/bookmarks'
                className={`relative px-4 py-2 text-sm font-semibold transition-colors duration-200 hover:text-secondary ${location.pathname === '/bookmarks' ? 'text-secondary' : 'text-secondary/70'}`}
              >
                Bookmarks
                {location.pathname === '/bookmarks' && (
                  <motion.span layoutId='nav-underline' className='absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-secondary' transition={{ duration: 0.35, ease }} />
                )}
              </Link>
            )}
          </div>

          {/* ── SEARCH (desktop) ── */}
          <div ref={searchRef} className='relative hidden flex-1 max-w-xs md:block lg:max-w-sm'>
            <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-all duration-200 ${openSearch || q ? 'border-secondary/40 bg-primary shadow-[0_4px_16px_rgba(104,26,21,0.10)]' : 'border-secondary/20 bg-secondary/5'}`}>
              <Search size={14} className='shrink-0 text-secondary/40' />
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setOpenSearch(true) }}
                onFocus={() => q.length >= 2 && setOpenSearch(true)}
                placeholder='Search ideas, people…'
                className='w-full bg-transparent text-sm text-secondary placeholder:text-secondary/35 outline-none'
              />
              {q && (
                <button onClick={() => { setQ(''); setOpenSearch(false) }} className='text-secondary/40 hover:text-secondary'>
                  <X size={13} />
                </button>
              )}
            </div>

            <AnimatePresence>
              {openSearch && q.length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.2, ease }}
                  className='absolute left-0 right-0 top-full mt-2 max-h-96 overflow-auto rounded-2xl border border-secondary/20 bg-primary p-2 shadow-[0_16px_48px_rgba(104,26,21,0.16)]'
                >
                  {ideas.length > 0 && (
                    <p className='px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-secondary/40'>Ideas</p>
                  )}
                  {ideas.map((i) => (
                    <button key={i.id} onClick={() => navTo(`/ideas/${i.id}`)} className='flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-secondary/8'>
                      <div>
                        <Badge variant='info' className='mb-1 text-[10px]'>{i.category_name || 'Category'}</Badge>
                        <p className='text-sm font-medium text-secondary'>{i.title}</p>
                      </div>
                      <span className='shrink-0 rounded-lg border border-secondary/20 bg-secondary/8 px-2 py-1 text-xs font-bold text-secondary'>{i.sgv_score || 0}</span>
                    </button>
                  ))}

                  {users.length > 0 && (
                    <p className='px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-secondary/40'>People</p>
                  )}
                  {users.map((u) => (
                    <button key={u.username} onClick={() => navTo(`/profile/${u.username}`)} className='flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-secondary/8'>
                      <Avatar src={u.avatar} username={u.username} size='sm' />
                      <div className='flex-1'>
                        <p className='text-sm font-semibold text-secondary'>{u.username}</p>
                        <p className='text-xs text-secondary/50'>{u.role || 'member'}</p>
                      </div>
                      <Badge>{u.role || 'user'}</Badge>
                    </button>
                  ))}

                  {!ideas.length && !users.length && (
                    <p className='px-3 py-4 text-center text-sm text-secondary/50'>No results for "<span className='font-semibold'>{q}</span>"</p>
                  )}

                  <div className='mt-1 border-t border-secondary/10 pt-1'>
                    <button onClick={() => navTo(`/search?q=${encodeURIComponent(q)}`)} className='flex w-full items-center justify-between rounded-xl bg-secondary px-3 py-2.5 text-sm font-semibold text-primary transition-opacity hover:opacity-90'>
                      See all results for "{q}"
                      <Search size={13} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── RIGHT ACTIONS (desktop) ── */}
          <div className='hidden items-center gap-3 md:flex'>
            {!user ? (
              <>
                <Link
                  to='/login'
                  className='px-4 py-2 text-sm font-semibold text-secondary/70 transition-colors hover:text-secondary'
                >
                  Sign in
                </Link>
                <Link to='/register'>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                    className='rounded-xl bg-secondary px-5 py-2 text-sm font-bold text-primary shadow-[0_4px_16px_rgba(104,26,21,0.20)] transition-opacity hover:opacity-90'
                  >
                    Get Started
                  </motion.button>
                </Link>
              </>
            ) : (
              <>
                <NotifBell />

                {/* user dropdown */}
                <div ref={userRef} className='relative'>
                  <button
                    onClick={() => setOpenUser((v) => !v)}
                    className='flex items-center gap-2 rounded-xl border border-secondary/20 bg-secondary/5 px-3 py-1.5 transition-all hover:border-secondary/40 hover:bg-secondary/10'
                  >
                    <Avatar username={user.username} src={user.avatar} size='sm' />
                    <div className='hidden text-left lg:block'>
                      <p className='text-xs font-bold text-secondary leading-tight'>{user.username}</p>
                      <p className='text-[10px] text-secondary/50 capitalize'>{user.role}</p>
                    </div>
                    <ChevronDown size={13} className={`text-secondary/50 transition-transform duration-200 ${openUser ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {openUser && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.2, ease }}
                        className='absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-2xl border border-secondary/20 bg-primary shadow-[0_16px_48px_rgba(104,26,21,0.16)]'
                      >
                        {/* user info header */}
                        <div className='border-b border-secondary/10 px-4 py-3'>
                          <p className='text-sm font-bold text-secondary'>{user.full_name || user.username}</p>
                          <p className='text-xs text-secondary/50'>{user.email}</p>
                        </div>

                        <div className='p-1.5'>
                          <DropItem icon={User} label='My Profile' to={`/profile/${user.username}`} onClick={() => setOpenUser(false)} />
                          <DropItem icon={LayoutDashboard} label='Dashboard' to={dashPath} onClick={() => setOpenUser(false)} />
                          {user.role !== 'admin' && <DropItem icon={Bookmark} label='Bookmarks' to='/bookmarks' onClick={() => setOpenUser(false)} />}
                        </div>

                        <div className='border-t border-secondary/10 p-1.5'>
                          <button
                            onClick={() => { setOpenUser(false); logoutMutation.mutate({ refresh: localStorage.getItem('refresh') }) }}
                            className='flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-secondary/60 transition-colors hover:bg-secondary/8 hover:text-secondary'
                          >
                            <LogOut size={14} />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

          {/* ── MOBILE HAMBURGER ── */}
          <button
            onClick={() => setMobileOpen(true)}
            className='flex h-9 w-9 items-center justify-center rounded-lg border border-secondary/20 text-secondary md:hidden'
          >
            <Menu size={18} />
          </button>
        </nav>
      </motion.header>

      {/* ── MOBILE DRAWER ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='fixed inset-0 z-[60] bg-secondary/30 backdrop-blur-sm md:hidden'
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.35, ease }}
              className='relative fixed inset-y-0 left-0 z-[70] flex w-72 flex-col bg-primary shadow-[8px_0_40px_rgba(104,26,21,0.15)] md:hidden'
            >
              {/* drawer header */}
              <div className='flex items-center justify-between border-b border-secondary/15 px-5 py-4'>
                <Link to='/' onClick={() => setMobileOpen(false)} className='flex items-center gap-2'>
                  <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-secondary'>
                    <Lightbulb size={14} className='text-primary' />
                  </div>
                  <span className='font-display text-lg font-black tracking-tight text-secondary'>IdeaLab</span>
                </Link>
                <button onClick={() => setMobileOpen(false)} className='flex h-8 w-8 items-center justify-center rounded-lg border border-secondary/20 text-secondary'>
                  <X size={16} />
                </button>
              </div>

              {/* mobile search */}
              <div className='border-b border-secondary/10 px-4 py-3'>
                <div className='flex items-center gap-2 rounded-xl border border-secondary/20 bg-secondary/5 px-3 py-2'>
                  <Search size={14} className='text-secondary/40' />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && q && navTo(`/search?q=${encodeURIComponent(q)}`)}
                    placeholder='Search…'
                    className='w-full bg-transparent text-sm text-secondary placeholder:text-secondary/35 outline-none'
                  />
                </div>
              </div>

              {/* nav links */}
              <nav className='flex-1 overflow-y-auto px-3 py-4'>
                <p className='mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-secondary/35'>Navigation</p>
                {[
                  { to: '/', label: 'Home' },
                  { to: '/explore', label: 'Explore Ideas' },
                  ...(user ? [
                    ...(user.role !== 'admin' ? [{ to: '/bookmarks', label: 'Bookmarks' }] : []),
                    { to: dashPath, label: 'Dashboard' },
                    { to: `/profile/${user?.username}`, label: 'My Profile' },
                  ] : []),
                ].map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${location.pathname === to ? 'bg-secondary/10 text-secondary' : 'text-secondary/65 hover:bg-secondary/6 hover:text-secondary'}`}
                  >
                    {label}
                    {location.pathname === to && <span className='ml-auto h-1.5 w-1.5 rounded-full bg-secondary' />}
                  </Link>
                ))}
              </nav>

              {/* bottom auth */}
              <div className='border-t border-secondary/15 p-4'>
                {!user ? (
                  <div className='flex flex-col gap-2'>
                    <Link to='/login' onClick={() => setMobileOpen(false)} className='rounded-xl border border-secondary/25 px-4 py-2.5 text-center text-sm font-semibold text-secondary'>
                      Sign in
                    </Link>
                    <Link to='/register' onClick={() => setMobileOpen(false)} className='rounded-xl bg-secondary px-4 py-2.5 text-center text-sm font-bold text-primary'>
                      Get Started Free
                    </Link>
                  </div>
                ) : (
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Avatar username={user.username} src={user.avatar} size='sm' />
                      <div>
                        <p className='text-sm font-bold text-secondary'>{user.username}</p>
                        <p className='text-xs capitalize text-secondary/50'>{user.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setMobileOpen(false); logoutMutation.mutate({ refresh: localStorage.getItem('refresh') }) }}
                      className='flex h-8 w-8 items-center justify-center rounded-lg border border-secondary/20 text-secondary/60'
                    >
                      <LogOut size={14} />
                    </button>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function DropItem({ icon: Icon, label, to, onClick }) {
  void Icon
  return (
    <Link
      to={to}
      onClick={onClick}
      className='flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-secondary/70 transition-colors hover:bg-secondary/8 hover:text-secondary'
    >
      <Icon size={14} className='text-secondary/50' />
      {label}
    </Link>
  )
}
