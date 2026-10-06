import { localizePath } from '@/i18n/locale'
import type { Locale } from '@/i18n/types'
import type { MenuItem, Settings } from '@/types/models'
import { resolveImageUrl } from './image'

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

/** schema.org Restaurant markup from the CMS settings (address, hours, contact, socials). */
export function restaurantJsonLd(settings: Settings, locale: Locale) {
  const origin = window.location.origin
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: settings.name,
    description: locale === 'fr' && settings.descriptionFr ? settings.descriptionFr : settings.description,
    url: origin + localizePath('/', locale),
    image: `${origin}/og-image.jpg`,
    logo: `${origin}/icon-512.png`,
    telephone: settings.phone ?? undefined,
    email: settings.email ?? undefined,
    servesCuisine: ['Burgers', 'Sandwiches', 'Grill'],
    acceptsReservations: false,
    hasMenu: origin + localizePath('/menu', locale),
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.addressLine ?? undefined,
      addressLocality: settings.city ?? undefined,
      postalCode: settings.postalCode ?? undefined,
      addressCountry: settings.country ?? undefined,
    },
    geo:
      settings.latitude != null && settings.longitude != null
        ? { '@type': 'GeoCoordinates', latitude: settings.latitude, longitude: settings.longitude }
        : undefined,
    sameAs: [settings.instagramUrl, settings.facebookUrl, settings.tiktokUrl].filter(Boolean),
    openingHoursSpecification: settings.openingHours
      .filter((h) => !h.closed && h.opensAt && h.closesAt)
      .map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${DAY_NAMES[h.dayOfWeek - 1]}`,
        opens: h.opensAt,
        closes: h.closesAt,
      })),
  }
}

/** schema.org MenuItem markup for a dish page. */
export function menuItemJsonLd(item: MenuItem, currency: string, locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MenuItem',
    name: locale === 'fr' && item.nameFr ? item.nameFr : item.name,
    description: locale === 'fr' && item.descriptionFr ? item.descriptionFr : item.description,
    image: resolveImageUrl(item.mainImage?.url),
    suitableForDiet: item.vegetarian ? 'https://schema.org/VegetarianDiet' : undefined,
    offers: {
      '@type': 'Offer',
      price: item.price.toFixed(2),
      priceCurrency: currency,
      availability: item.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  }
}
