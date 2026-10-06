import { KeyRound, Lock, Save } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ApiError } from '@/api/client'
import { LangTabs } from '@/components/admin/LangTabs'
import { PageHeader, Panel, PanelHeader } from '@/components/admin/AdminUi'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Skeleton } from '@/components/ui/Skeleton'
import { Switch } from '@/components/ui/Switch'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/context/AuthContext'
import { SETTINGS_QUERY_KEY } from '@/context/SettingsContext'
import { invalidateQueries, useQuery } from '@/hooks/useQuery'
import { authService } from '@/services/authService'
import { menuService } from '@/services/menuService'
import { settingsService } from '@/services/settingsService'
import type { OpeningHours, Settings, SettingsInput } from '@/types/models'
import { cn } from '@/utils/cn'
import { formatDateTime } from '@/utils/format'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/

function toInput(s: Settings): SettingsInput {
  const { promoMenuItem, updatedAt: _u, updatedBy: _b, ...rest } = s
  return { ...rest, promoMenuItemId: promoMenuItem?.id ?? null }
}

export default function SettingsPage() {
  const { user } = useAuth()
  const toast = useToast()
  const readOnly = user?.role !== 'ADMIN'
  const { data, isLoading } = useQuery(SETTINGS_QUERY_KEY, (signal) => settingsService.get(signal), { staleTime: 0 })
  const dishes = useQuery('admin:menu:options', (signal) => menuService.adminSearch({ size: 100, sort: 'name' }, signal))
  const [form, setForm] = useState<SettingsInput | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (data) setForm(toInput(data))
  }, [data])

  const dirty = useMemo(() => !!form && !!data && JSON.stringify(form) !== JSON.stringify(toInput(data)), [form, data])

  const set = <K extends keyof SettingsInput>(key: K, value: SettingsInput[K]) => {
    setForm((f) => (f ? { ...f, [key]: value } : f))
    setErrors((e) => ({ ...e, [key]: '' }))
  }

  const setDay = (day: number, changes: Partial<OpeningHours>) => {
    setForm((f) => (f ? { ...f, openingHours: f.openingHours.map((h) => (h.dayOfWeek === day ? { ...h, ...changes } : h)) } : f))
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!form) return
    const found: Record<string, string> = {}
    if (!form.name.trim()) found.name = 'The restaurant needs a name.'
    if (!/^[A-Z]{3}$/.test(form.currencyCode)) found.currencyCode = 'Use a three-letter code such as USD or EUR.'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) found.email = 'This email address does not look right.'
    form.openingHours.forEach((h) => {
      if (!h.closed && (!TIME.test(h.opensAt ?? '') || !TIME.test(h.closesAt ?? ''))) found[`hours-${h.dayOfWeek}`] = 'Use HH:mm for both times.'
    })
    if (form.promoEnabled && !form.promoTitle?.trim()) found.promoTitle = 'Give the special a title or switch it off.'
    setErrors(found)
    if (Object.keys(found).length) {
      toast.error('Check the highlighted fields')
      return
    }
    setSaving(true)
    try {
      await settingsService.update(form)
      invalidateQueries(SETTINGS_QUERY_KEY)
      toast.success('Settings saved', 'The website shows the new details now.')
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors.length) setErrors(err.byField)
      toast.error('Could not save the settings', err instanceof Error ? err.message : undefined)
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || !form) {
    return (
      <>
        <PageHeader title="Settings" />
        <div className="grid gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </>
    )
  }

  const text = (key: keyof SettingsInput) => (form[key] as string | null) ?? ''

  return (
    <>
      <PageHeader
        title="Settings"
        description="Restaurant details shown across the website: contact, hours, social links, announcement and chef's special."
      />
      {readOnly && (
        <p className="mb-6 flex items-center gap-2 rounded-control border border-info/30 bg-info/8 px-4 py-3 text-sm text-info">
          <Lock className="size-4 shrink-0" aria-hidden /> Only administrators can change these settings. You can still update your own password below.
        </p>
      )}

      <form noValidate onSubmit={onSubmit}>
        <fieldset disabled={readOnly} className="grid gap-6 xl:grid-cols-2">
          <Panel>
            <PanelHeader title="Restaurant" description="Name, tagline and the short description used in the footer and search results." />
            <div className="flex flex-col gap-5 p-5 sm:p-6">
              <Field label="Restaurant name" required error={errors.name}>
                <Input value={form.name} onChange={(e) => set('name', e.target.value)} maxLength={80} />
              </Field>
              <LangTabs
                frFilled={!!(form.taglineFr && form.descriptionFr)}
                en={
                  <>
                    <Field label="Tagline">
                      <Input value={text('tagline')} onChange={(e) => set('tagline', e.target.value)} maxLength={200} />
                    </Field>
                    <Field label="Short description">
                      <Textarea rows={3} value={text('description')} onChange={(e) => set('description', e.target.value)} maxLength={1000} />
                    </Field>
                  </>
                }
                fr={
                  <>
                    <Field label="Slogan (français)">
                      <Input value={text('taglineFr')} onChange={(e) => set('taglineFr', e.target.value)} maxLength={200} />
                    </Field>
                    <Field label="Description courte (français)">
                      <Textarea rows={3} value={text('descriptionFr')} onChange={(e) => set('descriptionFr', e.target.value)} maxLength={1000} />
                    </Field>
                  </>
                }
              />
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Contact & location" />
            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
              <Field label="Street address" className="sm:col-span-2">
                <Input value={text('addressLine')} onChange={(e) => set('addressLine', e.target.value)} maxLength={200} />
              </Field>
              <Field label="City">
                <Input value={text('city')} onChange={(e) => set('city', e.target.value)} maxLength={100} />
              </Field>
              <Field label="Postal code">
                <Input value={text('postalCode')} onChange={(e) => set('postalCode', e.target.value)} maxLength={20} />
              </Field>
              <Field label="Country">
                <Input value={text('country')} onChange={(e) => set('country', e.target.value)} maxLength={100} />
              </Field>
              <Field label="Currency" required error={errors.currencyCode} hint="ISO code used for menu prices.">
                <Select value={form.currencyCode} onChange={(e) => set('currencyCode', e.target.value)}>
                  {['USD', 'EUR', 'GBP', 'CAD', 'CHF', 'TND', 'MAD', 'AED'].map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Phone" error={errors.phone}>
                <Input type="tel" value={text('phone')} onChange={(e) => set('phone', e.target.value)} maxLength={40} />
              </Field>
              <Field label="Email" error={errors.email}>
                <Input type="email" value={text('email')} onChange={(e) => set('email', e.target.value)} maxLength={255} />
              </Field>
              <Field label="Directions link" hint="A Google Maps or other map URL for the “Get directions” button." error={errors.mapUrl} className="sm:col-span-2">
                <Input type="url" value={text('mapUrl')} onChange={(e) => set('mapUrl', e.target.value)} placeholder="https://maps.google.com/…" />
              </Field>
            </div>
          </Panel>

          <Panel className="xl:col-span-2">
            <PanelHeader title="Opening hours" description="A closing time earlier than the opening time means the service runs past midnight." />
            <div className="divide-y divide-line">
              {form.openingHours
                .slice()
                .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                .map((h) => (
                  <div key={h.dayOfWeek} className="grid items-center gap-3 px-5 py-3 sm:grid-cols-[9rem_auto_1fr] sm:px-6">
                    <span className="font-semibold">{DAYS[h.dayOfWeek - 1]}</span>
                    <Switch size="sm" label="Open" checked={!h.closed} onChange={(open) => setDay(h.dayOfWeek, { closed: !open })} />
                    <div className={cn('flex flex-wrap items-center gap-2', h.closed && 'opacity-40')}>
                      <label className="sr-only" htmlFor={`opens-${h.dayOfWeek}`}>
                        {DAYS[h.dayOfWeek - 1]} opens at
                      </label>
                      <Input
                        id={`opens-${h.dayOfWeek}`}
                        type="time"
                        value={h.opensAt ?? ''}
                        disabled={h.closed || readOnly}
                        onChange={(e) => setDay(h.dayOfWeek, { opensAt: e.target.value })}
                        className="tnum w-32"
                      />
                      <span className="text-ink-muted">to</span>
                      <label className="sr-only" htmlFor={`closes-${h.dayOfWeek}`}>
                        {DAYS[h.dayOfWeek - 1]} closes at
                      </label>
                      <Input
                        id={`closes-${h.dayOfWeek}`}
                        type="time"
                        value={h.closesAt ?? ''}
                        disabled={h.closed || readOnly}
                        onChange={(e) => setDay(h.dayOfWeek, { closesAt: e.target.value })}
                        className="tnum w-32"
                      />
                      {errors[`hours-${h.dayOfWeek}`] && <span className="text-xs font-medium text-danger">{errors[`hours-${h.dayOfWeek}`]}</span>}
                    </div>
                  </div>
                ))}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Social links" />
            <div className="flex flex-col gap-5 p-5 sm:p-6">
              <Field label="Instagram" error={errors.instagramUrl}>
                <Input type="url" value={text('instagramUrl')} onChange={(e) => set('instagramUrl', e.target.value)} placeholder="https://instagram.com/…" />
              </Field>
              <Field label="Facebook" error={errors.facebookUrl}>
                <Input type="url" value={text('facebookUrl')} onChange={(e) => set('facebookUrl', e.target.value)} placeholder="https://facebook.com/…" />
              </Field>
              <Field label="TikTok" error={errors.tiktokUrl}>
                <Input type="url" value={text('tiktokUrl')} onChange={(e) => set('tiktokUrl', e.target.value)} placeholder="https://tiktok.com/@…" />
              </Field>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Announcement & chef's special" description="The announcement scrolls under the homepage hero; the special gets its own homepage section." />
            <div className="flex flex-col gap-5 p-5 sm:p-6">
              <LangTabs
                frFilled={!!form.announcementFr}
                en={
                  <Field label="Announcement" hint="Leave empty to hide the ticker.">
                    <Input value={text('announcement')} onChange={(e) => set('announcement', e.target.value)} maxLength={200} />
                  </Field>
                }
                fr={
                  <Field label="Annonce (français)">
                    <Input value={text('announcementFr')} onChange={(e) => set('announcementFr', e.target.value)} maxLength={200} />
                  </Field>
                }
              />
              <Switch label="Show the chef's special" checked={form.promoEnabled} onChange={(v) => set('promoEnabled', v)} />
              <LangTabs
                frFilled={!!(form.promoTitleFr && form.promoTextFr)}
                en={
                  <>
                    <Field label="Special title" error={errors.promoTitle}>
                      <Input value={text('promoTitle')} onChange={(e) => set('promoTitle', e.target.value)} maxLength={120} />
                    </Field>
                    <Field label="Special text">
                      <Textarea rows={3} value={text('promoText')} onChange={(e) => set('promoText', e.target.value)} maxLength={500} />
                    </Field>
                  </>
                }
                fr={
                  <>
                    <Field label="Titre (français)">
                      <Input value={text('promoTitleFr')} onChange={(e) => set('promoTitleFr', e.target.value)} maxLength={120} />
                    </Field>
                    <Field label="Texte (français)">
                      <Textarea rows={3} value={text('promoTextFr')} onChange={(e) => set('promoTextFr', e.target.value)} maxLength={500} />
                    </Field>
                  </>
                }
              />
              <Field label="Dish shown with the special">
                <Select value={form.promoMenuItemId ?? ''} onChange={(e) => set('promoMenuItemId', e.target.value ? Number(e.target.value) : null)}>
                  <option value="">No dish</option>
                  {dishes.data?.content.map((dish) => (
                    <option key={dish.id} value={dish.id}>
                      {dish.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </Panel>
        </fieldset>

        {!readOnly && (
          <div className="sticky bottom-0 z-20 mt-6 flex items-center justify-between gap-3 rounded-panel border border-line bg-surface/95 px-5 py-3 shadow-card">
            <span className="text-sm text-ink-muted">
              {dirty ? 'Unsaved changes' : data?.updatedAt ? `Last saved ${formatDateTime(data.updatedAt)}${data.updatedBy ? ` by ${data.updatedBy}` : ''}` : ''}
            </span>
            <Button type="submit" loading={saving} disabled={!dirty} icon={!saving ? <Save className="size-4" /> : undefined}>
              Save settings
            </Button>
          </div>
        )}
      </form>

      <PasswordPanel />
    </>
  )
}

function PasswordPanel() {
  const toast = useToast()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirmValue, setConfirmValue] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const found: Record<string, string> = {}
    if (!current) found.currentPassword = 'Enter your current password.'
    if (next.length < 8 || !/[A-Za-z]/.test(next) || !/\d/.test(next)) found.newPassword = 'At least 8 characters with a letter and a number.'
    if (next !== confirmValue) found.confirm = 'The two passwords do not match.'
    setErrors(found)
    if (Object.keys(found).length) return
    setSaving(true)
    try {
      await authService.changePassword(current, next)
      toast.success('Password updated')
      setCurrent('')
      setNext('')
      setConfirmValue('')
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fieldErrors.length ? err.byField : { currentPassword: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Panel className="mt-6">
      <PanelHeader title="Your password" description="Change the password of the account you are signed in with." />
      <form noValidate onSubmit={onSubmit} className="grid gap-5 p-5 sm:grid-cols-3 sm:p-6">
        <Field label="Current password" error={errors.currentPassword}>
          <Input type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        </Field>
        <Field label="New password" error={errors.newPassword} hint="8+ characters, a letter and a number.">
          <Input type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
        </Field>
        <Field label="Confirm new password" error={errors.confirm}>
          <Input type="password" autoComplete="new-password" value={confirmValue} onChange={(e) => setConfirmValue(e.target.value)} />
        </Field>
        <div className="sm:col-span-3">
          <Button type="submit" variant="outline" loading={saving} icon={!saving ? <KeyRound className="size-4" /> : undefined}>
            Update password
          </Button>
        </div>
      </form>
    </Panel>
  )
}
