import { AnimatePresence, motion } from 'framer-motion'
import {
  Bookmark, ChevronRight, Compass,
  Lightbulb, LogOut, PlusCircle, Bell, User, LayoutDashboard,
  ShieldCheck, ClipboardList,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLogout } from '../../hooks/useAuth'
import useAuthStore from '../../store/authStore'
import Avatar from '../ui/Avatar'
import NotifBell from '../notifications/NotifBell'

const ease = [0.22, 1, 0.36, 1]

const ENTREPRENEUR_LINKS = [
  { to: '/explore',      icon: Compass,       label: 'Explore' },
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/submit',       icon: PlusCircle,    label: 'Submit Idea' },
  { to: '/bookmarks',    icon: Bookmark,      label: 'Bookmarks' },
  { to: '/notifications',icon: Bell,          label: 'Notifications' },
]

const REVIEWER_LINKS = [
  { to: '/explore',      icon: Compass,       label: 'Explore' },
  { to: '/reviewer',     icon: ClipboardList, label: 'Review Queue' },
  { to: '/bookmarks',    icon: Bookmark,      label: 'Bookmarks' },
  { to: '/notifications',icon: Bell,          label: 'Notifications' },
]

const ADMIN_LINKS = [
  { to: '/explore',      icon: Compass,       label: 'Explore' },
  { to: '/admin',        icon: ShieldCheck,   label: 'Admin Panel' },
  { to: '/notifications',icon: Bell,          label: 'Notifications' },
]

function getLinks(role) {
  if (role === 'reviewer') return REVIEWER_LINKS
  if (role === 'admin')    return ADMIN_LINKS
  return ENTREPRENEUR_LINKS
}

export default function Sidebar() {
  const user          = useAuthStore((s) => s.user)
  const location      = useLocation()
  const logoutMutation = useLogout()
  const [collapsed, setCollapsed] = useState(false)

  const links = getLinks(user?.role)
  const dashPath = user?.role === 'reviewer' ? '/reviewer' : user?.role === 'admin' ? '/admin' : '/dashboard'

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.4, ease }}
      className='relative flex h-screen flex-col border-r border-secondary/12 bg-primary'
      style={{ minWidth: collapsed ? 72 : 240, position: 'relative' }}
    >
      {/* ── TOP: logo + collapse toggle ── */}
      <div className='flex h-16 items-center justify-between border-b border-secondary/10 px-4'>
        <AnimatePresence mode='wait'>
          {!collapsed && (
            <motion.div
              key='logo'
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.25, ease }}
            >
              <Link to={dashPath} className='flex items-center gap-2.5'>
                <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary'>
                  <Lightbulb size={14} className='text-primary' />
                </div>
                <span className='font-display text-lg font-black tracking-tight text-secondary'>
                  Idea<span className='text-secondary/45'>Lab</span>
                </span>
              </Link>
            </motion.div>
          )}
          {collapsed && (
            <motion.div
              key='icon'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='mx-auto'
            >
              <Link to={dashPath} className='flex h-7 w-7 items-center justify-center rounded-lg bg-secondary'>
                <Lightbulb size={14} className='text-primary' />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className='flex h-7 w-7 items-center justify-center rounded-lg border border-secondary/15 text-secondary/40 transition-colors hover:border-secondary/30 hover:text-secondary'
          >
            <ChevronRight size={13} />
          </button>
        )}
      </div>

      {/* expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className='mx-auto mt-3 flex h-7 w-7 items-center justify-center rounded-lg border border-secondary/15 text-secondary/40 transition-colors hover:border-secondary/30 hover:text-secondary'
        >
          <ChevronRight size={13} className='rotate-180' />
        </button>
      )}

      {/* ── USER CARD ── */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className='mx-3 mt-4 rounded-2xl border border-secondary/12 bg-secondary/5 p-3'
        >
          <div className='flex items-center gap-2.5'>
            <Avatar username={user?.username} src={user?.avatar} size='sm' />
            <div className='min-w-0 flex-1'>
              <p className='truncate text-xs font-bold text-secondary'>{user?.username}</p>
              <p className='text-[10px] capitalize text-secondary/45'>{user?.role}</p>
            </div>
            <NotifBell compact />
          </div>
        </motion.div>
      )}

      {collapsed && (
        <div className='mt-3 flex justify-center'>
          <Avatar username={user?.username} src={user?.avatar} size='sm' />
        </div>
      )}

      {/* ── NAV LINKS ── */}
      <nav className='mt-5 flex-1 space-y-0.5 overflow-y-auto px-2'>
        {!collapsed && (
          <p className='mb-2 px-3 text-[9px] font-bold uppercase tracking-widest text-secondary/30'>
            {user?.role === 'admin' ? 'Administration' : user?.role === 'reviewer' ? 'Review' : 'Workspace'}
          </p>
        )}

        {links.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                active
                  ? 'bg-secondary text-primary shadow-[0_4px_16px_rgba(104,26,21,0.18)]'
                  : 'text-secondary/60 hover:bg-secondary/8 hover:text-secondary'
              } ${collapsed ? 'justify-center px-0' : ''}`}
            >
              {active && !collapsed && (
                <motion.span
                  layoutId='sidebar-active'
                  className='absolute inset-0 rounded-xl bg-secondary'
                  transition={{ duration: 0.3, ease }}
                  style={{ zIndex: -1 }}
                />
              )}
              <Icon size={16} className={`shrink-0 ${active ? 'text-primary' : 'text-secondary/50 group-hover:text-secondary'}`} />
              {!collapsed && <span>{label}</span>}
              {active && !collapsed && (
                <span className='ml-auto h-1.5 w-1.5 rounded-full bg-primary/40' />
              )}
            </Link>
          )
        })}

        {/* Profile link */}
        {user && (
          <>
            {!collapsed && (
              <p className='mb-2 mt-5 px-3 text-[9px] font-bold uppercase tracking-widest text-secondary/30'>Account</p>
            )}
            <Link
              to={`/profile/${user?.username}`}
              title={collapsed ? 'My Profile' : undefined}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                location.pathname === `/profile/${user?.username}`
                  ? 'bg-secondary text-primary shadow-[0_4px_16px_rgba(104,26,21,0.18)]'
                  : 'text-secondary/60 hover:bg-secondary/8 hover:text-secondary'
              } ${collapsed ? 'justify-center px-0' : ''}`}
            >
              <User size={16} className='shrink-0' />
              {!collapsed && <span>My Profile</span>}
            </Link>
          </>
        )}
      </nav>

      {/* ── BOTTOM: sign out ── */}
      <div className='border-t border-secondary/10 p-3'>
        <button
          onClick={() => logoutMutation.mutate({ refresh: localStorage.getItem('refresh') })}
          title={collapsed ? 'Sign out' : undefined}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-secondary/50 transition-all hover:bg-secondary/8 hover:text-secondary ${collapsed ? 'justify-center px-0' : ''}`}
        >
          <LogOut size={15} className='shrink-0' />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </motion.aside>
  )
}
