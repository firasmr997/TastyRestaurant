import { Outlet, ScrollRestoration } from 'react-router'
import { ConfirmProvider } from '@/components/ui/ConfirmDialog'
import { ToastProvider } from '@/components/ui/Toast'
import { AuthProvider } from '@/context/AuthContext'
import { SettingsProvider } from '@/context/SettingsContext'

/** Providers shared by the public site and the admin dashboard. */
export function RootLayout() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ToastProvider>
          <ConfirmProvider>
            <Outlet />
            <ScrollRestoration getKey={(location) => location.pathname} />
          </ConfirmProvider>
        </ToastProvider>
      </SettingsProvider>
    </AuthProvider>
  )
}
