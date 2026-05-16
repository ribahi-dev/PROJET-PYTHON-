import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import useNotifStore from '../../store/notifStore'

export default function NotifBell({ compact = false }) {
  const unreadCount = useNotifStore((s) => s.unreadCount)

  return (
    <Link
      to='/notifications'
      className={`relative flex items-center justify-center rounded-lg text-secondary/50 transition-colors hover:bg-secondary/10 hover:text-secondary ${compact ? 'h-7 w-7' : 'h-9 w-9'}`}
    >
      <Bell size={compact ? 14 : 18} />
      {unreadCount > 0 && (
        <span className='absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[9px] font-bold text-primary'>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  )
}
