import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/context/AuthContext'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'

/** CMS frame: fixed sidebar on desktop, drawer on smaller screens, sticky top bar. */
export function AdminLayout() {
  const { logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [drawer, setDrawer] = useState(false)
  useLockBodyScroll(drawer)

  useEffect(() => setDrawer(false), [pathname])
  useEffect(() => {
    document.title = 'Admin · Tasty'
    document.documentElement.lang = 'en'
    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (!robots) {
      robots = document.createElement('meta')
      robots.name = 'robots'
      document.head.appendChild(robots)
    }
    robots.content = 'noindex, nofollow'
  }, [])

  const handleLogout = () => {
    logout('manual')
    toast.success('Signed out', 'See you next service.')
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-dvh bg-surface-2">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <AdminSidebar onLogout={handleLogout} />
      </aside>
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-overlay/60 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] shadow-overlay lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <AdminSidebar onNavigate={() => setDrawer(false)} onLogout={handleLogout} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <div className="flex min-h-dvh flex-col lg:pl-64">
        <AdminTopbar onOpenSidebar={() => setDrawer(true)} />
        <main id="admin-main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
