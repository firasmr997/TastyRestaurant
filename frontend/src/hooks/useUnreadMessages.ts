import { useEffect } from 'react'
import { useQuery } from '@/hooks/useQuery'
import { messageService } from '@/services/messageService'

export const UNREAD_KEY = 'messages:unread'

/** Unread contact messages for the sidebar badge and the notification bell; refreshed every minute. */
export function useUnreadMessages() {
  const query = useQuery(UNREAD_KEY, (signal) => messageService.unread(signal), { staleTime: 20_000 })
  const { refetch } = query
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') refetch()
    }, 60_000)
    return () => window.clearInterval(timer)
  }, [refetch])
  return query
}
