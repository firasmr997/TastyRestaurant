import { AnimatePresence, motion } from 'framer-motion'
import { CircleCheck, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { ApiError } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'
import { useI18n } from '@/i18n/useI18n'
import { contactService } from '@/services/contactService'
import { validateContact, type ContactValues } from '@/utils/validation'

const EMPTY: ContactValues = { name: '', email: '', phone: '', message: '' }

/** Contact form: validated in the browser, again by the API, and stored for the team in admin -> Messages. */
export function ContactForm() {
  const { t, fmt, locale } = useI18n()
  const toast = useToast()
  const [values, setValues] = useState<ContactValues>(EMPTY)
  const [website, setWebsite] = useState('')
  const [touched, setTouched] = useState<Partial<Record<keyof ContactValues, boolean>>>({})
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)

  const clientErrors = validateContact(values)
  const errorFor = (field: keyof ContactValues) => {
    if (serverErrors[field]) return serverErrors[field]
    const key = clientErrors[field]
    return touched[field] && key ? t.contact.errors[key] : undefined
  }

  const update = (field: keyof ContactValues) => (event: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [field]: event.target.value }))
    setServerErrors((e) => {
      const { [field]: _removed, ...rest } = e
      return rest
    })
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setTouched({ name: true, email: true, phone: true, message: true })
    if (Object.keys(clientErrors).length > 0) {
      const first = Object.keys(clientErrors)[0]
      document.getElementById(`contact-${first}`)?.focus()
      return
    }
    setSubmitting(true)
    try {
      await contactService.submit({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || undefined,
        message: values.message.trim(),
        locale,
        website,
      })
      setSentTo(values.name.trim().split(' ')[0])
      setValues(EMPTY)
      setTouched({})
      toast.success(t.contact.successTitle)
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors.length) setServerErrors(error.byField)
      toast.error(t.common.errorTitle, error instanceof ApiError ? error.message : undefined)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative rounded-panel bg-surface p-6 shadow-card sm:p-10">
      <AnimatePresence mode="wait" initial={false}>
        {sentTo ? (
          <motion.div
            key="sent"
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex min-h-[26rem] flex-col items-center justify-center gap-4 text-center"
          >
            <span className="inline-flex size-20 items-center justify-center rounded-full border-[3px] border-label bg-success text-white shadow-lift">
              <CircleCheck className="size-10" aria-hidden />
            </span>
            <h2 className="text-h3 text-pickle">{t.contact.successTitle}</h2>
            <p className="max-w-sm text-ink-muted">{fmt(t.contact.successText, { name: sentTo })}</p>
            <Button variant="outline" onClick={() => setSentTo(null)}>
              {t.contact.another}
            </Button>
          </motion.div>
        ) : (
          <motion.form key="form" noValidate onSubmit={onSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-5">
            <h2 className="text-h3 text-pickle">{t.contact.formTitle}</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t.contact.name} required error={errorFor('name')}>
                <Input id="contact-name" name="name" autoComplete="name" value={values.name} onChange={update('name')} onBlur={() => setTouched((v) => ({ ...v, name: true }))} maxLength={120} />
              </Field>
              <Field label={t.contact.email} required error={errorFor('email')}>
                <Input id="contact-email" name="email" type="email" autoComplete="email" inputMode="email" value={values.email} onChange={update('email')} onBlur={() => setTouched((v) => ({ ...v, email: true }))} maxLength={255} />
              </Field>
            </div>
            <Field label={<>{t.contact.phone} <span className="font-normal text-ink-muted">({t.contact.optional})</span></>} error={errorFor('phone')}>
              <Input id="contact-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" value={values.phone} onChange={update('phone')} onBlur={() => setTouched((v) => ({ ...v, phone: true }))} maxLength={40} />
            </Field>
            <Field label={t.contact.message} required error={errorFor('message')} hint={`${values.message.trim().length} / 4000`}>
              <Textarea
                id="contact-message"
                name="message"
                rows={6}
                placeholder={t.contact.messagePlaceholder}
                value={values.message}
                onChange={update('message')}
                onBlur={() => setTouched((v) => ({ ...v, message: true }))}
                maxLength={4000}
              />
            </Field>
            {/* Honeypot: hidden from people and assistive tech, irresistible to bots. */}
            <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label>
                Website
                <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} name="website" />
              </label>
            </div>
            <Button type="submit" size="lg" loading={submitting} icon={!submitting ? <Send className="size-4" /> : undefined} className="self-start font-display uppercase tracking-[0.06em]">
              {submitting ? t.contact.sending : t.contact.submit}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
