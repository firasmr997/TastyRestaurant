import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router'
import { cn } from '@/utils/cn'
import { Spinner } from './Spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'inverse'
export type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'group/button relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-semibold ' +
  'transition-[background-color,color,border-color,transform,box-shadow] duration-200 ease-out ' +
  'active:translate-y-px disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-strong',
  secondary: 'bg-accent text-on-accent hover:bg-accent-strong',
  outline: 'border-2 border-current bg-transparent text-ink hover:bg-ink hover:text-bg',
  ghost: 'bg-transparent text-ink hover:bg-ink/8',
  danger: 'bg-danger text-white hover:bg-danger/90',
  inverse: 'bg-bg text-ink hover:bg-surface',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 rounded-control px-3.5 text-sm',
  md: 'h-11 rounded-control px-5 text-[0.95rem]',
  lg: 'h-14 rounded-control px-7 text-base',
}

interface CommonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  /** Trailing icon; nudges right on hover (e.g. an arrow). */
  iconRight?: ReactNode
  className?: string
  children?: ReactNode
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { to?: never; href?: never }
type LinkProps = CommonProps & { to: string; href?: never; onClick?: () => void; 'aria-label'?: string; state?: unknown }
type AnchorProps = CommonProps & { href: string; to?: never; target?: string; rel?: string; 'aria-label'?: string }

export function buttonClasses({ variant = 'primary', size = 'md', className }: Pick<CommonProps, 'variant' | 'size' | 'className'>) {
  return cn(base, variants[variant], sizes[size], className)
}

function Content({ loading, icon, iconRight, children }: CommonProps) {
  return (
    <>
      {loading ? <Spinner className="size-4" /> : icon}
      {children}
      {iconRight && (
        <span aria-hidden className="inline-flex transition-transform duration-300 ease-out group-hover/button:translate-x-1">
          {iconRight}
        </span>
      )}
    </>
  )
}

export function Button(props: ButtonProps | LinkProps | AnchorProps) {
  const { variant, size, loading, icon, iconRight, className, children } = props
  const classes = buttonClasses({ variant, size, className })
  const content = <Content loading={loading} icon={icon} iconRight={iconRight}>{children}</Content>

  if ('to' in props && props.to !== undefined) {
    return (
      <Link to={props.to} state={props.state} onClick={props.onClick} aria-label={props['aria-label']} className={classes}>
        {content}
      </Link>
    )
  }
  if ('href' in props && props.href !== undefined) {
    return (
      <a href={props.href} target={props.target} rel={props.rel} aria-label={props['aria-label']} className={classes}>
        {content}
      </a>
    )
  }
  const { variant: _v, size: _s, loading: _l, icon: _i, iconRight: _ir, className: _c, children: _ch, type, disabled, ...rest } =
    props as ButtonProps
  return (
    <button type={type ?? 'button'} disabled={disabled || loading} aria-busy={loading || undefined} className={classes} {...rest}>
      {content}
    </button>
  )
}

export function IconButton({
  label,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-10 shrink-0 items-center justify-center rounded-control text-ink transition-colors hover:bg-ink/8',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:pointer-events-none disabled:opacity-40',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
