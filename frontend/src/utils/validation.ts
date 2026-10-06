/** Client-side checks mirroring the API's Bean Validation rules (the server validates again). */

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const PHONE_PATTERN = /^[+0-9 ().-]{6,40}$/

export interface ContactValues {
  name: string
  email: string
  phone: string
  message: string
}

export type ContactErrorKey = 'nameRequired' | 'emailRequired' | 'emailInvalid' | 'phoneInvalid' | 'messageShort' | 'messageLong'

export function validateContact(values: ContactValues): Partial<Record<keyof ContactValues, ContactErrorKey>> {
  const errors: Partial<Record<keyof ContactValues, ContactErrorKey>> = {}
  if (!values.name.trim()) errors.name = 'nameRequired'
  if (!values.email.trim()) errors.email = 'emailRequired'
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'emailInvalid'
  if (values.phone.trim() && !PHONE_PATTERN.test(values.phone.trim())) errors.phone = 'phoneInvalid'
  const length = values.message.trim().length
  if (length < 10) errors.message = 'messageShort'
  else if (length > 4000) errors.message = 'messageLong'
  return errors
}
