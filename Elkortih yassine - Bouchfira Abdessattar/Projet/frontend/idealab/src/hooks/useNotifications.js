import { useQuery } from '@tanstack/react-query'
import { getNotifs } from '../api/notifications.api'
import useAuthStore from '../store/authStore'
import useNotifStore from '../store/notifStore'

export default function useNotifications() {
  const token = useAuthStore((s) => s.token)
  const setUnreadCount = useNotifStore((s) => s.setUnreadCount)

  return useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: async () => {
      const res = await getNotifs({ is_read: false })
      const results = Array.isArray(res.data?.results) ? res.data.results : (Array.isArray(res.data) ? res.data : [])
      setUnreadCount(results.length)
      return results
    },
    enabled: !!token,
    refetchInterval: 30000,
  })
}
