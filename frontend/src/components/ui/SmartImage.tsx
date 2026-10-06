import { useState, type ImgHTMLAttributes } from 'react'
import { LogoMark } from '@/components/brand/Logo'
import { cn } from '@/utils/cn'
import { imageSrcSet, resolveImageUrl, sizedImage } from '@/utils/image'

interface SmartImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  src: string | null | undefined
  alt: string
  /** Rendered width hint used for the default src (CDN-resizable sources only). */
  width?: number
  /** Classes for the wrapping frame (size, radius, aspect). */
  frameClassName?: string
  /** Eager-load images in the first viewport. */
  priority?: boolean
}

/**
 * Lazy, responsive image with a skeleton while loading and a branded fallback if the file is missing,
 * so a broken or deleted photo never shows the browser's broken-image icon.
 */
export function SmartImage({
  src,
  alt,
  width = 1080,
  sizes = '100vw',
  className,
  frameClassName,
  priority,
  ...rest
}: SmartImageProps) {
  const resolved = resolveImageUrl(src)
  // Load state is tracked per URL, so a source that arrives (or changes) after the first render loads normally.
  const [loaded, setLoaded] = useState<string | null>(null)
  const [failed, setFailed] = useState<string | null>(null)
  const status: 'loading' | 'loaded' | 'error' = !resolved || failed === resolved ? 'error' : loaded === resolved ? 'loaded' : 'loading'

  return (
    <span className={cn('relative block overflow-hidden bg-surface-2', frameClassName)}>
      {status === 'loading' && <span aria-hidden className="skeleton absolute inset-0" />}
      {status === 'error' ? (
        <span role="img" aria-label={alt} className="absolute inset-0 flex items-center justify-center bg-pickle">
          <LogoMark className="h-1/4 max-h-20 min-h-8 w-auto opacity-90" fill="var(--color-mustard)" letter="var(--color-ink)" />
        </span>
      ) : (
        <img
          src={sizedImage(resolved, width)}
          srcSet={imageSrcSet(resolved)}
          sizes={sizes}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onLoad={() => setLoaded(resolved ?? null)}
          onError={() => setFailed(resolved ?? null)}
          className={cn(
            'h-full w-full object-cover transition-[opacity,transform] duration-700 ease-out',
            status === 'loaded' ? 'opacity-100' : 'opacity-0',
            className,
          )}
          {...rest}
        />
      )}
    </span>
  )
}
