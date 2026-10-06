import { Link } from 'react-router'
import { localizePath } from '@/i18n/locale'
import type { Locale } from '@/i18n/types'
import { useI18n } from '@/i18n/useI18n'
import { cn } from '@/utils/cn'

/** EN | FR as two ruled cells; the current language floods with tomato. */
export function LanguageSwitch({ className, tone = 'light' }: { className?: string; tone?: 'light' | 'dark' }) {
  const { locale, basePath, t } = useI18n()
  const languages: { code: Locale; label: string; name: string }[] = [
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'fr', label: 'FR', name: 'Français' },
  ]
  return (
    <nav aria-label={t.a11y.language} className={cn('flex', className)}>
      {languages.map((language, index) => (
        <Link
          key={language.code}
          to={localizePath(basePath, language.code) + window.location.search}
          hrefLang={language.code}
          lang={language.code}
          aria-label={language.name}
          aria-current={language.code === locale ? 'page' : undefined}
          className={cn(
            'cell !min-h-9 !px-2.5 !text-sm',
            index > 0 && (tone === 'dark' ? 'border-l-[1.5px] border-label/40' : 'border-l-[1.5px] border-ink/25'),
          )}
        >
          {language.label}
        </Link>
      ))}
    </nav>
  )
}
