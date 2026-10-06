import { LogIn } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { ApiError } from '@/api/client'
import { LogoMark, Wordmark } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { Field, Input, PasswordInput } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/context/AuthContext'
import { EMAIL_PATTERN } from '@/utils/validation'

export default function LoginPage() {
  const { login, isAuthenticated, sessionExpired } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const from = (location.state as { from?: string } | null)?.from ?? '/admin'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.title = 'Sign in · Tasty admin'
  }, [])

  if (isAuthenticated) return <Navigate to={from} replace />

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const errors: typeof fieldErrors = {}
    if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter the email address of your staff account.'
    if (!password) errors.password = 'Enter your password.'
    setFieldErrors(errors)
    if (Object.keys(errors).length) return
    setLoading(true)
    setError(null)
    try {
      const user = await login(email.trim(), password)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sign-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div data-tone="dark" className="relative hidden overflow-hidden bg-pickle p-12 text-label lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="label-frame absolute inset-5 rounded-[1.25rem] [--frame:var(--color-mustard)]" />
        <Link to="/" className="relative flex h-12 items-center gap-3" aria-label="Back to the Tasty website">
          <LogoMark className="h-full w-auto" fill="var(--color-mustard)" letter="var(--color-ink)" />
          <Wordmark variant="inline" className="h-[78%] w-auto" />
        </Link>
        <div className="relative">
          <p className="font-display text-[4rem] font-extrabold uppercase leading-[0.9]">
            The menu,
            <br />
            the photos,
            <br />
            <span className="text-mustard">the inbox.</span>
          </p>
          <p className="mt-6 max-w-sm text-pickle-soft">Everything guests see on the Tasty website is managed here.</p>
        </div>
        <img src="/brand/tasty-seal.svg" alt="" className="relative size-32 -rotate-12 self-end" />
      </div>

      <main className="flex items-center justify-center bg-surface-2 px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex h-11 items-center gap-2.5 lg:hidden">
            <LogoMark className="h-full w-auto" />
            <Wordmark variant="solid" className="h-[60%] w-auto text-pickle" />
          </div>
          <h1 className="font-display text-[2.75rem] font-extrabold uppercase leading-none text-pickle">Staff sign-in</h1>
          <p className="mt-2 text-ink-muted">Use your Tasty staff account.</p>

          {sessionExpired && !error && (
            <p role="status" className="mt-6 rounded-control border border-warning/40 bg-warning/12 px-4 py-3 text-sm text-warning-strong">
              Your session expired. Please sign in again.
            </p>
          )}
          {error && (
            <p role="alert" className="mt-6 rounded-control border border-danger/30 bg-danger/8 px-4 py-3 text-sm font-medium text-danger">
              {error}
            </p>
          )}

          <form noValidate onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
            <Field label="Email" error={fieldErrors.email} required>
              <Input type="email" autoComplete="username" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
            </Field>
            <Field label="Password" error={fieldErrors.password} required>
              <PasswordInput autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
            <Button type="submit" size="lg" loading={loading} icon={!loading ? <LogIn className="size-4" /> : undefined} className="mt-2 font-display uppercase tracking-[0.06em]">
              Sign in
            </Button>
          </form>

          {import.meta.env.DEV && (
            <p className="mt-8 rounded-control border border-dashed border-line bg-surface px-4 py-3 text-xs leading-relaxed text-ink-muted">
              <strong className="text-ink">Development only:</strong> admin@tasty.local / Admin123! (admin) or editor@tasty.local / Editor123! (editor). Seeded by the dev profile; never present in production.
            </p>
          )}
          <Link to="/" className="mt-8 inline-block text-sm font-semibold text-tomato-deep underline-offset-4 hover:underline">
            ← Back to the website
          </Link>
        </div>
      </main>
    </div>
  )
}
