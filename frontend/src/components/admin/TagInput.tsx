import { X } from 'lucide-react'
import { useId, useState, type KeyboardEvent } from 'react'
import { cn } from '@/utils/cn'

interface TagInputProps {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  max?: number
  hint?: string
  error?: string
}

/** Chips for ingredients: Enter or comma adds, Backspace on an empty field removes the last chip. */
export function TagInput({ label, values, onChange, placeholder = 'Type and press Enter', max = 15, hint, error }: TagInputProps) {
  const id = useId()
  const [draft, setDraft] = useState('')

  const add = (raw: string) => {
    const parts = raw
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.length > 0 && part.length <= 60)
    const next = [...values]
    for (const part of parts) {
      if (next.length >= max) break
      if (!next.some((v) => v.toLowerCase() === part.toLowerCase())) next.push(part)
    }
    onChange(next)
    setDraft('')
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if ((event.key === 'Enter' || event.key === ',') && draft.trim()) {
      event.preventDefault()
      add(draft)
    } else if (event.key === 'Backspace' && !draft && values.length) {
      onChange(values.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <div
        className={cn(
          'flex min-h-11 flex-wrap items-center gap-1.5 rounded-control border bg-surface px-2 py-1.5 transition-[border-color,box-shadow]',
          'focus-within:border-focus focus-within:ring-4 focus-within:ring-focus/20',
          error ? 'border-danger' : 'border-line hover:border-ink/40',
        )}
      >
        {values.map((value, index) => (
          <span key={value} className="inline-flex items-center gap-1 rounded-full bg-pickle/10 py-1 pl-3 pr-1 text-sm font-medium text-pickle">
            {value}
            <button
              type="button"
              onClick={() => onChange(values.filter((_, i) => i !== index))}
              aria-label={`Remove ${value}`}
              className="inline-flex size-5 items-center justify-center rounded-full hover:bg-pickle/15"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => draft.trim() && add(draft)}
          placeholder={values.length >= max ? `Maximum ${max}` : placeholder}
          disabled={values.length >= max}
          aria-invalid={!!error}
          className="min-w-[10rem] flex-1 bg-transparent px-1.5 py-1 text-sm placeholder:text-ink-faint focus:outline-none"
        />
      </div>
      {error ? (
        <p role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : (
        <p className="text-xs text-ink-muted">{hint ?? `${values.length} / ${max}. Press Enter or comma to add.`}</p>
      )}
    </div>
  )
}
