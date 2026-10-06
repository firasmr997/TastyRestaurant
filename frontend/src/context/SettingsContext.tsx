import { createContext, useContext, type ReactNode } from 'react'
import { useQuery } from '@/hooks/useQuery'
import { settingsService } from '@/services/settingsService'
import type { Settings } from '@/types/models'

interface SettingsContextValue {
  settings: Settings | undefined
  isLoading: boolean
  currency: string
}

const SettingsContext = createContext<SettingsContextValue>({ settings: undefined, isLoading: true, currency: 'USD' })

export const SETTINGS_QUERY_KEY = 'settings'

/** Restaurant profile (address, hours, socials, currency, promotion) loaded once for the whole site. */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useQuery(SETTINGS_QUERY_KEY, (signal) => settingsService.get(signal), {
    staleTime: 5 * 60_000,
  })
  return (
    <SettingsContext.Provider value={{ settings: data, isLoading, currency: data?.currencyCode ?? 'USD' }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext)
}
